import { format } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../config/assignments.json";
import { formatMySQLDateHelper } from "../../../lib/custom";
import executeQuery from "../../../lib/db";
import { refreshAll } from "../../../lib/ha";
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
                contributes
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
                    query: `INSERT INTO activity_list SET group_ID = ?, type = ?, name = ?, date = ?, start_date = ?, end_date = ?, day = ?, contributes = ?, editor_ID = ?, unit = ?, company = ?`,
                    values: [
                        newGroupID,
                        type.value,
                        name,
                        formatMySQLDateHelper(loopDate.toString()),
                        formatMySQLDateHelper(date[0].toString()),
                        formatMySQLDateHelper(date[1].toString()),
                        
                        i+1,
                        contributes || 0,
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
               


                await executeQuery({
                    query,
                    values,
                });
            }
            
            // Refresh the HA status
            await refreshAll(session.user.company, session.user.unit)
            res.json({ success: true, data: { activity_IDs } });
        }
    } catch (e) {
        console.log(e);
    }

    // res.json(data);
}
