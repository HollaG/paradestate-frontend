import { format } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import Assignments from "../../../config/assignments.json";
import { Personnel } from "../../../types/database";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
        try {
            const selectedDate = new Date(); // TODO: change this to a user-selected one??
            const mysqlFormatted = format(selectedDate, "yyyy-MM-dd");
            const query =
                "SELECT * FROM personnel LEFT JOIN ranks ON personnel.`rank` = ranks.`rank` WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) ORDER BY ranks.rank_order DESC, personnel.name ASC";
            const values = [
                session.user.unit,
                session.user.company,
                mysqlFormatted,
            ];

            const activePersonnel: Personnel[] = await executeQuery({
                query,
                values,
            });

            const inactiveQuery =
                "SELECT * FROM personnel LEFT JOIN ranks ON personnel.`rank` = ranks.`rank` WHERE unit = ? AND company = ? AND DATE(ord) < DATE(?) ORDER BY ranks.rank_order DESC, personnel.name ASC";
            const inactivePersonnel: Personnel[] = await executeQuery({
                query: inactiveQuery,
                values,
            });

            const sortedByPlatoon = activePersonnel.reduce<{
                [key: string]: Personnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

            res.status(200).json({
                success: true,
                data: { sortedByPlatoon, inactivePersonnel },
            });
        } catch (e) {}
    }

    res.status(200).json({ name: "John Doe" });
}
