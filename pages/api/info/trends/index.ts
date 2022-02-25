import parse from "date-fns/parse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";


import getDate from "date-fns/getDate";
import { format, addDays } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import executeQuery from "../../../../lib/db";
import { ExtendedPersonnel } from "../../../../types/database";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        const selectedDate = new Date();
        if (req.method === "GET") {
            try {
                const personnel: ExtendedPersonnel[] = await executeQuery({
                    query: `SELECT personnel_ID FROM personnel LEFT JOIN ranks ON ranks.rank = personnel.rank WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(NOW()) AND DATE(post_in) <= DATE(NOW()) ORDER BY platoon ASC`,
                    values: [session.user.unit, session.user.company],
                });

                const personnelIDMap = personnel.map((x) => x.personnel_ID);

                const offData = await executeQuery({
                    query: `SELECT *, off_balance as count FROM personnel WHERE off_balance != 0 AND personnel_ID IN (?) ORDER BY off_balance DESC`,
                    values: [personnelIDMap],
                });

                const leaveData = await executeQuery({
                    query: `SELECT *, leave_balance as count FROM personnel WHERE leave_balance != 0 AND personnel_ID IN (?) ORDER BY leave_balance DESC`,
                    values: [personnelIDMap],
                });

                const attcData = await executeQuery({
                    query: `SELECT SUM(a.days) as count, a.personnel_ID, personnel.* FROM 
                (SELECT DATEDIFF(end, start)+1 as days, personnel_ID FROM attc_tracker) as a
                LEFT JOIN personnel ON a.personnel_ID = personnel.personnel_ID
                WHERE a.personnel_ID IN (?)
                GROUP BY a.personnel_ID ORDER BY SUM(a.days) DESC`,
                    values: [personnelIDMap],
                });

                const courseData = await executeQuery({
                    query: `SELECT SUM(a.days) as count, a.personnel_ID, personnel.* FROM 
                (SELECT DATEDIFF(end, start)+1 as days, personnel_ID FROM course_tracker) as a
                LEFT JOIN personnel ON a.personnel_ID = personnel.personnel_ID
                WHERE a.personnel_ID IN (?)
                GROUP BY a.personnel_ID ORDER BY SUM(a.days) DESC`,
                    values: [personnelIDMap],
                });

                const maData = await executeQuery({
                    query: `SELECT COUNT(*) as count, personnel.* FROM ma_tracker LEFT JOIN personnel ON ma_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.personnel_ID IN (?) GROUP BY personnel.personnel_ID ORDER BY count DESC`,
                    values: [personnelIDMap],
                });

                const othersData = await executeQuery({
                    query: `SELECT SUM(a.days) as count, a.personnel_ID, personnel.* FROM 
                (SELECT DATEDIFF(end, start)+1 as days, personnel_ID FROM others_tracker) as a
                LEFT JOIN personnel ON a.personnel_ID = personnel.personnel_ID
                WHERE a.personnel_ID IN (?)
                GROUP BY a.personnel_ID ORDER BY SUM(a.days) DESC`,
                    values: [personnelIDMap],
                });

                res.json({
                    topData: {
                        offData, leaveData, attcData, courseData, maData, othersData,
                    }
                })
            } catch (e) {
                console.log(e);
                res.status(400).json({
                    error: JSON.stringify(e),
                });
            }
        } else {
            res.json({});
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
