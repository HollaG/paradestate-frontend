import { format, isBefore } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../../../lib/db";
import { Personnel } from "../../../../../types/database";
import Assignments from '../../../../../config/assignments.json'
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    const personnel_ID: string = req.query.p_ID.toString();
    if (req.method === "GET") {
        try {
            const person: Personnel[] = await executeQuery({
                query: "SELECT * FROM personnel WHERE personnel_ID = ? AND unit = ? AND company = ?",
                values: [personnel_ID, session.user.unit, session.user.company],
            });
            if (!person.length)
                return res
                    .status(400)
                    .json({ error: "Personnel not found or no permissions!" });

            res.status(200).json(person[0]);
        } catch (e: any) {
            res.status(400).json({
                error: e.toString(),
            });
        }
    } else if (req.method === "POST") {
        try {
            // ensure that the person has rights to edit this personnel
            const person: Personnel[] = await executeQuery({
                query: "SELECT * FROM personnel WHERE personnel_ID = ? AND unit = ? AND company = ?",
                values: [personnel_ID, session.user.unit, session.user.company],
            });

            if (!person.length)
                return res
                    .status(400)
                    .json({ error: "Personnel not found or no permissions!" });

            const { post_in, ord, name, pes, platoon, rank, svc_status } =
                req.body;

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
            const sql =
                "UPDATE personnel SET `rank` = ?, name = ?, pes = ?, post_in = ?, ord = ?, platoon = ?, section = ?, svc_status = ? WHERE personnel_ID = ?";
            const values = [
                rank,
                name.trim().toUpperCase(),
                pes,
                formattedPostIn,
                formattedORD,              
                
                platoon.trim().toUpperCase(),
                "UNASSIGNED",
                svc_status,
                personnel_ID
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

            const auditSql = `INSERT INTO audit_log SET group_ID = ?, user_ID = ?, operation = "UPDATE", type = "personnel", row_ID = ?, personnel_ID = ?, date = NOW()`;
            const auditArr = [
                groupID,
                session.user.row_ID,
                personnel_ID,
                personnel_ID
            ];

            await executeQuery({
                query: auditSql,
                values: auditArr,
            })

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
