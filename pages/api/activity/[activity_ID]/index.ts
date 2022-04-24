import { queryBuilder } from "mysql-query-placeholders";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { formatMySQLDateHelper } from "../../../../lib/custom";
import executeQuery from "../../../../lib/db";
import { refreshAll } from "../../../../lib/ha";
import { Activity } from "../../../../types/activity";
import { ExtendedPersonnel, Personnel } from "../../../../types/database";
export interface Absentee {
    row_ID: number;
    personnel_ID: number;
    reason: string;
    activity_ID: number;
}

export interface Attendee {
    row_ID: number;
    personnel_ID: number;
    activity_ID: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    const activity_ID = req.query.activity_ID.toString();

    if (req.method === "GET") {
        const activity: Activity[] = await executeQuery({
            query: `SELECT * FROM activity_list WHERE activity_ID = ? AND unit = ? AND company = ?`,
            values: [activity_ID, session.user.unit, session.user.company],
        });

        // ensure activity is found
        if (!activity)
            return res.status(400).json({ error: "Activity not found" });

        // personnel_IDs who are in / out of the activity
        const absenteesResult: Absentee[] = await executeQuery({
            query: `SELECT * FROM activity_absentees WHERE activity_ID = ?`,
            values: [activity_ID],
        });
        // convert result into an object mappedby personnel ID
        const absentees = absenteesResult.reduce<{
            [key: string]: Absentee[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});

        const absentees_IDs = absenteesResult.map((a) => a.personnel_ID);
        const attendees_IDsResult: {
            personnel_ID: number;
            ha_active: boolean;
        }[] = await executeQuery({
            query: `SELECT activity_attendees.personnel_ID,CASE WHEN (personnel.ha_end_date) > (DATE(?)) THEN true ELSE false END AS ha_active  FROM activity_attendees LEFT JOIN personnel ON personnel.personnel_ID = activity_attendees.personnel_ID WHERE activity_ID = ?`,
            values: [activity[0].date, activity_ID],
        });
     
        const attendees_IDs = attendees_IDsResult.map((a) => a.personnel_ID);

        const personnel_IDs = [...attendees_IDs, ...absentees_IDs];

        // TODO remove any
        const getPersonnel: any = async (opts: {
            personnel_IDs: number[];
            selDate: string;
        }) => {
            const query = queryBuilder(
                "select *, CASE WHEN (personnel.ha_end_date) > (DATE(:selDate)) THEN true ELSE false END AS ha_active from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as a USING(personnel_ID) left join (SELECT personnel_ID, start as attc_start, end as attc_end, attc_name, row_ID as attc_row_ID FROM attc_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as b USING(personnel_ID) left join (SELECT personnel_ID, row_ID as course_row_ID, course_name, start as course_start, end as course_end FROM course_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as c USING(personnel_ID) left join (SELECT personnel_ID, start as leave_start, start_time as leave_start_time, end as leave_end, end_time as leave_end_time, reason as leave_reason, row_ID as leave_row_ID FROM leave_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as d USING(personnel_ID) left join (SELECT personnel_ID, start as off_start, start_time as off_start_time, end as off_end, end_time as off_end_time, reason as off_reason, row_ID as off_row_ID FROM off_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as e USING(personnel_ID) left join (SELECT personnel_ID, row_ID as others_row_ID, start as others_start, end as others_end, others_name, in_camp as others_incamp FROM others_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as f USING(personnel_ID) left join (SELECT personnel_ID, date as ma_date, time as ma_time, location as ma_location, ma_name, in_camp as ma_in_camp, row_ID as ma_row_ID FROM ma_tracker WHERE DATE(date) = DATE(:selDate) group by personnel_ID) as g USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE personnel_ID IN (:personnel_IDs) ORDER BY platoon ASC, ranks.rank_order DESC, personnel.name ASC",
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

            // create the numbers
            const attendeeNumbers: { [key: string]: any } = {};

            objectified.forEach((x) => {
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
                    unableToParticipate = true;
                }
                if (x.status_row_ID) unableToParticipate = true;

                // Remove null values
                const cleansed = Object.fromEntries(
                    Object.entries(x).filter(([_, v]) => v != null)
                ) as ExtendedPersonnel;
                if (unableToParticipate) hasEvent.push(cleansed);
                else noEvent.push(cleansed);

                if (attendees_IDs.includes(x.personnel_ID)) {
                    if (!attendeeNumbers[x.platoon]) {
                        attendeeNumbers[x.platoon] = 1;
                    } else {
                        attendeeNumbers[x.platoon]++;
                    }
                }
            });
            const edited = [...hasEvent, ...noEvent];
            const sortedByPlatoon = edited.reduce<{
                [key: string]: ExtendedPersonnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});
            return sortedByPlatoon;
        };

        const sortedByPlatoon = await getPersonnel({
            personnel_IDs,
            selDate: formatMySQLDateHelper(activity[0].date.toString()),
        });
        const totalNumbers: { [key: string]: number } = {};
        Object.keys(sortedByPlatoon).forEach((platoon, index) => {
            // for each platoon, find the total number of personnel
            totalNumbers[platoon] = sortedByPlatoon[platoon].length;
        });

        // make sorted By Platoon for both attending and absentees

        const absenteesByPlatoon = absentees_IDs.length ? await getPersonnel({
            personnel_IDs: absentees_IDs,
            selDate: formatMySQLDateHelper(activity[0].date.toString()),
        }) : {};

        const attendeesByPlatoon = attendees_IDs.length ? await getPersonnel({
            personnel_IDs: attendees_IDs,
            selDate: formatMySQLDateHelper(activity[0].date.toString()),
        }) : {};

        // calculate number of personnel not heat acclimatised
        const numberExpired = attendees_IDsResult.filter(
            (person) => !person.ha_active
        ).length;
        const response = {
            activity: activity[0],
            absentees_IDs,
            attendees_IDs,

            absentees,
            attendeesByPlatoon,
            absenteesByPlatoon,
            totalNumbers,

            numberExpired,
        };
        res.json(response);
    } else if (req.method === "DELETE") {
        // ensure perms
        const activity = await executeQuery({
            query: `SELECT * FROM activity WHERE activity_ID = ? AND unit = ? AND company = ?`,
            values: [activity_ID, session.user.unit, session.user.company],
        });

        if (!activity)
            return res.status(400).json({ error: "Insufficient permissions!" });

        await executeQuery({
            query: `DELETE FROM activity_list WHERE activity_ID = ?`,
            values: [activity_ID],
        });

        // refresh the HA status
        await refreshAll(session.user.company, session.user.unit);

        res.status(200).json({ success: true });
    }
    // res.json(data);
}
