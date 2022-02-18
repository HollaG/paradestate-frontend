import {
    addDays,
    addHours,
    addMinutes,
    format,
    isBefore,
    isEqual,
    isSameDay,
} from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../../../lib/db";
import Assignments from "../../../../../config/assignments.json";
import { ExtendedPersonnel, Personnel } from "../../../../../types/database";
import { queryBuilder } from "mysql-query-placeholders";
import {
    ExtendedStatus,
    GenericEvent,
    MAEvent,
    OffOrLeaveEvent,
    OtherEvent,
} from "../../../../../types/types";
import { Event } from "react-big-calendar";
import {
    calculateOutOfOfficeDuration,
    formatMySQLDateHelper,
    formatMySQLTimeHelper,
    sortActiveInactiveStatus,
} from "../../../../../lib/custom";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });
    const personnel_ID: string = req.query.p_ID.toString();

    if (req.method === "GET") {
        try {
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
                if (off.end_time === "AM") end.setHours(12);
                else {
                    end.setHours(23);
                    end.setMinutes(59);
                }
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
                else {
                    end.setHours(23);
                    end.setMinutes(59);
                }

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
                end.setHours(23); // to make the event full day cos if the hours are 0, the calendar won't recognise the last day
                end.setMinutes(59);

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
                end.setHours(23); // to make the event full day cos if the hours are 0, the calendar won't recognise the last day
                end.setMinutes(59);

                return {
                    title,
                    start,
                    end,
                    allDay: true,
                    id: course.row_ID,
                    type: "course",
                };
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
                end.setHours(23);
                end.setMinutes(59); // to make the event full day cos if the hours are 0, the calendar won't recognise the last day
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
                let changed = new Date(statusDates[i]);
                changed.setHours(23);
                changed.setMinutes(59);

                // if current iteration is the last iteration,
                if (i === statusDates.length - 1) {
                    if (!tempStart) {
                        // start and end are the same on the last iteration
                        statusEvents.push({
                            title: "Status",
                            allDay: true,
                            start: statusDates[i],
                            end: changed,
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
                        end: changed,
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
    } else if (req.method === "POST") {
        try {
            console.log(req.body);
            const type = req.body.type;
            const data = req.body.data;
            const row_ID = Object.keys(data)[0].split("-")[0];
            let query = ``;
            let values: string[] = [];

            // Check perms
            const personnelExists = await executeQuery({
                query: `SELECT * FROM personnel WHERE personnel_ID = ? AND unit = ? AND company = ?`,
                values: [personnel_ID, session.user.unit, session.user.company],
            });
            if (!personnelExists.length)
                return res.status(400).json({
                    error: "You do not have permission to edit this user!",
                });

            switch (type) {
                case "off": {
                    // Check that start date is before end date and all
                    const reason = data[`${row_ID}-${type}-reason`];
                    const dates = data[`${row_ID}-${type}-date`].map(
                        (date: string) => new Date(date)
                    );
                    const startTime = data[`${row_ID}-${type}-start-time`];
                    const endTime = data[`${row_ID}-${type}-end-time`];

                    const startIsBefore =
                        isBefore(dates[0], dates[1]) ||
                        isEqual(dates[0], dates[1]);
                    if (!startIsBefore) {
                        return res.status(400).json({
                            error: "Start date must be before end date",
                        });
                    }
                    const previousOff = await executeQuery({
                        query: "SELECT * FROM off_tracker WHERE row_ID = ?",
                        values: [row_ID],
                    });

                    if (!previousOff.length)
                        return res.status(400).json({
                            error: "Invalid off ID!",
                        });
                    console.log({ previousOff });
                    const previousDaysOff = calculateOutOfOfficeDuration({
                        date: [previousOff[0].start, previousOff[0].end],
                        "end-time": previousOff[0].end_time,
                        "start-time": previousOff[0].start_time,
                    });
                    const newDaysOff = calculateOutOfOfficeDuration({
                        date: dates,
                        "end-time": endTime,
                        "start-time": startTime,
                    });

                    const daysToChange = newDaysOff - previousDaysOff;
                    query = `UPDATE off_tracker SET start = ?, start_time = ?, end = ?, end_time = ?, reason = ? WHERE row_ID = ?`;
                    values = [
                        formatMySQLDateHelper(dates[0]),
                        startTime,
                        formatMySQLDateHelper(dates[1]),
                        endTime,
                        reason,
                        row_ID,
                    ];

                    await executeQuery({
                        query: `UPDATE personnel SET off_balance=off_balance+? WHERE personnel_ID = ?`,
                        values: [daysToChange, personnel_ID],
                    });
                    break;
                }
                case "leave": {
                    // Check that start date is before end date and all
                    const reason = data[`${row_ID}-${type}-reason`];
                    const dates = data[`${row_ID}-${type}-date`].map(
                        (date: string) => new Date(date)
                    );
                    const startTime = data[`${row_ID}-${type}-start-time`];
                    const endTime = data[`${row_ID}-${type}-end-time`];

                    const startIsBefore =
                        isBefore(dates[0], dates[1]) ||
                        isEqual(dates[0], dates[1]);
                    if (!startIsBefore) {
                        return res.status(400).json({
                            error: "Start date must be before end date",
                        });
                    }
                    const previousLeave = await executeQuery({
                        query: "SELECT * FROM leave_tracker WHERE row_ID = ?",
                        values: [row_ID],
                    });

                    if (!previousLeave.length)
                        return res.status(400).json({
                            error: "Invalid leave ID!",
                        });
                    console.log({ previousLeave });
                    const previousDaysLeave = calculateOutOfOfficeDuration({
                        date: [previousLeave[0].start, previousLeave[0].end],
                        "end-time": previousLeave[0].end_time,
                        "start-time": previousLeave[0].start_time,
                    });
                    const newDaysLeave = calculateOutOfOfficeDuration({
                        date: dates,
                        "end-time": endTime,
                        "start-time": startTime,
                    });

                    const daysToChange = newDaysLeave - previousDaysLeave;
                    query = `UPDATE leave_tracker SET start = ?, start_time = ?, end = ?, end_time = ?, reason = ? WHERE row_ID = ?`;
                    values = [
                        formatMySQLDateHelper(dates[0]),
                        startTime,
                        formatMySQLDateHelper(dates[1]),
                        endTime,
                        reason,
                        row_ID,
                    ];

                    await executeQuery({
                        query: `UPDATE personnel SET leave_balance=leave_balance+? WHERE personnel_ID = ?`,
                        values: [daysToChange, personnel_ID],
                    });
                    break;
                }
                case "attc": {
                    // Check that start date is before end date and all
                    const reason = data[`${row_ID}-${type}-reason`];
                    const dates = data[`${row_ID}-${type}-date`].map(
                        (date: string) => new Date(date)
                    );
                    const startIsBefore =
                        isBefore(dates[0], dates[1]) ||
                        isEqual(dates[0], dates[1]);
                    if (!startIsBefore) {
                        return res.status(400).json({
                            error: "Start date must be before end date",
                        });
                    }
                    const previousAttc = await executeQuery({
                        query: "SELECT * FROM attc_tracker WHERE row_ID = ?",
                        values: [row_ID],
                    });

                    if (!previousAttc.length)
                        res.status(400).json({
                            error: "Invalid attc ID!",
                        });

                    query = `UPDATE attc_tracker SET start = ?, end = ?, attc_name = ? WHERE row_ID = ?`;
                    values = [
                        formatMySQLDateHelper(dates[0]),

                        formatMySQLDateHelper(dates[1]),

                        reason,
                        row_ID,
                    ];

                    break;
                }
                case "course": {
                    // Check that start date is before end date and all
                    const name = data[`${row_ID}-${type}-name`];
                    const dates = data[`${row_ID}-${type}-date`].map(
                        (date: string) => new Date(date)
                    );
                    const startIsBefore =
                        isBefore(dates[0], dates[1]) ||
                        isEqual(dates[0], dates[1]);
                    if (!startIsBefore) {
                        return res.status(400).json({
                            error: "Start date must be before end date",
                        });
                    }
                    const previousCourse = await executeQuery({
                        query: "SELECT * FROM course_tracker WHERE row_ID = ?",
                        values: [row_ID],
                    });

                    if (!previousCourse.length)
                        return res.status(400).json({
                            error: "Invalid course ID!",
                        });

                    query = `UPDATE course_tracker SET start = ?, end = ?, course_name = ? WHERE row_ID = ?`;
                    values = [
                        formatMySQLDateHelper(dates[0]),

                        formatMySQLDateHelper(dates[1]),

                        name,
                        row_ID,
                    ];

                    break;
                }
                case "ma": {
                    const previousMa = await executeQuery({
                        query: "SELECT * FROM ma_tracker WHERE row_ID = ?",
                        values: [row_ID],
                    });
                    if (!previousMa.length)
                        return res.status(400).json({
                            error: "Invalid MA ID!",
                        });

                    const name = data[`${row_ID}-${type}-name`];
                    const location = data[`${row_ID}-${type}-location`];
                    const incamp = data[`${row_ID}-${type}-incamp`];
                    const dateTime = data[`${row_ID}-${type}-date-time`];
                    query = `UPDATE ma_tracker SET date = ?, time = ?, location = ?, ma_name = ?, in_camp = ? WHERE row_ID = ?`;
                    values = [
                        formatMySQLDateHelper(dateTime),
                        formatMySQLTimeHelper(dateTime),
                        location,
                        name,
                        incamp,
                        row_ID,
                    ];
                    break;
                }
                case "others": {
                    // Check that start date is before end date and all
                    const name = data[`${row_ID}-${type}-name`];
                    const incamp = data[`${row_ID}-${type}-incamp`];
                    const dates = data[`${row_ID}-${type}-date`].map(
                        (date: string) => new Date(date)
                    );
                    const startIsBefore =
                        isBefore(dates[0], dates[1]) ||
                        isEqual(dates[0], dates[1]);
                    if (!startIsBefore) {
                        return res.status(400).json({
                            error: "Start date must be before end date",
                        });
                    }
                    const previousOthers = await executeQuery({
                        query: "SELECT * FROM others_tracker WHERE row_ID = ?",
                        values: [row_ID],
                    });

                    if (!previousOthers.length)
                        return res.status(400).json({
                            error: "Invalid others ID!",
                        });

                    query = `UPDATE others_tracker SET start = ?, end = ?, others_name = ?, in_camp = ?, location = "" WHERE row_ID = ?`;
                    values = [
                        formatMySQLDateHelper(dates[0]),

                        formatMySQLDateHelper(dates[1]),

                        name,
                        incamp,
                        row_ID,
                    ];

                    break;
                }
                case "status": {
                    const isPerm = data[`${row_ID}-${type}-perm`];

                    const previousStatus = await executeQuery({
                        query: "SELECT * FROM status_tracker WHERE row_ID = ?",
                        values: [row_ID],
                    });
                    if (!previousStatus.length)
                        return res.status(400).json({
                            error: "Invalid status ID!",
                        });

                    if (isPerm) {
                        query = `UPDATE status_tracker SET type = 'perm' WHERE row_ID = ?`;
                        values = [row_ID];
                    } else {
                        const dates = data[`${row_ID}-${type}-date`].map(
                            (date: string) => new Date(date)
                        );
                        const startIsBefore =
                            isBefore(dates[0], dates[1]) ||
                            isEqual(dates[0], dates[1]);
                        if (!startIsBefore) {
                            return res.status(400).json({
                                error: "Start date must be before end date",
                            });
                        }
                        query = `UPDATE status_tracker SET start = ?, end = ?, type = "" WHERE row_ID = ?`;
                        values = [
                            formatMySQLDateHelper(dates[0]),
                            formatMySQLDateHelper(dates[1]),
                            row_ID,
                        ];
                    }
                }
            }
            console.log("Final query:", { query, values });
            const result = await executeQuery({ query, values });
            const oldGroupID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM audit_log`,
                values: [],
            });
            const groupID = oldGroupID[0].max + 1;
            const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "UPDATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
            const auditArr = [
                session.user.row_ID,
                type,
                row_ID,
                personnel_ID,
                groupID,
            ];
            await executeQuery({ query: auditSql, values: auditArr });

            res.json({ success: true });
        } catch (e: any) {
            console.log(e);
            res.json({
                error: {
                    message: "Something went wrong!",
                },
            });
        }
    } else if (req.method === "DELETE") {
        try {
            console.log("deleting...");
            const { type, id } = req.body;

            // Check perms
            const personnelExists = await executeQuery({
                query: `SELECT * FROM personnel WHERE personnel_ID = ? AND unit = ? AND company = ?`,
                values: [personnel_ID, session.user.unit, session.user.company],
            });
            if (!personnelExists.length)
                return res.status(400).json({
                    error: "You do not have permission to edit this user!",
                });

            const result = await executeQuery({
                query: `DELETE FROM ?? WHERE row_ID = ?`,
                values: [`${type}_tracker`, id],
            });
            const oldGroupID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM audit_log`,
                values: [],
            });
            const groupID = oldGroupID[0].max + 1;
            await executeQuery({
                query: `INSERT INTO audit_log SET group_ID = ?, user_ID = ?, operation = "DELETE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW()`,
                values: [groupID, session.user.row_ID, type, id, personnel_ID],
            });
           
            res.json({ success: true });
        } catch (e) {
            res.json({
                error: {
                    message: "Something went wrong!",
                },
            });
        }
    }
}
