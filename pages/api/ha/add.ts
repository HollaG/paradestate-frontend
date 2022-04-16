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
            const { type, name, date, personnelIDsSortedByPlatoon: attendeeIDsSortedByPlatoon, sortedByPlatoon, reasons } = req.body;
           

            if (!type || !name || !date || !attendeeIDsSortedByPlatoon)
                return res
                    .status(400)
                    .json({ error: "Missing required fields!" });

            // sanitize the personnel IDs
            const attendeeIDs = Object.values(
                attendeeIDsSortedByPlatoon
            ).flat();
            const personnel = Object.values<ExtendedPersonnel[]>(sortedByPlatoon).flat()
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


            // Check to make sure no events are alr added with same details
            const addedEvent = await executeQuery({
                query: `SELECT COUNT(ha_ID) as number FROM ha_list WHERE type = ? AND name = ? AND date = ?`,
                values: [type.value, name, formatMySQLDateHelper(date)],
            })
          
            if (addedEvent[0].number > 0) {
                return res
                    .status(400)
                    .json({
                        error: "Event already added!",
                    });
            }
            // add the event
            const responseData = await executeQuery({
                query: `INSERT INTO ha_list SET type = ?, name = ?, date = ?, editor_ID = ?`,
                values: [type.value, name, formatMySQLDateHelper(date), session.user.email],
            })
            
            const ha_ID = responseData.insertId;

            // add the personnel who went 
            await executeQuery({
                query: `INSERT INTO ha_attendees (ha_ID, personnel_ID) VALUES ?`,
                values: [[...attendeeIDs.map(id => [ha_ID, id])]],
                
            })

            const absentees = personnel.filter(person => !attendeeIDs.includes(person.personnel_ID))
            

            const query = `INSERT INTO ha_absentees (ha_ID, personnel_ID, reason) VALUES ?`
            const values = [[...absentees.map(person => [ha_ID, person.personnel_ID, reasons[person.personnel_ID]])]]
            console.log({values, attendeeIDs})
            await executeQuery({
                query,
                values,
            })
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
            //     query: `INSERT INTO ha_absentees (ha_ID, personnel_ID) VALUES ?`,
            //     values: [[...absentees.map(id => [ha_ID, id])]],
            // })
            res.json({ success: true });
        }
    } catch (e) {
        console.log(e);
    }

    // res.json(data);
}
