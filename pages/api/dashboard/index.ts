import parse from "date-fns/parse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { EventData, HighlightedDay } from "../../../types/types";
import Assignments from "../../../config/assignments.json";
import getDate from "date-fns/getDate";
import { format, addDays } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        let selectedDate = new Date();
        if (req.method === "GET") {
            let formattedDate = format(
                selectedDate,
                Assignments.mysqldateformat
            );

            if (format(selectedDate, "aaa") === "pm")
                selectedDate = addDays(selectedDate, 1);

            const opts = {
                unit: session.user.unit,
                company: session.user.company,
                selDate: selectedDate,
            };

            try {
                const query = queryBuilder(
                    "select * from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as a USING(personnel_ID) left join (SELECT personnel_ID, start as attc_start, end as attc_end, attc_name, row_ID as attc_row_ID FROM attc_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as b USING(personnel_ID) left join (SELECT personnel_ID, row_ID as course_row_ID, course_name, start as course_start, end as course_end FROM course_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as c USING(personnel_ID) left join (SELECT personnel_ID, start as leave_start, start_time as leave_start_time, end as leave_end, end_time as leave_end_time, reason as leave_reason, row_ID as leave_row_ID FROM leave_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as d USING(personnel_ID) left join (SELECT personnel_ID, start as off_start, start_time as off_start_time, end as off_end, end_time as off_end_time, reason as off_reason, row_ID as off_row_ID FROM off_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as e USING(personnel_ID) left join (SELECT personnel_ID, row_ID as others_row_ID, start as others_start, end as others_end, others_name, in_camp as others_incamp FROM others_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as f USING(personnel_ID) left join (SELECT personnel_ID, date as ma_date, time as ma_time, location as ma_location, ma_name, in_camp as ma_in_camp, row_ID as ma_row_ID FROM ma_tracker WHERE DATE(date) = DATE(:selDate) group by personnel_ID) as g USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE unit = :unit AND company = :company AND DATE(ord) >= DATE(:selDate) AND DATE(post_in) <= DATE(:selDate) ORDER BY platoon ASC, ranks.rank_order DESC, personnel.name ASC",
                    opts
                );
                // console.log(query);
                const personnel: ExtendedPersonnel[] = await executeQuery({
                    query: query.sql,
                    values: query.values,
                });

                const objectified = [...personnel];

                if (!objectified) return { props: {} };

                const hasEvent: any[] = [];
                const noEvent: any[] = [];
                objectified.forEach((x) => {
                    const strArr = [];
                    let hasAnEvent = false;
                    if (x.attc_row_ID) strArr.push("On AttC");
                    if (x.course_row_ID) strArr.push("On course");
                    if (x.leave_row_ID) strArr.push("On leave");
                    if (x.off_row_ID) strArr.push("On off");
                    if (x.ma_row_ID) {
                        if (x.ma_in_camp) {
                            strArr.push("On MA (In camp)");
                        } else {
                            strArr.push("On MA");
                        }
                    }
                    if (x.others_row_ID) {
                        if (x.others_in_camp) {
                            strArr.push("Others (In camp)");
                        } else {
                            strArr.push("Others");
                        }
                    }

                    if (!strArr.length) {
                        strArr.push("In camp");
                        hasAnEvent = true;
                    }

                    const str = strArr.join(", ");
                    x.location = str;

                    // Remove null values
                    const cleansed = Object.fromEntries(
                        Object.entries(x).filter(([_, v]) => v != null)
                    ) as ExtendedPersonnel;
                    if (hasAnEvent) hasEvent.push(cleansed);
                    else noEvent.push(cleansed);
                });

                const edited = [...hasEvent, ...noEvent];

                const sortedByPlatoon =
                    edited.reduce<{ [key: string]: ExtendedPersonnel[] }>((r, a) => {
                        r[a.platoon] = [...(r[a.platoon] || []), a];
                        return r;
                    }, {});

                const data = {
                    sortedByPlatoon,

                    selectedDate, // TO CHANGE
                };

                res.status(200).json(data);
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
