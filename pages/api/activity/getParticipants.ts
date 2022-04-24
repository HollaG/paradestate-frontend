import { format } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import Assignments from "../../../config/assignments.json";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { queryBuilder } from "mysql-query-placeholders";

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
            const { activity_type: type, activity_name: name, activity_date: date } = req.body;

            // According to parade state, retrieve those who are 'in camp'

            const startDate = new Date(date[0])
            const endDate = new Date(date[1])

            const opts = {
                unit: session.user.unit,
                company: session.user.company,
                selDate: startDate, 
            };

            const query = queryBuilder(
                "select *, CASE WHEN (personnel.ha_end_date) > (DATE(:selDate)) THEN true ELSE false END AS ha_active from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as a USING(personnel_ID) left join (SELECT personnel_ID, start as attc_start, end as attc_end, attc_name, row_ID as attc_row_ID FROM attc_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as b USING(personnel_ID) left join (SELECT personnel_ID, row_ID as course_row_ID, course_name, start as course_start, end as course_end FROM course_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as c USING(personnel_ID) left join (SELECT personnel_ID, start as leave_start, start_time as leave_start_time, end as leave_end, end_time as leave_end_time, reason as leave_reason, row_ID as leave_row_ID FROM leave_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as d USING(personnel_ID) left join (SELECT personnel_ID, start as off_start, start_time as off_start_time, end as off_end, end_time as off_end_time, reason as off_reason, row_ID as off_row_ID FROM off_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as e USING(personnel_ID) left join (SELECT personnel_ID, row_ID as others_row_ID, start as others_start, end as others_end, others_name, in_camp as others_incamp FROM others_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as f USING(personnel_ID) left join (SELECT personnel_ID, date as ma_date, time as ma_time, location as ma_location, ma_name, in_camp as ma_in_camp, row_ID as ma_row_ID FROM ma_tracker WHERE DATE(date) = DATE(:selDate) group by personnel_ID) as g USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE unit = :unit AND company = :company AND DATE(ord) >= DATE(:selDate) AND DATE(post_in) <= DATE(:selDate) ORDER BY platoon ASC, ranks.rank_order DESC, personnel.name ASC",
                opts
            );
            // console.log(query);
            const personnel: ExtendedPersonnel[] = await executeQuery({
                query: query.sql,
                values: query.values,
            });

            const expiredPersonnelIDs = personnel.filter((person) => !person.ha_active).map((person) => person.personnel_ID)

            const objectified = [...personnel];

            if (!objectified) return { props: {} };

            const hasEvent: any[] = [];
            const noEvent: any[] = [];

            objectified.forEach((x) => {
                // Because the ha_active is based on 


                const strArr = [];
                let unableToParticipate = false;
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
                // if (x.status_row_ID) strArr.push("On status")

                x.locationArr = strArr;
                if (!strArr.length) {
                    x.location = "In camp";
                } else {
                    x.location = strArr.join(", ");
                    unableToParticipate = true
                }
                if (x.status_row_ID) unableToParticipate = true;

                // Remove null values
                const cleansed = Object.fromEntries(
                    Object.entries(x).filter(([_, v]) => v != null)
                ) as ExtendedPersonnel;
                if (unableToParticipate) hasEvent.push(cleansed);
                else noEvent.push(cleansed);
            });
            const edited = [...hasEvent, ...noEvent];
            

            const sortedByPlatoon = edited.reduce<{
                [key: string]: ExtendedPersonnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

            res.status(200).json({
                success: true,
                data: {
                    type,
                    name,
                    date: [startDate, endDate],
                    personnel: sortedByPlatoon,
                    hasEvent,
                    noEvent,
                    expiredPersonnelIDs
                },

            });
        } catch (e: any) {
            console.log(e);
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
