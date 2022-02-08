import { addDays, addHours, addMinutes, format, isSameDay } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../../lib/db";
import Assignments from "../../../../config/assignments.json";
import { ExtendedPersonnel, Personnel } from "../../../../types/database";
import { queryBuilder } from "mysql-query-placeholders";
import {
    ExtendedStatus,
    GenericEvent,
    MAEvent,
    OffOrLeaveEvent,
    OtherEvent,
} from "../../../../types/types";
import { Event } from "react-big-calendar";
import { sortActiveInactiveStatus } from "../../../../lib/custom";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
        try {
            const personnel_ID: string = req.query.p_ID.toString();
            if (!personnel_ID)
                return res
                    .status(400)
                    .json({ error: "No personnel specified" });
            const person: Personnel[] = await executeQuery({
                query: "SELECT * FROM personnel WHERE personnel_ID = ? AND unit = ? AND company = ?",
                values: [personnel_ID, session.user.unit, session.user.company],
            });
            if (!person.length)
                return res.status(400).json({ error: "Personnel not found" });

            // get this guy's offs, leaves, all
            const values = [personnel_ID];
            // const offs: OffOrLeaveEvent[] = await executeQuery({
            //     query: "SELECT * FROM off_tracker WHERE personnel_ID = ?",
            //     values,
            // });

            const offsExpired: OffOrLeaveEvent[] = await executeQuery({
                query: `SELECT * FROM off_tracker WHERE personnel_ID = ? AND DATE(end) < DATE(NOW())`,
                values,
            });

            const offsUpcoming: OffOrLeaveEvent[] = await executeQuery({
                query: `SELECT * FROM off_tracker WHERE personnel_ID = ? AND DATE(start) > DATE(NOW())`,
                values,
            });

            const offsActive: OffOrLeaveEvent[] = await executeQuery({
                query: `SELECT * FROM off_tracker WHERE personnel_ID = ? AND DATE(start) <= DATE(NOW()) AND DATE(end) >= DATE(NOW())`,
                values,
            });
            const offs = [...offsExpired, ...offsUpcoming, ...offsActive];

            const offEvents: Event[] = offs.map((off) => {
                const title = off.reason ? `Off: ${off.reason}` : "Off";
                const { start, end } = off;
                if (off.start_time === "PM") start.setHours(12);
                if (off.end_time === "AM") end.setHours(12)
                else end.setHours(24)
                return { title, start, end, id: off.row_ID, type: "off" };
            });
            // const leaves: OffOrLeaveEvent[] = await executeQuery({
            //     query: "SELECT * FROM leave_tracker WHERE personnel_ID = ?",
            //     values,
            // });

            const leavesExpired: OffOrLeaveEvent[] = await executeQuery({
                query: `SELECT * FROM leave_tracker WHERE personnel_ID = ? AND DATE(end) < DATE(NOW())`,
                values,
            });

            const leavesUpcoming: OffOrLeaveEvent[] = await executeQuery({
                query: `SELECT * FROM leave_tracker WHERE personnel_ID = ? AND DATE(start) > DATE(NOW())`,
                values,
            });

            const leavesActive: OffOrLeaveEvent[] = await executeQuery({
                query: `SELECT * FROM leave_tracker WHERE personnel_ID = ? AND DATE(start) <= DATE(NOW()) AND DATE(end) >= DATE(NOW())`,
                values,
            });
            const leaves = [
                ...leavesExpired,
                ...leavesUpcoming,
                ...leavesActive,
            ];

            const leaveEvents: Event[] = leaves.map((leave) => {
                const title = leave.reason ? `Leave: ${leave.reason}` : "Leave";
                const { start, end } = leave;
                if (leave.start_time === "PM")
                    start.setHours(start.getHours() + 12);
                if (leave.end_time === "AM") end.setHours(12);
                else end.setHours(24)

                return { title, start, end, id: leave.row_ID, type: "leave" };
            });

            // const attcs: GenericEvent[] = await executeQuery({
            //     query: "SELECT * FROM attc_tracker WHERE personnel_ID = ?",
            //     values,
            // });

            const attcsExpired: GenericEvent[] = await executeQuery({
                query: `SELECT * FROM attc_tracker WHERE personnel_ID = ? AND DATE(end) < DATE(NOW())`,
                values,
            });

            const attcsUpcoming: GenericEvent[] = await executeQuery({
                query: `SELECT * FROM attc_tracker WHERE personnel_ID = ? AND DATE(start) > DATE(NOW())`,
                values,
            });

            const attcsActive: GenericEvent[] = await executeQuery({
                query: `SELECT * FROM attc_tracker WHERE personnel_ID = ? AND DATE(start) <= DATE(NOW()) AND DATE(end) >= DATE(NOW())`,
                values,
            });

            const attcs = [...attcsExpired, ...attcsUpcoming, ...attcsActive];
            const attcEvents: Event[] = attcs.map((attc) => {
                const title = attc.attc_name
                    ? `AttC: ${attc.attc_name}`
                    : "AttC";
                const { start, end } = attc;
                end.setHours(24) // to make the event full day cos if the hours are 0, the calendar won't recognise the last day
                return {
                    title,
                    start,
                    end,
                    allDay: true,
                    id: attc.row_ID,
                    type: "attc",
                };
            });
            // const courses: GenericEvent[] = await executeQuery({
            //     query: "SELECT * FROM course_tracker WHERE personnel_ID = ?",
            //     values,
            // });

            const coursesExpired: GenericEvent[] = await executeQuery({
                query: `SELECT * FROM course_tracker WHERE personnel_ID = ? AND DATE(end) < DATE(NOW())`,
                values,
            });

            const coursesUpcoming: GenericEvent[] = await executeQuery({
                query: `SELECT * FROM course_tracker WHERE personnel_ID = ? AND DATE(start) > DATE(NOW())`,
                values,
            });

            const coursesActive: GenericEvent[] = await executeQuery({
                query: `SELECT * FROM course_tracker WHERE personnel_ID = ? AND DATE(start) <= DATE(NOW()) AND DATE(end) >= DATE(NOW())`,
                values,
            });
            const courses = [
                ...coursesExpired,
                ...coursesUpcoming,
                ...coursesActive,
            ];
            const courseEvents: Event[] = courses.map((course) => {
                const title = course.course_name
                    ? `Course: ${course.course_name}`
                    : "Course";
                const { start, end } = course;
                end.setHours(24) // to make the event full day cos if the hours are 0, the calendar won't recognise the last day

                return { title, start, end, allDay: true, id: course.row_ID, type: "course" };
            });

            // const mas: MAEvent[] = await executeQuery({
            //     query: "SELECT * FROM ma_tracker WHERE personnel_ID = ?",
            //     values,
            // });

            const masActive: MAEvent[] = await executeQuery({
                query: `SELECT * FROM ma_tracker WHERE personnel_ID = ? AND DATE(date) = DATE(NOW())`,
                values,
            });

            const masExpired: MAEvent[] = await executeQuery({
                query: `SELECT * FROM ma_tracker WHERE personnel_ID = ? AND DATE(date) < DATE(NOW())`,
                values,
            });

            const masUpcoming: MAEvent[] = await executeQuery({
                query: `SELECT * FROM ma_tracker WHERE personnel_ID = ? AND DATE(date) > DATE(NOW())`,
                values,
            });

            const mas = [...masActive, ...masExpired, ...masUpcoming];
            const maEvents: Event[] = mas.map((ma) => {
                let title = "MA";
                if (ma.ma_name) title = `MA: ${ma.ma_name}`;
                if (ma.ma_location) title = title + ` @ ${ma.ma_location}`;

                const date = ma.date;
                const timeSplit = ma.time.split("");
                const hours = `${timeSplit[0]}${timeSplit[1]}`;
                const minutes = `${timeSplit[2]}${timeSplit[3]}`;
                const datetime = addMinutes(
                    addHours(date, Number(hours)),
                    Number(minutes)
                );
                return {
                    title,
                    start: datetime,
                    end: addHours(datetime, 4),
                    id: ma.row_ID,
                    type: "ma",
                };
            });

            // const others: OtherEvent[] = await executeQuery({
            //     query: "SELECT * FROM others_tracker WHERE personnel_ID = ?",
            //     values,
            // });

            const othersExpired: OtherEvent[] = await executeQuery({
                query: `SELECT * FROM others_tracker WHERE personnel_ID = ? AND DATE(end) < DATE(NOW())`,
                values,
            });

            const othersUpcoming: OtherEvent[] = await executeQuery({
                query: `SELECT * FROM others_tracker WHERE personnel_ID = ? AND DATE(start) > DATE(NOW())`,
                values,
            });

            const othersActive: OtherEvent[] = await executeQuery({
                query: `SELECT * FROM others_tracker WHERE personnel_ID = ? AND DATE(start) <= DATE(NOW()) AND DATE(end) >= DATE(NOW())`,
                values,
            });

            const others = [
                ...othersExpired,
                ...othersUpcoming,
                ...othersActive,
            ];

            const otherEvents: Event[] = others.map((other) => {
                const title = other.others_name
                    ? `Others`
                    : `${other.other_name}`;
                const start = other.start;
                const end = other.end;
                end.setHours(24) // to make the event full day cos if the hours are 0, the calendar won't recognise the last day
                return {
                    title,
                    start,
                    end,
                    allDay: true,
                    id: other.row_ID,
                    type: "others",
                };
            });

            const statuses: ExtendedStatus[] = await executeQuery({
                query: "SELECT * FROM status_tracker LEFT JOIN status_list ON status_tracker.status_ID = status_list.status_ID WHERE personnel_ID = ?",
                values,
            });

            const [statusesActive, statusesInactive, statusesDuplicates] =
                await sortActiveInactiveStatus(statuses, new Date());

            const statusDates: Date[] = [];
            let hasOnePerm = false;
            // We only want one status event to represent a duration
            statuses.forEach((status) => {
                // For every date between the status start and end,
                // check if the statusDates array already contains this date.
                // If it does we don't add, if not then we add
                if (status.type === "perm") {
                    hasOnePerm = true;
                } else {
                    const { start, end } = status;

                    const startDate = new Date(start);
                    const endDate = new Date(end);

                    for (
                        let d = startDate;
                        d <= endDate;
                        d.setDate(d.getDate() + 1)
                    ) {
                        if (
                            !statusDates.some(
                                (
                                    existingDate // Only add if existing date does NOT exist
                                ) => isSameDay(existingDate, new Date(d))
                            )
                        ) {
                            statusDates.push(new Date(d));
                        }
                    }
                }
            });

            // Sort the statusDates array by ascending time
            statusDates.sort((a, b) => a.getTime() - b.getTime());

            const statusEvents: Event[] = [];
            // For every date in teh statusDates array, check if the previous date is the day before.
            let tempStart;
            for (let i = 0; i < statusDates.length; i++) {
                if (!tempStart) {
                    tempStart = statusDates[i];
                    // continue;
                }
                let changed = new Date(statusDates[i])
                changed.setHours(24)
                // if current iteration is the last iteration,
                if (i === statusDates.length - 1) {
                    if (!tempStart) {
                        // start and end are the same on the last iteration
                        statusEvents.push({
                            title: "Status",
                            allDay: true,
                            start: statusDates[i],
                            end: changed
                        });
                        tempStart = undefined;

                        continue;
                    } else {
                        statusEvents.push({
                            title: "Status",
                            allDay: true,
                            start: tempStart,
                            end: changed,
                        });
                        tempStart = undefined;
                        continue;
                    }
                }

                // Check if the next date is the day after the current date
                if (isSameDay(statusDates[i + 1], addDays(statusDates[i], 1))) {
                    // status haven end, carry on iterating
                } else {
                    // This is a one-day status, status ended

                    statusEvents.push({
                        title: "Status",
                        allDay: true,
                        start: tempStart,
                        end: changed
                    });
                    tempStart = undefined;
                }

                // If the current date is the day after the previous date,
                // if (isSameDay(statusDates[i], addDays(statusDates[i - 1], 1))) {
                //     // If this is true, that means that this day continues the previous day's status

                //     // Check if the next date is more than 1 day away
                //     if (
                //         isSameDay(
                //             statusDates[i + 1],
                //             addDays(statusDates[i], 1)
                //         )
                //     ) {
                //         // Means that the status hasn't ended
                //         continue
                //     } else {
                //         // Status has ended, add to the group
                //         statusPairs.push([tempStart, statusDates[i]]);
                //         tempStart = null
                //         continue
                //     }
                // } else {

                // }
            }

            const locationArr = [];
            let onStatus = false;
            if (offsActive.length) locationArr.push("off");
            if (leavesActive.length) locationArr.push("leave");
            if (attcsActive.length) locationArr.push("attc");
            if (masActive.length) locationArr.push("ma");
            if (othersActive.length) locationArr.push("others");
            if (coursesActive.length) locationArr.push("course");
            if (statusesActive.length) onStatus = true;
            const data = {
                person: person[0],
                eventData: {
                    offs: { offsExpired, offsActive, offsUpcoming },
                    leaves: { leavesExpired, leavesActive, leavesUpcoming },
                    attcs: { attcsExpired, attcsActive, attcsUpcoming },
                    mas: { masUpcoming, masActive, masExpired },
                    courses: { coursesExpired, coursesActive, coursesUpcoming },
                    others: { othersExpired, othersActive, othersUpcoming },
                    statuses: {
                        statusesActive,
                        statusesInactive,
                        statusesDuplicates,
                    },
                },
                calendarData: [
                    ...offEvents,
                    ...leaveEvents,
                    ...attcEvents,
                    ...courseEvents,
                    ...maEvents,
                    ...otherEvents,
                    ...statusEvents,
                ],
                locationArr,
                onStatus,
            };

            res.status(200).json(data);
        } catch (e: any) {
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
