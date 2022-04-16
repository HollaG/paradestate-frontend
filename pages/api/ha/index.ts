import { format } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../config/assignments.json";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    const currentDate = new Date(); // todo - let this be user-selectable
    const mysqlFormatted = format(currentDate, Assignments.mysqldateformat);
    const opts = {
        unit: session.user.unit,
        company: session.user.company,
        selDate: mysqlFormatted,
    };

    
    // console.log(query);
    const personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM personnel LEFT JOIN ranks ON ranks.rank = personnel.rank WHERE DATE(post_in) <= DATE(?) AND DATE(ord) >= DATE(?) AND unit = ? AND company = ?`,
        values: [opts.selDate, opts.selDate, opts.unit, opts.company],
    });

    // const objectified = [...personnel];


    // Order by platoon using reduce
    const sortedByPlatoon = personnel.reduce<{
        [key: string]: Personnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});
    res.json({sortedByPlatoon})

    
    // res.json(data);
}
