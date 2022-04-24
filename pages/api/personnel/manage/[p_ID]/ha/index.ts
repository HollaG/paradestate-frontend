import { format, isBefore, subDays, subMonths } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import Assignments from "../../../../../../config/assignments.json";
import executeQuery from "../../../../../../lib/db";
import { Activity } from "../../../../../../types/activity";
import { Personnel } from "../../../../../../types/database";
import { colorCalculator } from "../../../../activity";
import { Absentee, Attendee } from "../../../../activity/[activity_ID]";

import { CustomEvent } from "../../../../../../components/Calendar/ActivityCalendar";
import { treeItemClasses } from "@mui/lab";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    const personnel_ID: string = req.query.p_ID.toString();
    if (!personnel_ID)
        return res.status(400).json({ error: "Missing personnel ID" });
    // ensure this person is exists and can view
    const personnel: Personnel[] = await executeQuery({
        query: `SELECT *, CASE WHEN (personnel.ha_end_date) > (NOW()) THEN true ELSE false END AS ha_active FROM personnel WHERE personnel_ID = ? AND unit = ? AND company = ?`,
        values: [personnel_ID, session.user.unit, session.user.company],
    });
    
    if (!personnel.length)
        return res.status(400).json({ error: "Personnel not found" });
    const person = personnel[0];
    if (req.method === "GET") {
        try {
            // get the calendar data
            // calendar should have all the activities, then the ones which he participated in should be in a lighter color

            const activities: Activity[] = await executeQuery({
                query: `SELECT * FROM activity_list WHERE unit = ? AND company = ? ORDER BY date ASC`,
                values: [session.user.unit, session.user.company],
            });
            

            const absences: Absentee[] = await executeQuery({
                query: `SELECT * FROM activity_absentees WHERE personnel_ID = ?`,
                values: [personnel_ID],
            });
            
            const attended: Attendee[] = await executeQuery({
                query: `SELECT * FROM activity_attendees WHERE personnel_ID = ?`,
                values: [personnel_ID],
            });
       

            const absencesByActivityID = absences.reduce<{
                [key: string]: Absentee[];
            }>((r, a) => {
                r[a.activity_ID] = [...(r[a.activity_ID] || []), a];
                return r;
            }, {});

            const attendedByActivityID = attended.reduce<{
                [key: string]: Attendee[];
            }>((r, a) => {
                r[a.activity_ID] = [...(r[a.activity_ID] || []), a];
                return r;
            }, {});

            // get the events of this person
            const haEvents: {
                row_ID: number;
                personnel_ID: number;
                event_type: "ended" | "resumed";
                date: Date;
            }[] = await executeQuery({
                query: `SELECT * FROM ha_events WHERE personnel_ID = '112' ORDER BY date ASC`,
                values: [Number(personnel_ID)],
            });
            
            const post_in = personnel[0].post_in;
            const secondYear = personnel[0].svc_status === "REG";
            const ord = personnel[0].ord;
            const secondYearDate = subMonths(ord, 10)
            // assume when posted in, already have HA
            const haCalendarData: CustomEvent[] = [];
            haEvents.forEach((event, index) => {
                if (index === 0) {
                    haCalendarData.push({
                        allDay: true,
                        start: (post_in),
                        end: (event.date) ,
                        title: "HA Active",
                        color: "green",
                    });
                } else {
                    haCalendarData.push({
                        allDay: true,
                        start: new Date(haEvents[index - 1].date),
                        end: new Date(event.date),
                        title: `${
                            event.event_type === "resumed"
                                ? "HA Expired"
                                : "HA Active"
                        }`,
                        color: event.event_type === "resumed" ? "red" : "green",
                    });
                }
            });

            // Extend the 'HA expired' duration all the way until ORD, if it is not past ORD
            if (isBefore(haEvents[haEvents.length - 1].date, person.ord)) {
                haCalendarData.push({
                    allDay: true,
                    start: new Date(haEvents[haEvents.length - 1].date),
                    end: person.ord,
                    title: "HA Expired",
                    color: "red"
                });
            }

           

            // Make the calendar data
            const calendarData: CustomEvent[] = [
                ...haCalendarData,
                ...activities.map((activity) => ({
                    allDay: true,
                    start: new Date(activity.date),
                    end: new Date(activity.date),
                    title: `${
                        !attendedByActivityID[activity.activity_ID]
                            ? "Missed:"
                            : ""
                    } ${activity.name} (${activity.type})`,
                    activity_ID: activity.activity_ID,
                    type: activity.type,
                    color: colorCalculator(activity.type),
                })),
            ];

            calendarData.push({
                allDay: true,
                // color: "green",
                start: new Date(person.ord),
                end: new Date(person.ord),
                title: "ORD",
            });
            calendarData.push({
                allDay: true,
                // color: "green",
                start: post_in,
                end: post_in,
                title: "Post In"
            })
            if (person.svc_status !== "REG") calendarData.push({
                allDay: true,
                // color: "green",
                start: secondYearDate,
                end: secondYearDate,
                title: "Yr 2 start"
            })

            const responseData = {
                activities,
                calendarData,
                absencesByActivityID,
                attendedByActivityID,
                haEvents,
                person: personnel[0],
            };
            res.status(200).json(responseData);
        } catch (e: any) {
            console.log(e);
            res.status(400).json({
                error: e.toString(),
            });
        }
    } else if (req.method === "POST") {
        try {
        } catch (e: any) {
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
