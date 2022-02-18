import { format } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../../../lib/db";
import Assignments from "../../../../../config/assignments.json";
import { ExtendedPersonnel, Personnel } from "../../../../../types/database";
import { queryBuilder } from "mysql-query-placeholders";
import bcrypt from "bcrypt";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
        try {
            // const selectedDate = new Date(); // TODO: change this to a user-selected one??
            // const mysqlFormatted = format(selectedDate, "yyyy-MM-dd");
            // // const query =
            // //     "SELECT * FROM personnel LEFT JOIN ranks ON personnel.`rank` = ranks.`rank` WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) ORDER BY ranks.rank_order DESC, personnel.name ASC";
            // const values = [
            //     session.user.unit,
            //     session.user.company,
            //     mysqlFormatted,
            // ];

            // // const activePersonnel: Personnel[] = await executeQuery({
            // //     query,
            // //     values,
            // // });

            // const inactiveQuery =
            //     "SELECT * FROM personnel LEFT JOIN ranks ON personnel.`rank` = ranks.`rank` WHERE unit = ? AND company = ? AND DATE(ord) < DATE(?) ORDER BY ranks.rank_order DESC, personnel.name ASC";
            // const inactivePersonnel: Personnel[] = await executeQuery({
            //     query: inactiveQuery,
            //     values,
            // });

            // // console.log(query);
            // const personnel: ExtendedPersonnel[] = await executeQuery({
            //     query: `SELECT * FROM personnel LEFT JOIN ranks ON ranks.rank = personnel.rank WHERE unit = ? AND company = ? AND DATE(post_in) <= DATE(NOW()) AND DATE(ord) >= DATE(NOW()) ORDER BY ranks.rank_order DESC, personnel.name ASC`,
            //     values: [session.user.unit, session.user.company],
            // })

            // const sortedByPlatoon = personnel.reduce<{
            //     [key: string]: ExtendedPersonnel[];
            // }>((r, a) => {
            //     r[a.platoon] = [...(r[a.platoon] || []), a];
            //     return r;
            // }, {});

            // res.status(200).json({
            //     sortedByPlatoon,
            //     inactivePersonnel,
            //     total: personnel.length + inactivePersonnel.length,
            // });

            const companies: {
                platoon: string;
                company: string;
                unit: string;
            }[] = await executeQuery({
                query: `SELECT DISTINCT platoon,company,unit FROM personnel `,
                values: [],
            });

            const sortedByUnit = companies.reduce<{
                [key: string]: {
                    platoon: string;
                    company: string;
                    unit: string;
                }[];
            }>((r, a) => {
                r[a.unit] = [...(r[a.unit] || []), a];
                return r;
            }, {});

            res.status(200).json(sortedByUnit);
        } catch (e: any) {
            console.log(e);
            res.status(400).json({
                error: e.toString(),
            });
        }
    } else if (req.method === "POST") {
        try {
            const { personnel_IDs, to } = req.body;
            const {
                unit: toUnit,
                company: toCompany,
                platoon: toPlatoon,
                password,
            } = to;

            if (!personnel_IDs.length || !toUnit || !toCompany || !toPlatoon)
                return res.status(400).json({ message: "Invalid request" });

            // ensure all exist
            const exists = await executeQuery({
                query: `SELECT personnel_ID from personnel WHERE unit = ? AND company = ? AND platoon = ?`,
                values: [toUnit, toCompany, toPlatoon],
            });
            if (!exists[0])
                return res
                    .status(400)
                    .json({ message: "Invalid platoon / company / unit" });

            // ensure user has permission to transfer selected personnel
            const personnel = await executeQuery({
                query: `SELECT personnel_ID from personnel WHERE personnel_ID in (?) AND unit = ? AND company = ?`,
                values: [
                    personnel_IDs,
                    session.user.unit,
                    session.user.company,
                ],
            });

            if (personnel.length !== personnel_IDs.length)
                return res
                    .status(400)
                    .json({ message: "No permissions for some personnel!" });

            if (
                toCompany === session.user.company &&
                toUnit === session.user.unit
            ) {
                // this is intra company transfer, no pw needed
            } else {
                // pw needed, validate
                if (!password)
                    return res
                        .status(400)
                        .json({ message: "Incorrect password!" });

                const oldPasswordObj = await executeQuery({
                    query: `SELECT password FROM company_list WHERE company = ? AND unit = ?`,
                    values: [toCompany, toUnit],
                });

                const dbPassword = oldPasswordObj[0].password;

                const result = await new Promise((resolve, reject) => {
                    bcrypt.compare(password, dbPassword, (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
                if (!result) {
                    return res
                        .status(400)
                        .json({ message: "Incorrect password!" });
                }
            }

            // transfer personnel
            // await executeQuery({
            //     query: `INSERT INTO personnel VALUES (?) ON DUPLICATE KEY UPDATE unit = VALUES(unit), company = VALUES(company), platoon = VALUES(platoon)`,
            //     values: [personnel_IDs.map((personnel_ID: string) => ({
            //         personnel_ID,
            //         unit: toUnit,
            //         company: toCompany,
            //         platoon: toPlatoon,
            //     }))],
            // });

            
            const oldGroupID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM audit_log`,
                values: [],
            });

            const groupID = oldGroupID[0].max + 1;
            for (let personnel_ID of personnel_IDs) {
                await executeQuery({
                    query: `UPDATE personnel SET unit = ?, company = ?, platoon = ? WHERE personnel_ID = ?`,
                    values: [toUnit, toCompany, toPlatoon, personnel_ID],
                })
                await executeQuery({
                    query: `INSERT INTO audit_log SET user_ID = ?, operation = "UPDATE", type = "personnel", row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`,
                    values: [
                        session.user.row_ID,
                        personnel_ID,
                        personnel_ID,
                        groupID,
                    ],
                });
            }

            res.status(200).json({
                success: true,
                data: { movedNumber: personnel_IDs.length, to },
            });
        } catch (e: any) {
            console.log(e);
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
