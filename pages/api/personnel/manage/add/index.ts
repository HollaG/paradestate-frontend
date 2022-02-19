import { format, isBefore } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery, { db } from "../../../../../lib/db";
import Assignments from "../../../../../config/assignments.json";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
        try {
            // Servce statuses
            // Ranks
            // PESes
            // Platoons
            const platoons: { platoon: string }[] = await executeQuery({
                query: "select distinct platoon from personnel WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(NOW()) AND DATE(post_in) <= DATE(NOW()) ORDER BY platoon ASC",
                values: [
                    session.user.unit,
                    session.user.company,
                    session.user.unit,
                    session.user.company,
                ],
            });
            const sections: { section: string }[] = await executeQuery({
                query: `SELECT DISTINCT section FROM personnel WHERE company = ? AND unit = ? AND DATE(ord) >= DATE(NOW()) AND DATE(post_in) <= DATE(NOW()) ORDER BY section ASC`,
                values: [session.user.company, session.user.unit],
            });

            res.status(200).json({
                platoons: platoons.map((platoon) => platoon.platoon),
                sections: sections.map((section) => section.section),
            });
        } catch (e: any) {
            res.status(400).json({
                error: e.toString(),
            });
        }
    } else {
        try {
            const { post_in, ord, name, pes, platoon, rank, svc_status } =
                req.body;
            console.log({
                post_in,
                ord,
                name,
                pes,
                platoon,
                rank,
                svc_status,
            });
            if (
                !post_in ||
                !ord ||
                !name ||
                !pes ||
                !platoon ||
                !rank ||
                !svc_status
            ) {
                throw new Error("Missing required fields");
            }

            if (isBefore(new Date(ord), new Date(post_in))) {
                throw new Error("ORD must be after post in date!");
            }

            const formattedPostIn = format(
                new Date(post_in),
                Assignments.mysqldateformat
            );
            const formattedORD = format(
                new Date(ord),
                Assignments.mysqldateformat
            );
            const alreadyExists = await executeQuery({
                query: `SELECT * FROM personnel WHERE name = ? AND ord = ?`,
                values: [name, formattedORD],
            });
            if (alreadyExists.length) throw new Error("Person already exists!");

            // const txn = db.transaction();
            const sql =
                "INSERT INTO personnel SET `rank` = ?, name = ?, pes = ?, post_in = ?, ord = ?, off_balance = ?, leave_balance = ?, unit = ?, company = ?, platoon = ?, section = ?, svc_status = ?";
            const values = [
                rank,
                name.trim().toUpperCase(),
                pes,
                formattedPostIn,
                formattedORD,
                0,
                0,
                session.user.unit,
                session.user.company,
                platoon.trim().toUpperCase(),
                "UNASSIGNED",
                svc_status,
            ];
            let group_ID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM audit_log`,
                values: [],
            });
            let groupID = group_ID[0].max + 1;

            const result = await executeQuery({
                query: sql,
                values,
            });
            const personnel_ID = result.insertId;
            const auditSql = `INSERT INTO audit_log SET group_ID = ?, user_ID = ?, operation = "CREATE", type = "personnel", row_ID = ?, personnel_ID = ?, date = NOW()`;
            const auditArr = [
                groupID,
                session.user.row_ID,
                personnel_ID,
                personnel_ID
            ];
            console.log(result, 'ksadfnka')
            await executeQuery({
                query: auditSql,
                values: auditArr,
            });
            // txn.query(sql, values).query((r: any) => {
            //     const auditSql = `INSERT INTO audit_log SET group_ID = ?, user_ID = ?, operation = "CREATE", type = "personnel", row_ID = ?, personnel_ID = ?, date = NOW()`;
            //     const auditArr = [
            //         groupID,
            //         session.user.row_ID,
            //         r.insertId,
            //         r.insertId,
            //     ];
            //     return [auditSql, auditArr];
            // });
            // txn.rollback((e: any) => {
            //     console.log(e);
            //     throw new Error(e.toString());
            // });
            // txn.commit();
            res.status(200).json({
                success: true,
                data: {
                    post_in,
                    ord,
                    name,
                    pes,
                    platoon,
                    rank,
                    svc_status,
                    personnel_ID
                },
           
            });
        } catch (e: any) {
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
