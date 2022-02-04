import {
    addDays,
    differenceInBusinessDays,
    format,
    isAfter,
    isBefore,
    isSameDay,
} from "date-fns";

import Assignments from "../config/assignments.json";
import { ExtendedStatus } from "../types/types";
export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

interface OutOfOffice {
    date: (Date | string)[];

    "start-time": "AM" | "PM";
    "end-time": "AM" | "PM";
    [key: string]: any;
}

export const formatMySQLDateHelper = (date: string) =>
    format(new Date(date), Assignments.mysqldateformat);

export const formatMySQLDateTimeHelper = (date: string) =>
    format(new Date(date), Assignments.mysqldatetimeformat);

export const formatMySQLTimeHelper = (date: string) =>
    format(new Date(date), Assignments.mysqltimeformat);

export const openInNewTab = (url: string): void => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
};

export const onClickUrl =
    (url: string): (() => void) =>
    () =>
        openInNewTab(url);

export const calculateOutOfOfficeDuration = (outOfOffice: OutOfOffice) => {
    // console.log({ outOfOffice });
    const start =
        typeof outOfOffice.date[0] === "string"
            ? new Date(outOfOffice.date[0])
            : outOfOffice.date[0];
    const end =
        typeof outOfOffice.date[1] === "string"
            ? new Date(outOfOffice.date[1])
            : outOfOffice.date[1];

    const days = differenceInBusinessDays(end, start);

    let hours = getHoursBetweenStartAndEndTimes(
        outOfOffice["start-time"],
        outOfOffice["end-time"]
    );

    let halfDays = hours / 12;
    // console.log({ days, halfDays });
    return days + halfDays / 2;
    // If start time is AM, add 24 hours
    // if start time is PM, add 12 hours
    // If end time is AM, subtract 12 hours
    // if end time is PM, subtract 0 hours

    //     console.log(leave)
    //     var daysOnLeave = workday_count(moment(leave.start, assignments.dateformat), moment(leave.end, assignments.dateformat)) // https://stackoverflow.com/questions/28425132/how-to-calculate-number-of-working-days-between-two-dates-in-javascript-using/45483646
    //     // TODO - Why does only this file need to specify the format? Other files don't need it.
    //     // If 10/01 AM - 10/01 PM --> 1 (daysDiff returns 1) --> should NOT be edited
    //     // if 10/01 AM - 11/01 AM --> 1.5 (returns 2)
    //     // if 10/01 PM - 11/01 AM --> 1 (2)
    //     // if 10/01 PM - 10/01 PM --> 0.5 (1)

    //     // if leave starts on PM, subtract 0.5
    //     // if leave ends on AM, subtract 0.5
    //     // if leave starts on AM and ends on PM, subtract 0.5

    //     // Case if 10/01 PM - 10/01 PM --> 0.5 (1)

    //     // Account for public holidays and weekends too :<

    //     var public_holidays = require('../../config/public_holidays.json').list
    //     // if the range falls between any of these dates in the list inclusive, then subtract 1 day of leave
    //     // TODO console.log(moment(leave.start))
    //     var range = moment.range(moment(leave.start), moment(leave.end))

    //     // TODO find a better way to do this
    //     var numberPublicHolidays = 0
    //     public_holidays.forEach(holiday => {
    //         if (range.contains(moment(holiday))) numberPublicHolidays++
    //     })
    //     // // TODO console.log('numberPubHol', numberPublicHolidays)
    //     // // TODO console.log(leave.start, leave.end)
    //     daysOnLeave = daysOnLeave - numberPublicHolidays

    //     if (moment(leave.start).isoWeekday() < 6) {
    //         // don't modify if it starts on a weekend
    //         if (leave.start_time == "PM") {
    //             daysOnLeave = daysOnLeave - 0.5
    //         }
    //     }

    //     if (moment(leave.end).isoWeekday() < 6) {
    //         if (leave.end_time == "AM") {
    //             // // TODO console.log("here")
    //             daysOnLeave = daysOnLeave - 0.5
    //         }
    //     }

    //     if (daysOnLeave == 1 && moment(leave.start).isSame(moment(leave.end))) {
    //         // start and end same day
    //         if (leave.start_time == "PM") {
    //             daysOnLeave = daysOnLeave - 0.5
    //         } else if (leave.end_time == "AM") {
    //             daysOnLeave = daysOnLeave - 0.5
    //         }
    //     }

    //     // // TODO console.log(daysOnLeave)
    //     if (daysOnLeave == 1) return `${daysOnLeave} day`
    //     else return `${daysOnLeave} days`
};

export const workday_count = (start: Date, end: Date) =>
    differenceInBusinessDays(start, end);
const getHoursBetweenStartAndEndTimes = (
    startTime: "AM" | "PM",
    endTime: "AM" | "PM"
) => {
    let hours = 0;
    if (startTime === "AM") {
        hours += 24;
    } else if (startTime === "PM") {
        hours += 12;
    }
    if (endTime === "AM") {
        hours -= 12;
    } else if (endTime === "PM") {
        hours -= 0;
    }
    return hours;
};

export const changeTo2Digit = (input: number) => {
    if (Number(input) < 10 && Number(input) > -1) {
        return "0" + input.toString();
    } else {
        return input;
    }
};
export const replaceSlash = (string: string) => {
    return string.replace(/\//gm, "");
};
interface TempAttc {
    personnel_ID: string;
    start: Date;
    end: Date;
    [key: string]: any;
}
export const attcFilterer = (attc: TempAttc[]) => {
    let filtered: TempAttc[] = [];
    let dupes: TempAttc[] = [];
    attc.forEach((attc) => {
        // console.log(filtered)
        if (
            filtered.some(
                (addedAttc) =>
                    addedAttc.personnel_ID === attc.personnel_ID &&
                    isSameDay(addedAttc.start, attc.start) &&
                    isSameDay(addedAttc.end, attc.end)
            )
        ) {
            dupes.push(attc);
        } else {
            filtered.push(attc);
        }
    });

    return [filtered, dupes];
};

interface OutOfOffices {
    start: Date;
    end: Date;
    personnel_ID: string;
    start_time: "AM" | "PM";
    end_time: "AM" | "PM";
    [key: string]: any;
}
export const filterer = (outOfOffices: OutOfOffices[]) => {
    let filtered: OutOfOffices[] = [];
    let dupes: OutOfOffices[] = [];
    outOfOffices.forEach((outOfOffice) => {
        // console.log(filtered)
        if (
            filtered.some(
                (addedOutOfOffice) =>
                    addedOutOfOffice.personnel_ID ===
                        outOfOffice.personnel_ID &&
                    isSameDay(addedOutOfOffice.start, outOfOffice.start) &&
                    isSameDay(addedOutOfOffice.end, outOfOffice.end) &&
                    addedOutOfOffice.start_time === outOfOffice.start_time &&
                    addedOutOfOffice.end_time === outOfOffice.end_time
            )
        ) {
            dupes.push(outOfOffice);
        } else {
            filtered.push(outOfOffice);
        }
    });
    return [filtered, dupes];
};

export const sortActiveInactiveStatus = (
    statuses: ExtendedStatus[],
    date: Date
) => {
    return new Promise(async (resolve, reject) => {
        var active: ExtendedStatus[] = [];
        var inactive: ExtendedStatus[] = [];
        var duplicates: ExtendedStatus[] = [];

        var timeSel = date;

        try {
            for (var i = 0; i < statuses.length; i++) {
                var status = statuses[i];
                var p_ID = status.personnel_ID;
                // if status type is 'perm', is always active
                if (status.type == "perm") {
                    active.push(status);
                } else if (
                    (isSameDay(new Date(status.start), timeSel) ||
                        isBefore(new Date(status.start), timeSel)) &&
                    (isSameDay(new Date(status.end), timeSel) ||
                        isAfter(new Date(status.end), timeSel))
                    // moment(status.end, assignments.dateformat).isSameOrAfter(
                    //     timeSel
                    // ) &&
                    // moment(status.start, assignments.dateformat).isSameOrBefore(
                    //     timeSel
                    // )
                ) {
                    // These are all active statuses whos START is before today and END is after today

                    // See if the active array already consists of a status which is the same type, same start, same end
                    if (
                        active.some(
                            (oldStatus) =>
                                isSameDay(
                                    new Date(status.start),
                                    new Date(oldStatus.start)
                                ) &&
                                isSameDay(
                                    new Date(status.end),
                                    new Date(oldStatus.end)
                                ) &&
                                oldStatus.status_ID === status.status_ID &&
                                oldStatus.personnel_ID === status.personnel_ID
                        )
                    ) {
                        duplicates.push(status);
                    } else {
                        active.push(status);
                    }
                } else {
                    // end date is earlier than now
                    if (
                        inactive.some(
                            (oldStatus) =>
                                isSameDay(
                                    new Date(status.start),
                                    new Date(oldStatus.start)
                                ) &&
                                isSameDay(
                                    new Date(status.end),
                                    new Date(oldStatus.end)
                                ) &&
                                oldStatus.status_ID === status.status_ID &&
                                oldStatus.personnel_ID === status.personnel_ID
                        )
                    ) {
                        duplicates.push(status);
                    } else {
                        inactive.push(status);
                    }
                }
            }
            resolve([active, inactive, duplicates]);
        } catch (e) {
            reject(e);
        }
    });
};

export const changeToNextDayIfPastNoon = (date: Date) => {
    if (format(date, "aaa") === "pm")
        date = addDays(date, 1);
    return date
};

// const testTimes: { startTime: "AM" | "PM"; endTime: "AM" | "PM" }[] = [
//     { startTime: "AM", endTime: "PM" },
//     { startTime: "PM", endTime: "AM" },
//     { startTime: "AM", endTime: "AM" },
//     { startTime: "PM", endTime: "PM" },
// ];
// const results = testTimes.map((testTime) =>
//     getHoursBetweenStartAndEndTimes(testTime.startTime, testTime.endTime)
// );
// console.log(results) // [24, 0, 12, 12]
