import { differenceInBusinessDays, format } from "date-fns";

import Assignments from "../config/assignments.json";
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
