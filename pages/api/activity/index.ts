import { format } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../config/assignments.json";
import executeQuery from "../../../lib/db";
import { Activity } from "../../../types/activity";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { Absentee, Attendee } from "./[activity_ID]";
import { Event } from "react-big-calendar";
import { CustomEvent } from "../../../components/Calendar/ActivityCalendar";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    if (req.method === "GET") {
        const currentDate = new Date(); // todo - let this be user-selectable
        const mysqlFormatted = format(currentDate, Assignments.mysqldateformat);
        const opts = {
            unit: session.user.unit,
            company: session.user.company,
            selDate: mysqlFormatted,
        };

        // console.log(query);
        const personnel: ExtendedPersonnel[] = await executeQuery({
            query: `SELECT *, CASE WHEN (personnel.ha_end_date) > (DATE(?)) THEN true ELSE false END AS ha_active FROM personnel LEFT JOIN ranks ON ranks.rank = personnel.rank WHERE DATE(post_in) <= DATE(?) AND DATE(ord) >= DATE(?) AND unit = ? AND company = ?`,
            values: [opts.selDate, opts.selDate, opts.selDate, opts.unit, opts.company],
        });

        // const objectified = [...personnel];

        // Order by platoon using reduce
        const sortedByPlatoon = personnel.reduce<{
            [key: string]: Personnel[];
        }>((r, a) => {
            r[a.platoon] = [...(r[a.platoon] || []), a];
            return r;
        }, {});

        // grab the upcoming activities
        const activities:Activity[] = await executeQuery({
            query: `SELECT * FROM activity_list WHERE unit = ? AND company = ? ORDER BY date ASC`,
            values: [opts.unit, opts.company],
        })

        if (!activities.length) return res.status(200).json({})

        // For each activity, calculate the number of personnel who are attending, and the total number
        const activity_IDs = activities.map(activity => activity.activity_ID);
        const attendeeMap:{
            [key: number]: {
                attending: number,
                total: number
            }
        } = {}

        const listOfAttendeesForActivityIDs:Attendee[] = await executeQuery({
            query: `SELECT * FROM activity_attendees WHERE activity_ID IN (?)`,
            values: [activity_IDs],

        })

        const listOfAbsenteesForActivityIDs:Absentee[] = await executeQuery({
            query: `SELECT * FROM activity_absentees WHERE activity_ID IN (?)`,
            values: [activity_IDs],
        })

        const listOfAttendees = listOfAttendeesForActivityIDs.map(attendee => attendee.personnel_ID);
        const listOfAbsentees = listOfAbsenteesForActivityIDs.map(absentee => absentee.personnel_ID);

        const attendeesGroupedByActivityID = listOfAttendeesForActivityIDs.reduce<{
            [key: number]: number[]
        }>((r, a) => {  
            r[a.activity_ID] = [...(r[a.activity_ID] || []), a.personnel_ID];
            return r;
        }, {});

        const absenteesGroupedByActivityID = listOfAbsenteesForActivityIDs.reduce<{
            [key: number]: number[]
        }>((r, a) => {
            r[a.activity_ID] = [...(r[a.activity_ID] || []), a.personnel_ID];
            return r;
        }, {});


        // Make the calendar data
        const calendarData:CustomEvent[] = activities.map(activity => ({ 
            allDay: true,
            start: new Date(activity.date),
            end: new Date(activity.date),
            title: `${activity.name} (${activity.type})`,
            activity_ID: activity.activity_ID,
            type: activity.type,
            color:  colorCalculator(activity.type),
            
        }))


        res.json({ sortedByPlatoon, selectedDate: opts.selDate, upcomingActivities: activities, attendeesGroupedByActivityID, absenteesGroupedByActivityID, calendarData });
    }
    // res.json(data);
}
export const colorCalculator = (type: keyof typeof Assignments.activityColorMap) => Assignments.activityColorMap[type]
