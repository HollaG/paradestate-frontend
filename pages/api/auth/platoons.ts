import parse from "date-fns/parse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { EventData, HighlightedDay } from "../../../types/types";
import Assignments from "../../../config/assignments.json";
import getDate from "date-fns/getDate";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        console.log("bofore ssession");
        if (!session) return res.status(401);
        console.log("after session");
        if (req.method === "GET") {
            console.log(req.query);
            const { unit, company } = req.query;

            const platoons: { platoon: string }[] = await executeQuery({
                query: "SELECT DISTINCT platoon FROM personnel WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(NOW()) AND DATE(post_in) <= DATE(NOW())",
                values: [unit, company],
            });
            const mapped = platoons.map((platoon) => ({
                label: platoon.platoon,
                value: platoon.platoon,
            }));
            console.log(mapped)
            return res.status(200).json(mapped);
        } else {
            const { platoon, unit, company } = req.body
            try { 

                await executeQuery({
                    query: `UPDATE users SET platoon = ? WHERE unit = ? AND company = ? AND email = ?`,
                    values: [platoon || "", unit, company, session.user.email],
                })
    
                res.status(200).json({
                    success: true
                })
            } catch (e: any) { 
                res.status(400).json({
                    error: e.toString()
                })
            }
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
