import { format } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../config/assignments.json";
import { formatMySQLDateHelper } from "../../../lib/custom";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    try {
        if (req.method === "POST") {
            const {
                type,
                name,
                date,
                personnelIDsSortedByPlatoon: attendeeIDsSortedByPlatoon,
                sortedByPlatoon,
                reasons,
            } = req.body;

            if (!type || !name || !date || !attendeeIDsSortedByPlatoon)
                return res
                    .status(400)
                    .json({ error: "Missing required fields!" });

            // sanitize the personnel IDs
            const attendeeIDs = Object.values(
                attendeeIDsSortedByPlatoon
            ).flat();
            const personnel =
                Object.values<ExtendedPersonnel[]>(sortedByPlatoon).flat();
            // console.log(personnelIDs);

            // ensure that all personnel IDs are available for the user to edit
            // const personnel = await executeQuery({
            //     query: `SELECT COUNT(personnel_ID) as number FROM personnel WHERE personnel_ID IN (?)`,
            //     values: [personnelIDs],
            // });

            // if (personnel[0].number !== personnelIDs.length)
            //     return res
            //         .status(400)
            //         .json({
            //             error: "One or more personnel IDs are not eligible for the user to edit!",
            //         }); // should never fire unless the user is doing some trickery

            const startDate = formatMySQLDateHelper(date[0]);
            const endDate = formatMySQLDateHelper(date[1]);

            // Check to make sure no events are alr added with same details
            // const addedEvent = await executeQuery({
            //     query: `SELECT COUNT(activity_ID) as number FROM activity_list WHERE type = ? AND name = ? AND date = ? AND unit = ? AND company = ?`,
            //     values: [
            //         type.value,
            //         name,
            //         formatMySQLDateHelper(startDate),
            //         session.user.unit,
            //         session.user.company,
            //     ],
            // });

            // if (addedEvent[0].number > 0) {
            //     return res.status(400).json({
            //         error: "Event already added!",
            //     });
            // }

            // For every day in startDate and endDate inclusive, add an event
            const getDaysArray = function (startDate: Date, endDate: Date) {
                for (
                    var a = [], d = new Date(startDate);
                    d <= new Date(endDate);
                    d.setDate(d.getDate() + 1)
                ) {
                    a.push(new Date(d));
                }
                return a;
            };


            // Get the group iD
            const groupID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM activity_list`,
                values: []
            })
            const newGroupID = groupID[0].max + 1
            const dates = getDaysArray(new Date(date[0]), new Date(date[1]));
            const activity_IDs = [];
            for (let i = 0; i < dates.length; i++) { 
                let loopDate = dates[i];
            
         
                // add the event
                const responseData = await executeQuery({
                    query: `INSERT INTO activity_list SET group_ID = ?, type = ?, name = ?, date = ?, start_date = ?, end_date = ?, day = ?, editor_ID = ?, unit = ?, company = ?`,
                    values: [
                        newGroupID,
                        type.value,
                        name,
                        formatMySQLDateHelper(loopDate.toString()),
                        formatMySQLDateHelper(date[0].toString()),
                        formatMySQLDateHelper(date[1].toString()),
                        
                        i+1,
                        session.user.email,
                        session.user.unit,
                        session.user.company,
                    ],
                });

                const activity_ID = responseData.insertId;
                activity_IDs.push(activity_ID);
                // add the personnel who went
                await executeQuery({
                    query: `INSERT INTO activity_attendees (activity_ID, personnel_ID) VALUES ?`,
                    values: [[...attendeeIDs.map((id) => [activity_ID, id])]],
                });

                const absentees = personnel.filter(
                    (person) => !attendeeIDs.includes(person.personnel_ID)
                );

                const query = `INSERT INTO activity_absentees (activity_ID, personnel_ID, reason) VALUES ?`;
                const values = [
                    [
                        ...absentees.map((person) => [
                            activity_ID,
                            person.personnel_ID,
                            reasons[person.personnel_ID],
                        ]),
                    ],
                ];
                console.log({ values, attendeeIDs });
                await executeQuery({
                    query,
                    values,
                });
            }
            // add the personnel who didn't go
            // const absenteesResult:{personnel_ID: number}[] = await executeQuery({
            //     query: `SELECT personnel_ID FROM personnel WHERE personnel_ID NOT IN (?) AND unit = ? AND company = ? AND DATE(post_in) <= ? AND DATE(ord) >= ?`,
            //     values: [personnelIDs, session.user.unit, session.user.company, formatMySQLDateHelper(date), formatMySQLDateHelper(date)],
            // })
            // const absentees = absenteesResult.map(person => person.personnel_ID);
            // console.log(absentees)

            // const opts = {
            //     unit: session.user.unit,
            //     company: session.user.company,
            //     selDate: new Date(date), // todo,
            //     attendees: personnelIDs,
            // };
            // // const absenteeQuery = queryBuilder(
            // //     "select * from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as a USING(personnel_ID) left join (SELECT personnel_ID, start as attc_start, end as attc_end, attc_name, row_ID as attc_row_ID FROM attc_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as b USING(personnel_ID) left join (SELECT personnel_ID, row_ID as course_row_ID, course_name, start as course_start, end as course_end FROM course_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as c USING(personnel_ID) left join (SELECT personnel_ID, start as leave_start, start_time as leave_start_time, end as leave_end, end_time as leave_end_time, reason as leave_reason, row_ID as leave_row_ID FROM leave_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as d USING(personnel_ID) left join (SELECT personnel_ID, start as off_start, start_time as off_start_time, end as off_end, end_time as off_end_time, reason as off_reason, row_ID as off_row_ID FROM off_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as e USING(personnel_ID) left join (SELECT personnel_ID, row_ID as others_row_ID, start as others_start, end as others_end, others_name, in_camp as others_incamp FROM others_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as f USING(personnel_ID) left join (SELECT personnel_ID, date as ma_date, time as ma_time, location as ma_location, ma_name, in_camp as ma_in_camp, row_ID as ma_row_ID FROM ma_tracker WHERE DATE(date) = DATE(:selDate) group by personnel_ID) as g USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE unit = :unit AND company = :company AND DATE(ord) >= DATE(:selDate) AND DATE(post_in) <= DATE(:selDate) AND personnel_ID NOT IN (:attendees) ORDER BY platoon ASC, ranks.rank_order DESC, personnel.name ASC",
            // //     opts
            // // );

            // await executeQuery({
            //     query: `INSERT INTO activity_absentees (activity_ID, personnel_ID) VALUES ?`,
            //     values: [[...absentees.map(id => [activity_ID, id])]],
            // })
            res.json({ success: true, data: { activity_IDs } });
        }
    } catch (e) {
        console.log(e);
    }

    // res.json(data);
}
