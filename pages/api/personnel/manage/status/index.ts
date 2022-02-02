import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery, { db } from "../../../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../../../types/database";
import { ExtendedStatus, Status } from "../../../../../types/types";
import Assignments from "../../../../../config/assignments.json";
import { format } from "date-fns";
import { StatusOption } from "../../../../personnel/manage/status";
export interface StatusData {
    sortedByPlatoon: {
        [key: string]: ExtendedPersonnel[];
    };
    selectedDate: string;
    formattedStatusList: {
        label: string;
        value: string;
    }[];
    statusesById: {
        [key: string]: ExtendedStatus[];
    };
}

export interface StatusAddedData {
    success: boolean;
    data: {
        sortedByPlatoon: any;
        statusDate: string[];
        statuses: StatusOption[];
        isPerm: any;
    };
}

// Expects selectedDate as a string in the format "YYYY-MM-DD"
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData | StatusAddedData | { error: any }>
) {
    const session = await getSession({ req });
    console.log({ session });
    if (!session) return res.status(401);

    if (req.method === "GET") {
        const selectedDate = req.query.date as string;

        try {
            // Select personnel along with `status_row_ID` --> null if not on status, number if on status
            const query =
                "select * from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(?) AND DATE(END) >= DATE(?)) group by personnel_ID) as a USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank`  WHERE DATE(personnel.ord) >= DATE(?) AND DATE(post_in) <= DATE(?) AND personnel.unit = ? AND personnel.company = ? ORDER BY status_row_ID ASC, platoon ASC, ranks.rank_order DESC, personnel.name ASC";
            const values = [
                selectedDate,
                selectedDate,
                selectedDate,
                selectedDate,
                session.user.unit,
                session.user.company,
            ];

            const personnel: ExtendedPersonnel[] = await executeQuery({
                query,
                values,
            });

            // Sort into platoon
            const sortedByPlatoon = personnel.reduce<any>((r, a) => {
                r[a.platoon as any] = [...(r[a.platoon as any] || []), a];
                return r;
            }, {});

            // Get all personnel statuses
            const query2 =
                "SELECT status_tracker.*, status_list.* FROM status_tracker LEFT JOIN personnel ON personnel.personnel_ID = status_tracker.personnel_ID LEFT JOIN status_list ON status_list.status_ID = status_tracker.status_ID WHERE type='perm' OR (DATE(start) <= DATE(?) AND DATE(END) >= DATE(?) AND DATE(personnel.ord) >= DATE(?) AND DATE(post_in) <= DATE(?) AND unit = ? AND company = ?) ";
            const values2 = [
                selectedDate,
                selectedDate,
                selectedDate,
                selectedDate,
                session.user.unit,
                session.user.company,
            ];

            const statuses: ExtendedStatus[] = await executeQuery({
                query: query2,
                values: values2,
            });
            console.log({ statuses });
            // Arrange by key
            const statusesById = statuses.reduce<any>((r, a) => {
                r[a.personnel_ID as any] = [
                    ...(r[a.personnel_ID as any] || []),
                    a,
                ];
                return r;
            }, {});

            // // Query 1: select all the personnel who are on status NOW
            // const query1 =
            //     "SELECT status_tracker.*, status_list.*, personnel.personnel_ID, personnel.name, personnel.pes, personnel.platoon FROM status_tracker LEFT JOIN status_list ON status_tracker.status_ID = status_list.status_ID LEFT JOIN personnel ON personnel.personnel_ID = status_tracker.personnel_ID LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) AND DATE(status_tracker.start) <= DATE(?) AND DATE(status_tracker.end) >= DATE(?)";
            // const values1 = [
            //     session.user.unit,
            //     session.user.company,
            //     selectedDate,
            //     selectedDate,
            //     selectedDate,
            // ];

            // // Query 2: select all the personnel who are NOT on status
            // const query2 =
            //     "SELECT personnel.personnel_ID, personnel.name, personnel.pes, personnel.platoon from personnel LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE personnel_ID NOT IN (select personnel_ID from status_tracker where ( DATE(start) <= DATE(?) AND DATE(end) >= DATE(?)))  AND DATE(ord)>=DATE(?) AND DATE(post_in) <= DATE(?) AND company = ? AND unit = ?";
            // const values2 = [
            //     selectedDate,
            //     selectedDate,
            //     selectedDate,
            //     selectedDate,
            //     session.user.company,
            //     session.user.unit,
            // ];
            // const personnelQuery =
            //     "SELECT * FROM personnel LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` LEFT JOIN status_tracker ON personnel.personnel_ID = status_tracker.personnel_ID WHERE DATE(ord) >= DATE(?) AND DATE(post_in) <= DATE(?) AND unit = ? AND company = ? AND DATE(status_tracker.start) <= DATE(?) AND DATE(status_tracker.end) >= DATE(?) ORDER BY platoon ASC, ranks.rank_order DESC, personnel.name ASC ";
            // const personnelValues = [
            //     selectedDate,
            //     selectedDate,
            //     session.user.unit,
            //     session.user.company,
            //     selectedDate,
            //     selectedDate,
            // ];

            // const personnel: ExtendedPersonnel[] = await executeQuery({
            //     query: personnelQuery,
            //     values: personnelValues,
            // });

            // Group by platoon, then group by personnelID
            // TODO: type this better

            // interface sortedByPlatoon {
            //     [key: string]: ExtendedPersonnel[];
            // }

            // interface Final {
            //     [key: string]: {
            //         [key: string]: Status;
            //     };
            // }

            // Object.keys(sortedByPlatoon).forEach((platoon) => {
            //     let tempObj = sortedByPlatoon[platoon].reduce((r: any, a: any) => {
            //         r[a.personnel_ID as any] = [
            //             ...(r[a.personnel_ID as any] || []),
            //             a,
            //         ];
            //         return r;
            //     }, {});
            //     sortedByPlatoon[platoon] = tempObj;
            // });

            const statusQuery = `SELECT status_ID, status_name FROM status_list`;

            // const statusPersonnel: ExtendedPersonnel[] = await executeQuery({
            //     query,
            //     values,
            // });
            const statusList: Status[] = await executeQuery({
                query: statusQuery,
            });
            const formattedStatusList = statusList.map((status) => ({
                label: status.status_name,
                value: status.status_ID,
            }));
            console.log({ personnel });

            // Group by personnelID for easy lookup when we iterate

            const data = {
                sortedByPlatoon,
                selectedDate,
                formattedStatusList,
                statusesById,
            };
            res.status(200).json(data);
        } catch (e) {
            console.log(e);
        }
        // res.status(200).json(data);
    } else if (req.method === "POST") {
        const data = req.body;
        const statusDate = (data["status-date"] as string[]).map((date) =>
            format(new Date(date), Assignments.mysqldateformat)
        );
        const isPerm = data["status-perm"];
        const statuses = data["status-selected"] as StatusOption[];

        const personnel_IDs = Object.keys(data)
            .filter((inputName) => inputName.startsWith("status-personnel") && data[inputName])
            .map((inputName) => Number(inputName.split("-")[2]));

        // Todo - serverside validation of personnel_ID

        const personnel: Personnel[] = await executeQuery({
            query: `SELECT * FROM personnel WHERE personnel_ID IN (?) AND unit = ? AND company = ?`,
            values: [personnel_IDs, session.user.unit, session.user.company],
        });
        if (personnel.length !== personnel_IDs.length)
            res.status(400).json({
                error: "Illegal operation - user has no perms to edit this personnel",
            });

        const oldGroupID = await executeQuery({
            query: `SELECT MAX(group_ID) as max FROM audit_log`,
            values: [],
        });
        const groupID = oldGroupID[0].max + 1;
        const txn = db.transaction();

        personnel_IDs.forEach((personnel_ID) => {
            statuses.forEach((status) => {
                let sql = ``;
                let values = [];
                if (isPerm) {
                    sql = `INSERT INTO status_tracker SET personnel_ID = ?, status_ID = ?, editor_ID = ?, type = "perm"`;
                    values = [personnel_ID, status.value, session.user.row_ID];
                } else {
                    sql = `INSERT INTO status_tracker SET personnel_ID = ?, start = ?, end = ?, status_ID = ?, editor_ID = ?, type = ""`;
                    values = [
                        personnel_ID,
                        statusDate[0],
                        statusDate[1],
                        status.value,
                        session.user.row_ID,
                    ];
                }
                txn.query(sql, values).query((r: any) => {
                    const auditSql = `INSERT INTO audit_log SET group_ID = ?, user_ID = ?, operation = "CREATE", type = "status", row_ID = ?, personnel_ID = ?, date = NOW()`;
                    const auditArr = [
                        groupID,
                        session.user.row_ID,
                        r.insertId,
                        personnel_ID,
                    ];
                    return [auditSql, auditArr];
                });
            });
        });

        txn.rollback(console.log);
        txn.commit();

        const sortedByPlatoon = personnel.reduce((r: any, a: any) => {
            r[a.platoon as any] = [...(r[a.platoon as any] || []), a];
            return r;
        }, {});
        const response = {
            success: true,
            data: {
                sortedByPlatoon,
                statusDate,
                statuses,
                isPerm,
            },
        };
        res.status(200).json(response);
    }
}
