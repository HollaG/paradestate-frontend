import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { changeToNextDayIfPastNoon } from "../../../../lib/custom";
import Assignments from "../../../../config/assignments.json";
import { format } from "date-fns";
import executeQuery from "../../../../lib/db";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<
        | {
              success: boolean;
              data: {
                  selectedDate: Date;
                  platoons: string[];
              };
          }
        | { error: any }
    >
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        if (req.method === "GET") {
            const selectedDate = changeToNextDayIfPastNoon(new Date());
            const mysqlFormatted = format(
                selectedDate,
                Assignments.mysqldateformat
            );
            const query = `SELECT DISTINCT platoon FROM personnel WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) AND DATE(post_in) <= DATE(?)`;
            const values = [
                session.user.unit,
                session.user.company,
                mysqlFormatted,
                mysqlFormatted,
            ];

            const queryResult: { platoon: string }[] = await executeQuery({
                query,
                values,
            });
            const platoons = queryResult.map((row) => row.platoon);
            platoons.push("Company")
            res.json({ success: true, data: { platoons, selectedDate } });
        } else {
            res.json({ error: "POST not supported" });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
