import { addDays, format, isAfter, subDays, subMonths } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../../config/assignments.json";
import { formatMySQLDateHelper, getDaysArray } from "../../../../lib/custom";
import executeQuery from "../../../../lib/db";
import { refreshAll } from "../../../../lib/ha";
import { Personnel } from "../../../../types/database";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    try {
        if (req.method === "POST") {
            const results = await refreshAll(
                session.user.company,
                session.user.unit
            );
            res.json({ success: true, result: results });
        }
    } catch (e) {
        console.log(e);
    }

    // res.json(data);
}

