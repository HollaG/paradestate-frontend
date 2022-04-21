import {
    addDays,
    differenceInBusinessDays,
    differenceInDays,
    differenceInMonths,
    format,
    isAfter,
    isBefore,
    isSameDay,
    parse,
    subMonths,
} from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";

import Assignments from "../config/assignments.json";

import { DictFormat } from "../pages/api/deliverables/parade-state/generate";
import { ExtendedPersonnel, Personnel } from "../types/database";
import { ExtendedStatus, GenericEvent } from "../types/types";
// import executeQuery from "./db";
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
export const parseMySQLDateHelper = (date: string) =>
    parse(date, Assignments.mysqldateformat, new Date());

export const openInNewTab = (url: string): void => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
};

export const onClickUrl =
    (url: string): (() => void) =>
    () =>
        openInNewTab(url);

export const calculateMonthsToOrFrom = (date: [Date, Date]) => {
    const diff = differenceInMonths(date[0], date[1]); // If date[1] is in the future, then this will be negative
    const days = differenceInDays(date[0], date[1]);
    if (diff > 0) {
        if (diff <= 1) {
            // one month left, return days
            return `${days} days left`;
        } else {
            // more than one month left, return months
            return `${diff} months left`;
        }
    } else if (diff < 0) {
        if (Math.abs(diff) <= 1) {
            // one month ago, return days
            return `${days} days ago`;
        } else {
            // More than 1 month ago, return months
            return `${Math.abs(diff)} months ago`;
        }
    }
};

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
    return new Promise<[ExtendedStatus[], ExtendedStatus[], ExtendedStatus[]]>(
        async (resolve, reject) => {
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
                                    oldStatus.personnel_ID ===
                                        status.personnel_ID
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
                                    oldStatus.personnel_ID ===
                                        status.personnel_ID
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
        }
    );
};

export const changeToNextDayIfPastNoon = (date: Date) => {
    if (format(date, "aaa") === "pm") date = addDays(date, 1);
    return date;
};

export const convertToAMPM = (time: string) => {
    // 1000 or 1200 or 1535
    const arr = time.split("");
    const hours = Number(`${arr[0]}${arr[1]}`);
    const minutes = Number(`${arr[2]}${arr[3]}`);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    if (hours > 12) {
        return `${hours - 12}:${formattedMinutes} PM`;
    } else {
        return `${hours}:${formattedMinutes} AM`;
    }
};

export const getLocation = async (personnel_ID: string | number) => {
    // const opts = {
    //     selDate: format(new Date(), Assignments.mysqldateformat),
    //     pID: personnel_ID,
    // };
    // const query = queryBuilder(
    //     "select * from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as a USING(personnel_ID) left join (SELECT personnel_ID, start as attc_start, end as attc_end, attc_name, row_ID as attc_row_ID FROM attc_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as b USING(personnel_ID) left join (SELECT personnel_ID, row_ID as course_row_ID, course_name, start as course_start, end as course_end FROM course_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as c USING(personnel_ID) left join (SELECT personnel_ID, start as leave_start, start_time as leave_start_time, end as leave_end, end_time as leave_end_time, reason as leave_reason, row_ID as leave_row_ID FROM leave_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as d USING(personnel_ID) left join (SELECT personnel_ID, start as off_start, start_time as off_start_time, end as off_end, end_time as off_end_time, reason as off_reason, row_ID as off_row_ID FROM off_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as e USING(personnel_ID) left join (SELECT personnel_ID, row_ID as others_row_ID, start as others_start, end as others_end, others_name, in_camp as others_incamp FROM others_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as f USING(personnel_ID) left join (SELECT personnel_ID, date as ma_date, time as ma_time, location as ma_location, ma_name, in_camp as ma_in_camp, row_ID as ma_row_ID FROM ma_tracker WHERE DATE(date) = DATE(:selDate) group by personnel_ID) as g USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE personnel_ID = :pID",
    //     opts
    // );
    // // console.log(query);
    // const personnel: ExtendedPersonnel[] = await executeQuery({
    //     query: query.sql,
    //     values: query.values,
    // });
    // if (!personnel) return null;
    // const person = personnel[0];
    // const hasEvent: any[] = [];
    // const noEvent: any[] = [];
    // const strArr = [];
    // let hasAnEvent = false;
    // if (person.attc_row_ID) strArr.push("On AttC");
    // if (person.course_row_ID) strArr.push("On course");
    // if (person.leave_row_ID) strArr.push("On leave");
    // if (person.off_row_ID) strArr.push("On off");
    // if (person.ma_row_ID) {
    //     if (person.ma_in_camp) {
    //         strArr.push("On MA (In camp)");
    //     } else {
    //         strArr.push("On MA");
    //     }
    // }
    // if (person.others_row_ID) {
    //     if (person.others_in_camp) {
    //         strArr.push("Others (In camp)");
    //     } else {
    //         strArr.push("Others");
    //     }
    // }
    // if (!strArr.length) {
    //     strArr.push("In camp");
    //     hasAnEvent = true;
    // }
    // const str = strArr.join(", ");
    // person.location = str;
    // // Remove null values
    // const cleansed = Object.fromEntries(
    //     Object.entries(person).filter(([_, v]) => v != null)
    // ) as ExtendedPersonnel;
    // return cleansed;
};
// export const generatePSObject = async (a: any, b: any, c: any, d: any, e: any, f: any) => {}
export const generatePSObject = async (
    platoon: string,
    date: string,
    unit: string,
    company: string,
    owner: string,
    executeQuery: any
) => {
    const parsedDate = parse(date, Assignments.mysqldateformat, new Date());

    const selectedDate = format(parsedDate, Assignments.dateformat);
    const mysqlFormatted = date;
    let personnel: Personnel[] = [];
    if (platoon == "Company") {
        // if is to generate for the whole company
        personnel = await executeQuery({
            query: `SELECT * FROM personnel WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) AND DATE(post_in) <= DATE(?) ORDER BY platoon ASC`,
            values: [unit, company, mysqlFormatted, mysqlFormatted],
        });
    } else {
        personnel = await executeQuery({
            query: `SELECT * FROM personnel WHERE unit = ? AND company = ? AND platoon = ? AND DATE(ord) >= DATE(?) AND DATE(post_in) <= DATE(?)`,
            values: [unit, company, platoon, mysqlFormatted, mysqlFormatted],
        });
    }

    // Sort personnel by platoon
    // get personnel_IDs to query later
    const personnel_IDs: string[] = [];
    const sortedByPlatoon = personnel.reduce<{
        [key: string]: Personnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});

    let accounter: { [key: string]: any } = {};

    // Count total strength, in each tracker, minus away if criteria are met
    // Trackers where we should minus away strength: ATTC/ LEAVE / OFF / COURSE / OTHERS / MA BEFORE 1000 OUTSIDE OF CAMP
    let subtractedPersonnel: string[] = []; // create a array to store subtracted personnel's IDs so that we don't accidentally double subtract

    for (let platoon of Object.keys(sortedByPlatoon)) {
        let personnelInPlatoon = sortedByPlatoon[platoon];

        accounter[platoon] = {
            PLATOON: platoon,
            OFFICER_WOSPEC_PRESENT: 0,
            SPEC_PRESENT: 0,
            MEN_PRESENT: 0,
            OFFICER_WOSPEC_TOTAL: 0,
            SPEC_TOTAL: 0,
            MEN_TOTAL: 0,
        };

        personnelInPlatoon.forEach((person) => {
            if (Assignments.commander.officer_wospec.includes(person.rank)) {
                // person is an officer
                accounter[platoon].OFFICER_WOSPEC_PRESENT =
                    accounter[platoon].OFFICER_WOSPEC_PRESENT + 1;
                accounter[platoon].OFFICER_WOSPEC_TOTAL =
                    accounter[platoon].OFFICER_WOSPEC_TOTAL + 1;
            } else if (Assignments.commander.spec.includes(person.rank)) {
                // person is a spec
                accounter[platoon].SPEC_PRESENT =
                    accounter[platoon].SPEC_PRESENT + 1;
                accounter[platoon].SPEC_TOTAL =
                    accounter[platoon].SPEC_TOTAL + 1;
            } else {
                // person is a men
                accounter[platoon].MEN_PRESENT =
                    accounter[platoon].MEN_PRESENT + 1;
                accounter[platoon].MEN_TOTAL = accounter[platoon].MEN_TOTAL + 1;
            }

            personnel_IDs.push(person.personnel_ID.toString());
        });
    }

    if (!personnel_IDs.length) return null;

    let dict: DictFormat = {
        // Is the parade state being generated for the company? if so, use the user's company, if not, set it to the platoon name
        "PLATOON-NAME":
            platoon == "Company"
                ? company.toUpperCase()
                : platoon.toUpperCase(),
        "SELECTED-DATE": replaceSlash(selectedDate),
        "INCLUDE-PLATOONS": [],
        "INCLUDE-ATTC": [],
        "INCLUDE-OFF": [],
        "INCLUDE-LEAVE": [],
        "INCLUDE-MA": [],
        "INCLUDE-STATUS": [],
        "INCLUDE-COURSE": [],
        "INCLUDE-OTHERS": [],
        "GENERATE-TIMING": format(new Date(), Assignments.datetimeformat),
        "GENERATE-OWNER": owner,
    };

    // Using the list of personnel_IDs,
    // check the 6 tables to see if START BEFORE TODAY and END AFTER TODAY

    // Checking ATTC table

    const attc_personnel = await executeQuery({
        query: `SELECT * FROM attc_tracker LEFT JOIN personnel ON attc_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND personnel.personnel_ID IN (?) AND DATE(ord) >= DATE(?) AND DATE(start) <= DATE(?) AND DATE(END) >= DATE(?) ORDER BY platoon ASC`,
        values: [
            unit,
            company,
            personnel_IDs,
            mysqlFormatted,
            mysqlFormatted,
            mysqlFormatted,
        ],
    });

    const [filteredAttcs, duplicateAttcs] = attcFilterer(attc_personnel);

    filteredAttcs.forEach((person) => {
        dict["INCLUDE-ATTC"].push({
            INDEX: dict["INCLUDE-ATTC"].length + 1,
            PID: person.personnel_ID,
            RANK: person.rank,
            NAME: person.name,
            START: replaceSlash(
                format(new Date(person.start), Assignments.dateformat)
            ),
            END: replaceSlash(
                format(new Date(person.end), Assignments.dateformat)
            ),
        });

        // if person is already subtracted, we don't do anything:
        if (!subtractedPersonnel.includes(person.personnel_ID)) {
            // Add to subtracted count
            subtractedPersonnel.push(person.personnel_ID);

            // Update the numbers in the total strength
            if (Assignments.commander.officer_wospec.includes(person.rank)) {
                // person is an officer
                accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                    accounter[person.platoon].OFFICER_WOSPEC_PRESENT - 1;
            } else if (Assignments.commander.spec.includes(person.rank)) {
                // person is a spec
                accounter[person.platoon].SPEC_PRESENT =
                    accounter[person.platoon].SPEC_PRESENT - 1;
            } else {
                // person is a men

                accounter[person.platoon].MEN_PRESENT =
                    accounter[person.platoon].MEN_PRESENT - 1;
            }
        }
    });

    // Checking OFF table
    const off_personnel = await executeQuery({
        query: `SELECT * FROM off_tracker LEFT JOIN personnel ON off_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(off_tracker.start) <= DATE(?) AND DATE(off_tracker.end) >= DATE(?) AND personnel.personnel_ID IN (?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC`,
        values: [
            unit,
            company,
            mysqlFormatted,
            mysqlFormatted,
            personnel_IDs,
            mysqlFormatted,
        ],
    });

    const [filteredOffs, duplicateOffs] = filterer(off_personnel);

    filteredOffs.forEach((person) => {
        let o = {
            INDEX: dict["INCLUDE-OFF"].length + 1,
            PID: person.personnel_ID,
            RANK: person.rank,
            NAME: person.name,
            TYPE: "",
        };
        // How to insert (AM) or (PM)?
        // if TODAY is = START_DATE or if TODAY = END DATE then we bother to check

        // Example: Today is 10/01
        // A takes leave from 10/01 AM - 12/01 PM --> don't display
        // B takes leave from 10/01 PM - 12/01 PM --> display
        // C takes leave from 08/01 AM - 10/01 AM --> display
        // D takes leave from 08/01 AM - 10/01 PM --> don't display
        // Z takes leave from 10/01 AM - 10/01 PM --> don't display
        // Y takes leave from 10/01 AM - 10/01 AM --> display (half day off)
        // X takes leave from 10/01 PM - 10/01 PM --> display (half day off)

        if (
            isSameDay(person.start, parsedDate) &&
            isSameDay(person.end, parsedDate)
        ) {
            // start and end same day

            if (person.start_time == person.end_time) {
                // display (half day)
                o["TYPE"] = `(${person.start_time})`;
            } else {
            }
        } else if (isSameDay(person.start, parsedDate)) {
            // today = start date
            if (person.start_time == "PM") {
                // display
                // PM off only
                o["TYPE"] = `(${person.start_time})`;
            }
        } else if (isSameDay(person.end, parsedDate)) {
            // today = end date

            if (person.end_time == "AM") {
                // display
                // AM off only
                o["TYPE"] = `(${person.end_time})`;
            }
        }

        dict["INCLUDE-OFF"].push(o);
        // If person is on PM off, we ignore the calculations as he is still in camp at 0800
        // Note that we cannot simply take person.start_time == "PM" as this will falsely include anyone who takes PM off before the actual date being counted
        if (o["TYPE"] != "(PM)") {
            // if person is already subtracted, we don't do anything:
            if (!subtractedPersonnel.includes(person.personnel_ID)) {
                // Add to subtracted count
                subtractedPersonnel.push(person.personnel_ID);

                // Update the numbers in the total strength
                if (
                    Assignments.commander.officer_wospec.includes(person.rank)
                ) {
                    // person is an officer
                    accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                        accounter[person.platoon].OFFICER_WOSPEC_PRESENT - 1;
                } else if (Assignments.commander.spec.includes(person.rank)) {
                    // person is a spec
                    accounter[person.platoon].SPEC_PRESENT =
                        accounter[person.platoon].SPEC_PRESENT - 1;
                } else {
                    // person is a men
                    accounter[person.platoon].MEN_PRESENT =
                        accounter[person.platoon].MEN_PRESENT - 1;
                }
            }
        }
    });

    // Checking LEAVE table
    const leave_personnel = await executeQuery({
        query: `SELECT * FROM leave_tracker LEFT JOIN personnel ON leave_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(leave_tracker.start) <= DATE(?) AND DATE(leave_tracker.end) >= DATE(?) AND personnel.personnel_ID IN (?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC`,
        values: [
            unit,
            company,
            mysqlFormatted,
            mysqlFormatted,
            personnel_IDs,
            mysqlFormatted,
        ],
    });

    const [filteredLeaves, duplicateLeaves] = filterer(leave_personnel);

    filteredLeaves.forEach((person) => {
        let o = {
            INDEX: dict["INCLUDE-LEAVE"].length + 1,
            PID: person.personnel_ID,
            RANK: person.rank,
            NAME: person.name,
            TYPE: "",
        };
        // How to insert (AM) or (PM)?
        // if TODAY is = START_DATE or if TODAY = END DATE then we bother to check

        // Example: Today is 10/01
        // A takes leave from 10/01 AM - 12/01 PM --> don't display
        // B takes leave from 10/01 PM - 12/01 PM --> display
        // C takes leave from 08/01 AM - 10/01 AM --> display
        // D takes leave from 08/01 AM - 10/01 PM --> don't display
        // Z takes leave from 10/01 AM - 10/01 PM --> don't display
        // Y takes leave from 10/01 AM - 10/01 AM --> display (half day off)
        // X takes leave from 10/01 PM - 10/01 PM --> display (half day off)
        if (
            isSameDay(person.start, parsedDate) &&
            isSameDay(person.end, parsedDate)
        ) {
            // start and end same day

            if (person.start_time == person.end_time) {
                // display (half day)
                o["TYPE"] = `(${person.start_time})`;
            }
        } else if (isSameDay(person.start, parsedDate)) {
            // today = start date
            if (person.start_time == "PM") {
                // display
                // PM off only
                o["TYPE"] = `(${person.start_time})`;
            }
        } else if (isSameDay(person.end, parsedDate)) {
            // today = end date

            if (person.end_time == "AM") {
                // display
                // AM off only
                o["TYPE"] = `(${person.end_time})`;
            }
        }

        dict["INCLUDE-LEAVE"].push(o);

        // If person is on PM leave, we ignore the calculations as he is still in camp at 0800
        // Note that we cannot simply take person.start_time == "PM" as this will falsely include anyone who takes PM off before the actual date being counted
        if (o["TYPE"] != "(PM)") {
            // if person is already subtracted, we don't do anything:
            if (!subtractedPersonnel.includes(person.personnel_ID)) {
                // Add to subtracted count
                subtractedPersonnel.push(person.personnel_ID);

                // Update the numbers in the total strength
                if (
                    Assignments.commander.officer_wospec.includes(person.rank)
                ) {
                    // person is an officer
                    accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                        accounter[person.platoon].OFFICER_WOSPEC_PRESENT - 1;
                } else if (Assignments.commander.spec.includes(person.rank)) {
                    // person is a spec
                    accounter[person.platoon].SPEC_PRESENT =
                        accounter[person.platoon].SPEC_PRESENT - 1;
                } else {
                    // person is a men
                    accounter[person.platoon].MEN_PRESENT =
                        accounter[person.platoon].MEN_PRESENT - 1;
                }
            }
        }
    });

    // Checking MA table
    // Specify the MA table column name as ma_name to avoid confusion with personnel table
    var ma_personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM ma_tracker LEFT JOIN personnel ON ma_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(ma_tracker.date) = DATE(?) AND personnel.personnel_ID IN (?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC`,
        values: [unit, company, mysqlFormatted, personnel_IDs, mysqlFormatted],
    });
    ma_personnel.forEach((person) => {
        dict["INCLUDE-MA"].push({
            INDEX: dict["INCLUDE-MA"].length + 1,
            PID: person.personnel_ID,
            RANK: person.rank,
            NAME: person.name,
            TIME: person.time,
            MA_NAME: person.ma_name,
            LOCATION: person.location,
            IN_CAMP: person.in_camp,
        });

        // if MA is in-camp, don't do anything:

        if (!person.in_camp) {
            // if MA is before 1000hrs, subtract him from the parade state
            if (Number(person.time) < 1000) {
                // if person is already subtracted, we don't do anything:
                if (
                    !subtractedPersonnel.includes(
                        person.personnel_ID.toString()
                    )
                ) {
                    // Add to subtracted count
                    subtractedPersonnel.push(person.personnel_ID.toString());

                    // Update the numbers in the total strength
                    if (
                        Assignments.commander.officer_wospec.includes(
                            person.rank
                        )
                    ) {
                        // person is an officer
                        accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                            accounter[person.platoon].OFFICER_WOSPEC_PRESENT -
                            1;
                    } else if (
                        Assignments.commander.spec.includes(person.rank)
                    ) {
                        // person is a spec
                        accounter[person.platoon].SPEC_PRESENT =
                            accounter[person.platoon].SPEC_PRESENT - 1;
                    } else {
                        // person is a men
                        accounter[person.platoon].MEN_PRESENT =
                            accounter[person.platoon].MEN_PRESENT - 1;
                    }
                }
            }
        }
    });

    // Checking STATUS table

    const status_personnel = await executeQuery({
        query: `SELECT * FROM status_tracker LEFT JOIN personnel ON status_tracker.personnel_ID = personnel.personnel_ID LEFT JOIN status_list ON status_tracker.status_ID = status_list.status_ID WHERE (personnel.unit = ? AND personnel.company = ? AND DATE(ord) >= DATE(?) OR type = 'perm') AND personnel.personnel_ID IN (?)  ORDER BY platoon ASC`,
        values: [unit, company, mysqlFormatted, personnel_IDs],
    });

    const funcResultArr = (await sortActiveInactiveStatus(
        status_personnel,
        parsedDate
    )) as ExtendedStatus[][];

    const activeStatuses = funcResultArr[0];

    // Order by person
    const groupedByPersonnel_ID = activeStatuses.reduce<{
        [key: string]: ExtendedStatus[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    for (let personnel_ID of Object.keys(groupedByPersonnel_ID)) {
        let statuses = groupedByPersonnel_ID[personnel_ID];

        let o: {
            INDEX: number;
            PID: string;
            RANK: string;
            NAME: string;
            "INCLUDE-STATUSES": any[];
        } = {
            INDEX: dict["INCLUDE-STATUS"].length + 1,
            PID: statuses[0].personnel_ID.toString(),
            RANK: statuses[0].rank,
            NAME: statuses[0].name,
            "INCLUDE-STATUSES": [],
        };

        statuses.forEach((status) => {
            // if perm, we must add the full duration
            if (status.type === "perm") {
                let custStart = replaceSlash(
                    format(new Date(status.post_in), Assignments.dateformat)
                );
                let custEnd = replaceSlash(
                    format(new Date(status.ord), Assignments.dateformat)
                );
                o["INCLUDE-STATUSES"].push({
                    INDEX: o["INCLUDE-STATUSES"].length + 1,
                    NAME: status.status_name,
                    TYPE: status.type,
                    START: custStart,
                    END: custEnd,
                    STRING: `Perm`,
                });
            } else {
                let custStart = replaceSlash(
                    format(new Date(status.start), Assignments.dateformat)
                );
                let custEnd = replaceSlash(
                    format(new Date(status.end), Assignments.dateformat)
                );

                o["INCLUDE-STATUSES"].push({
                    INDEX: o["INCLUDE-STATUSES"].length + 1,
                    NAME: status.status_name,
                    TYPE: status.type,
                    START: custStart,
                    END: custEnd,
                    STRING: `${custStart} - ${custEnd}`,
                });
            }
        });

        dict["INCLUDE-STATUS"].push(o);
    }

    // Checking COURSE table
    const course_personnel: GenericEvent[] = await executeQuery({
        query: `SELECT * FROM course_tracker LEFT JOIN personnel ON course_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(course_tracker.start) <= DATE(?) AND DATE(course_tracker.end) >= DATE(?) AND personnel.personnel_ID IN (?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC`,
        values: [
            unit,
            company,
            mysqlFormatted,
            mysqlFormatted,
            personnel_IDs,
            mysqlFormatted,
        ],
    });
    // Returns active attcs

    course_personnel.forEach((person) => {
        dict["INCLUDE-COURSE"].push({
            INDEX: dict["INCLUDE-COURSE"].length + 1,
            PID: person.personnel_ID,
            RANK: person.rank,
            NAME: person.name,
            START: replaceSlash(format(person.start, Assignments.dateformat)),
            END: replaceSlash(format(person.end, Assignments.dateformat)),
            COURSE_NAME: person.course_name,
        });
        // if person is already subtracted, we don't do anything:
        if (!subtractedPersonnel.includes(person.personnel_ID)) {
            // Add to subtracted count
            subtractedPersonnel.push(person.personnel_ID);

            // Update the numbers in the total strength
            if (Assignments.commander.officer_wospec.includes(person.rank)) {
                // person is an officer
                accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                    accounter[person.platoon].OFFICER_WOSPEC_PRESENT - 1;
            } else if (Assignments.commander.spec.includes(person.rank)) {
                // person is a spec
                accounter[person.platoon].SPEC_PRESENT =
                    accounter[person.platoon].SPEC_PRESENT - 1;
            } else {
                // person is a men
                accounter[person.platoon].MEN_PRESENT =
                    accounter[person.platoon].MEN_PRESENT - 1;
            }
        }
    });

    // Checking OTHERS table
    const others_personnel: GenericEvent[] = await executeQuery({
        query: `SELECT * FROM others_tracker LEFT JOIN personnel ON others_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(others_tracker.start) <= DATE(?) AND DATE(others_tracker.end) >= DATE(?) AND personnel.personnel_ID IN (?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC`,
        values: [
            unit,
            company,
            mysqlFormatted,
            mysqlFormatted,
            personnel_IDs,
            mysqlFormatted,
        ],
    });
    // Returns active attcs

    others_personnel.forEach((person) => {
        dict["INCLUDE-OTHERS"].push({
            INDEX: dict["INCLUDE-OTHERS"].length + 1,
            PID: person.personnel_ID,
            RANK: person.rank,
            NAME: person.name,
            START: replaceSlash(format(person.start, Assignments.dateformat)),
            END: replaceSlash(format(person.start, Assignments.dateformat)),
            OTHERS_NAME: person.others_name,
        });

        // if the others is in-camp, don't do anything:
        if (!person.in_camp) {
            // if others is before 1000hrs, subtract him from the parade state
            // if (moment(person.time, 'hhmm').isBefore(moment("1000", "hhmm"))) { }

            // if person is already subtracted, we don't do anything:
            if (!subtractedPersonnel.includes(person.personnel_ID)) {
                // Add to subtracted count
                subtractedPersonnel.push(person.personnel_ID);

                // Update the numbers in the total strength
                if (
                    Assignments.commander.officer_wospec.includes(person.rank)
                ) {
                    // person is an officer
                    accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                        accounter[person.platoon].OFFICER_WOSPEC_PRESENT - 1;
                } else if (Assignments.commander.spec.includes(person.rank)) {
                    // person is a spec
                    accounter[person.platoon].SPEC_PRESENT =
                        accounter[person.platoon].SPEC_PRESENT - 1;
                } else {
                    // person is a men
                    accounter[person.platoon].MEN_PRESENT =
                        accounter[person.platoon].MEN_PRESENT - 1;
                }
            }
        }
    });

    // change accounter into array form

    var accounterArr = [];

    var totalPresent = 0;
    var totalPax = 0;
    for (let platoon of Object.keys(accounter)) {
        accounter[platoon].PRESENT =
            accounter[platoon].OFFICER_WOSPEC_PRESENT +
            accounter[platoon].SPEC_PRESENT +
            accounter[platoon].MEN_PRESENT;
        accounter[platoon].TOTAL =
            accounter[platoon].OFFICER_WOSPEC_TOTAL +
            accounter[platoon].SPEC_TOTAL +
            accounter[platoon].MEN_TOTAL;

        totalPresent = totalPresent + accounter[platoon].PRESENT;
        totalPax = totalPax + accounter[platoon].TOTAL;
        accounterArr.push(accounter[platoon]);
    }
    dict["INCLUDE-PLATOONS"] = accounterArr;

    // Tally some numbers, the pax for MA / off etc
    dict["ATTC-PAX"] = changeTo2Digit(dict["INCLUDE-ATTC"].length);
    dict["OFF-PAX"] = changeTo2Digit(dict["INCLUDE-OFF"].length);
    dict["LEAVE-PAX"] = changeTo2Digit(dict["INCLUDE-LEAVE"].length);
    dict["MA-PAX"] = changeTo2Digit(dict["INCLUDE-MA"].length);
    dict["STATUS-PAX"] = changeTo2Digit(dict["INCLUDE-STATUS"].length);
    dict["COURSE-PAX"] = changeTo2Digit(dict["INCLUDE-COURSE"].length);
    dict["OTHERS-PAX"] = changeTo2Digit(dict["INCLUDE-OTHERS"].length);
    dict["TOTAL-PRESENT"] = totalPresent;
    dict["TOTAL-PAX"] = totalPax;

    return dict;
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

export const getDaysArray = function (s: Date, e: Date) {
    for (
        var a = [], d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
    ) {
        a.push(new Date(d));
    }
    return a;
};

export const isYearTwo = (svc_status: string, ord: Date) => {
    if (svc_status === "REG") {
        return true;
    }
    const secondYearDate = subMonths(ord, 10);
    if (isBefore(secondYearDate, new Date())) return true;
    else return false;
};
