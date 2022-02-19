import { format } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../../../lib/db";
import Assignments from "../../../../../config/assignments.json";
import { ExtendedPersonnel, Personnel } from "../../../../../types/database";
import { queryBuilder } from "mysql-query-placeholders";
import bcrypt from "bcrypt";
import { formatMySQLDateHelper } from "../../../../../lib/custom";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
    } else if (req.method === "POST") {
        try {
            const { value, type, personnel_IDs } = req.body;
            if (!value || !type)
                return res.status(400).json({
                    message: "Missing required fields",
                });
            if (!personnel_IDs || !personnel_IDs.length)
                return res.status(400).json({
                    message: "Missing personnel IDs",
                });

            // ensure that type is one of the following values
            if (!["svc_status", "rank", "pes", "post_in", "ord"].includes(type))
                return res.status(400).json({
                    message: "Invalid type",
                });

            // convert to mysql date if needed
            let converted: string;
            if (type === "post_in" || type === "ord")
                converted = formatMySQLDateHelper(value);
            else converted = value.value;
            // Convert the selects cos it's in the form { label: x, value: x }

            console.log([type, converted, personnel_IDs]);
            await executeQuery({
                query: `UPDATE personnel SET ?? = ? WHERE personnel_ID IN (?)`,
                values: [type, converted, personnel_IDs],
            });

            res.status(200).json({
                success: true,
                data: {
                    editedNumber: personnel_IDs.length,
                },
            });

            const oldGroupID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM audit_log`,
                values: [],
            });

            const groupID = oldGroupID[0].max + 1;
            for (let personnel_ID of personnel_IDs) {
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
        } catch (e: any) {
            console.log(e);
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
