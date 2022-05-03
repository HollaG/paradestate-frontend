// Notes:
// - When posted in, HA is considered achieved
// - Date loops until the latest activity date + 15 days for HA to expire

import { addDays, subMonths, isAfter, subDays, isBefore } from "date-fns";
import { Personnel } from "../types/database";
import { getDaysArray, formatMySQLDateHelper } from "./custom";
import executeQuery from "./db";
const determineIfHAEnded = (
    dateArray: string[],
    activitiesMap: { [key: string]: number }
) => {
    // Special - max 1 PT per day is allowed
    let ptDates = Object.keys(activitiesMap);

    let daysSinceLastPt = 0;
    let daysSinceSecondLastPt = 0;

    let dateEnded = null;
    for (let i = 0; i < dateArray.length; i++) {
        let date = dateArray[i];

        daysSinceLastPt++; // 1
        daysSinceSecondLastPt++;

        if (daysSinceLastPt > 14) {
            // no more HA
            dateEnded = date;
            // can break loop
            // console.log(`Lost HA on day ${day} for test ${test}`);
            break;
        }
        if (ptDates.includes(date)) {
            // psuedo - this part runs when there is a PT on that day
            if (daysSinceLastPt === 14) {
                // it's 14 days since the last PT, which means that the second last PT was more than 14 days ago
                // this breaks the HA loop - this PT will NOT reset the daysSinceLastPt
            } else {
                daysSinceSecondLastPt = daysSinceLastPt;
                daysSinceLastPt = 0;
            }
        }
    }
    return dateEnded;
};

const determineIfYearOneAchievedHA = (
    dateArray: string[],
    activitiesMap: { [key: string]: number }
) => {
    // find the nearest Monday in dateArray
    const ptDates = Object.keys(activitiesMap);
    
    let nearestMonday = dateArray.findIndex(
        (date) => new Date(date).getDay() === 1
    );
    // let nearestMonday = dateArray.findIndex((date) => date.includes("Mon"))
    // remove all dates before the nearest Monday
    dateArray = dateArray.slice(nearestMonday);

    // let i = 0

    let dateAchieved = null;
    let streakBroken = false;
    let consecutivePTDays = 0; // working days only
    for (let i = 0; i < dateArray.length; i++) {
        let date = dateArray[i];

        if (consecutivePTDays >= 10) {
            dateAchieved = date;
            break;
        }

        if (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) {
            // weekend
            continue;
        }

        if (new Date(date).getDay() === 1) {
            // Monday

            streakBroken = false; // reset streak for trying again

            // if (ptDates.includes(day)) {
            //     // does the day have a PT?
            //     consecutivePTDays++;
            // }
        }

        if (streakBroken) continue; // if streak is broken, skip this day (this will reset back to false the next monday)

        // if (![0, 1, 6].includes(date.getDay())) {
        if (!ptDates.includes(date)) {
            streakBroken = true; // skip until the next Monday because there's no way this week will be achieving HA
            consecutivePTDays = 0;
        } else {
            consecutivePTDays++;
        }
        // }
    }
    return dateAchieved;
};

const determineIfYearTwoAchievedHA = (
    dateArray: string[],
    activitiesMap: { [key: string]: number }
) => {
    // HA is achieved when:
    // within 9 days,
    // - 13 conducts
    // - max 2 per day

    const ptDates = Object.keys(activitiesMap);
    let score = 0;
    let dateAchieved = null;
    for (let i = 0; i < dateArray.length; i++) {
        let date = dateArray[i];

        // if (date.getDay() === 0 || date.getDay() === 6) {
        //     // weekend
        //     continue;
        // }

        if (score >= 13) {
            // HA achieved
            dateAchieved = date;
            break;
        }

        if (ptDates.includes(date)) {
            // clamp to max 2 HA units per day TODO
            score = score + (activitiesMap[date] > 2 ? 2 : activitiesMap[date]);
        }
        // look back 9 days
        // is there a PT 9 days ago? if so, subtract the score by the number of PTs on that day,

        const index = dateArray.indexOf(date);
        const lookBack = index - 9;
        if (lookBack < 0) {
        } else {
            const date9DaysBack = dateArray[lookBack];
            if (ptDates.includes(date9DaysBack)) {
                // clamp to subtracting max 2 HA units per day TODO
                score = score - (activitiesMap[date9DaysBack] > 2 ? 2 : activitiesMap[date9DaysBack]); // TODO
            }
        }
    }

    return dateAchieved;
};
export const refreshAll = async (company: string, unit: string) => {
    console.log("------------ BEGIN UPDATING HA STATUS (ALL) ------------");

    // grab a list of all activities
    const activities: {
        activity_ID: number;
        date: Date;
        contributes: string;
    }[] = await executeQuery({
        // todo set limit of looking back to the earliest post in of the currently active personnel
        // query: `SELECT activity_ID, date, contributes FROM activity_list WHERE company = ? AND unit = ? AND DATE(date) <= DATE(NOW()) AND contributes > 0`,
        query: `SELECT activity_ID, date, contributes FROM activity_list WHERE company = ? AND unit = ? AND contributes > 0 ORDER BY date ASC`,
        values: [company, unit],
    });

    // const personnel_IDs = [259]; // todo to change
    const activePersonnel: Personnel[] = await executeQuery({
        query: `SELECT *, CASE WHEN (personnel.ha_end_date) > (NOW()) THEN true ELSE false END AS ha_active FROM personnel WHERE DATE(ord) >= DATE(NOW()) AND DATE(post_in) <= DATE(NOW()) AND company = ? AND unit = ?`,
        values: [company, unit],
    });

    const activePersonnelIDs = activePersonnel.map((p) => p.personnel_ID);
    await executeQuery({
        query: `DELETE FROM ha_events WHERE personnel_ID IN (?)`,
        values: [activePersonnelIDs],
    });
    if (!activities.length) { 
        // for each personnel run the noActivitiesFunc
        console.log("No activities for overall")
        for (const person of activePersonnel) {
            await noActivitiesAtAll(person);
        }
        return 
    }

    // For each activity, if the activity 'contributes' value is > 1, duplicate the activity

    const stringifiedActivitiesArray = activities.map((activity) => ({
        ...activity,
        stringifiedDate: activity.date.toDateString(),
    }));

    // Map activities to date key
    const mappedActivities: {
        [key: string]: {
            activity_ID: number;
            date: Date;
            stringifiedDate: string;
            contributes: string;
        }[];
    } = stringifiedActivitiesArray.reduce(
        (
            r: {
                [key: string]: {
                    activity_ID: number;
                    date: Date;
                    stringifiedDate: string;
                    contributes: string;
                }[];
            },
            a
        ) => {
            r[a.stringifiedDate] = [...(r[a.stringifiedDate] || []), a];
            return r;
        },
        {}
    );

    // Construct object to find out who went for what activities
    const activity_IDs = activities.map((activity) => activity.activity_ID);
    const attendeesObject: {
        activity_ID: number;
        personnel_ID: number;
    }[] = activity_IDs.length
        ? await executeQuery({
              query: `SELECT * FROM activity_attendees WHERE activity_ID IN (?)`,
              values: [activity_IDs],
          })
        : [];

    // Group according to personnel ID
    const attendedActivitiesGroupedByPersonnelID = attendeesObject.reduce<{
        [key: string]: {
            activity_ID: number;
            personnel_ID: number;
        }[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    // Clean up the object
    let cleanedAttendees: { [key: string]: number[] } = {};
    for (let personnelID in attendedActivitiesGroupedByPersonnelID) {
        cleanedAttendees[personnelID] = attendedActivitiesGroupedByPersonnelID[
            personnelID
        ].map((a) => a.activity_ID);
    }

    // construct the date range
    // const now = new Date(); // TODO
    // const now = new Date("2022-07-01");
    // const end = addDays(new Date(), 15);

    // end look date shuold be the latest activity date that's active
    const end = addDays(activities[activities.length - 1].date, 15);

    
    // const personnelMap = activePersonnel.reduce<{
    //     [key: string]: Personnel[];
    // }>((r, a) => {
    //     r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
    //     return r;
    // }, {});

    const results = [];

    const resultMap: {
        [key: string]: {
            date: string;
            type: string;
        }[][];
    } = {};

   

    const allEventValues: any[][] = [];
    for (const person of activePersonnel) {
        if (!person) return { error: "No personnel found!" };

        const ord = person.ord; // end date
        const post_in = person.post_in; // start date
        const secondYearDate =
            person.svc_status === "REG" ? post_in : subMonths(ord, 10);

        let dateArrayHAForFirstYear: Date[] = [];
        let dateArrayHAForSecondYear: Date[] = [];
        // check if we've passed the second year mark
        let isSecondYear = false;
        if (isAfter(end, secondYearDate)) {
            // this dude is a second year soldier

            dateArrayHAForFirstYear = getDaysArray(post_in, secondYearDate);
            // todo edge case - if the interval between post_in and ord is less than 10 months,
            // secondYearDate will be before post_in.
            // therefore,
            // instead if subbing 12 days from secondYearDate,
            // check if secondYearDate is before post_in, if so, then use post_in instead
            dateArrayHAForSecondYear = getDaysArray(
                isBefore(secondYearDate, post_in)
                    ? post_in
                    : subDays(secondYearDate, 12), // 12 days before the start of 2nd year to account for them doing the 10 consective PTs before the swap to 2nd year
                end
            );

            isSecondYear = true;
        } else {
            // solely first year soldier
            dateArrayHAForFirstYear = getDaysArray(post_in, end);
        }

        const stringifiedDateArrayForFirstYear = dateArrayHAForFirstYear.map(
            (date) => date.toDateString()
        );
        const stringifiedDateArrayForSecondYear = dateArrayHAForSecondYear.map(
            (date) => date.toDateString()
        );

        // Start of main work
        let events: {
            date: string;
            type: string;
        }[][] = [[], []];

        let currentlyOnHA = true;

        const recursiveCalculateFirstYear = (
            stringifiedDateArrayForFirstYear: string[],
            mappedActivities: { [key: string]: number }
        ) => {
            if (currentlyOnHA) {
                const endedInFirstYear = determineIfHAEnded(
                    stringifiedDateArrayForFirstYear,
                    mappedActivities
                );
                if (endedInFirstYear) {
                    events[0].push({
                        date: endedInFirstYear,
                        type: "ended",
                    });
                    currentlyOnHA = false;
                    // failed to maintain, execute first year protocol
                    // From the first year date array, cut out the dates 9 days before the endedInFirstYear date,
                    // get the index of the returned date in the array
                    const indexEnded =
                        stringifiedDateArrayForFirstYear.indexOf(
                            endedInFirstYear
                        );
                    if (indexEnded < 0)
                        return console.log(
                            "error, idk  index not found",
                            endedInFirstYear
                        );

                    const indexEndedToRemoveUntil =
                        indexEnded - 9 < 0 ? 0 : indexEnded - 9;
                    const trimmedDates = stringifiedDateArrayForFirstYear.slice(
                        indexEndedToRemoveUntil
                    );
                    recursiveCalculateFirstYear(trimmedDates, mappedActivities);
                }
            } else {
                const resumedDate = determineIfYearOneAchievedHA(
                    stringifiedDateArrayForFirstYear,
                    mappedActivities
                );
                if (resumedDate) {
                    // personnel resumed HA after being on hiatus
                    events[0].push({
                        date: resumedDate,
                        type: "resumed",
                    });
                    currentlyOnHA = true;

                    // Enter maintenance phase
                    // From the trimmed dates, cut out the dates 14 days before the resumed date,
                    // get the index of the returned date in the array
                    const index =
                        stringifiedDateArrayForFirstYear.indexOf(resumedDate);
                    const indexToRemoveUntil = index - 14 < 0 ? 0 : index - 14;
                    const trimmedDates =
                        stringifiedDateArrayForFirstYear.slice(
                            indexToRemoveUntil
                        );
                    recursiveCalculateFirstYear(trimmedDates, mappedActivities);
                }
            }
        };
        const recursiveCalculateSecondYear = (
            stringifiedDateArrayForSecondYear: string[],
            mappedActivities: { [key: string]: number }
        ) => {
            if (currentlyOnHA) {
                const endedInSecondYear = determineIfHAEnded(
                    stringifiedDateArrayForSecondYear,
                    mappedActivities
                );
                if (endedInSecondYear) {
                    events[1].push({
                        date: endedInSecondYear,
                        type: "ended",
                    });
                    currentlyOnHA = false;
                    // failed to maintain, execute first year protocol
                    // From the first year date array, cut out the dates 9 days before the endedInFirstYear date,
                    // get the index of the returned date in the array
                    const indexEnded =
                        stringifiedDateArrayForSecondYear.indexOf(
                            endedInSecondYear
                        );
                    if (indexEnded < 0)
                        return console.log(
                            "error, idk  index not found",
                            endedInSecondYear
                        );

                    const indexEndedToRemoveUntil =
                        indexEnded - 9 < 0 ? 0 : indexEnded - 9;
                    const trimmedDates =
                        stringifiedDateArrayForSecondYear.slice(
                            indexEndedToRemoveUntil
                        );
                    recursiveCalculateSecondYear(
                        trimmedDates,
                        mappedActivities
                    );
                }
            } else {
                const resumedDate = determineIfYearTwoAchievedHA(
                    stringifiedDateArrayForSecondYear,
                    mappedActivities
                );

                if (resumedDate) {
                    // personnel resumed HA after being on hiatus
                    events[1].push({
                        date: resumedDate,
                        type: "resumed",
                    });
                    currentlyOnHA = true;

                    // Enter maintenance phase
                    // From the trimmed dates, cut out the dates 14 days before the resumed date,
                    // get the index of the returned date in the array
                    const index =
                        stringifiedDateArrayForSecondYear.indexOf(resumedDate);
                    const indexToRemoveUntil = index - 14 < 0 ? 0 : index - 14;
                    const trimmedDates =
                        stringifiedDateArrayForSecondYear.slice(
                            indexToRemoveUntil
                        );
                    recursiveCalculateSecondYear(
                        trimmedDates,
                        mappedActivities
                    );
                }
            }
        };

        // Filter the activities to only include the ones that are attended by this person
        let mappedActivitiesFinal: { [key: string]: number } = {};
        const attendedActivityIDsArray = cleanedAttendees[person.personnel_ID];
        if (attendedActivityIDsArray) {
            // skip if no activities attended at all, which means mappedActivitiesFinal is empty
            for (let date in mappedActivities) {
                const activitiesOnThisDate = mappedActivities[date];

                let numberAttended = 0;
                activitiesOnThisDate.forEach((activity) => {
                    if (
                        attendedActivityIDsArray.includes(activity.activity_ID)
                    ) {
                        numberAttended =
                            Number(activity.contributes) + numberAttended;
                        // add the number attended to the contribute number (the # of HA units this is)
                    }
                });
                if (numberAttended > 0)
                    mappedActivitiesFinal[date] = numberAttended;
            }
        }
        if (stringifiedDateArrayForFirstYear.length)
            recursiveCalculateFirstYear(
                stringifiedDateArrayForFirstYear,
                mappedActivitiesFinal
            );
        if (stringifiedDateArrayForSecondYear.length)
            recursiveCalculateSecondYear(
                stringifiedDateArrayForSecondYear,
                mappedActivitiesFinal
            );

        // look for the event with a date in the future, this event when the HA ends, if any
        let haActive = false;
        let haEndDate = "";
        events[0].forEach((event) => {
            const eventDate = new Date(event.date);
            if (isAfter(eventDate, new Date())) {
                // this event is the one where it says ended
                haActive = true;
            }
            if (event.type === "ended") {
                haEndDate = event.date;
            }
        });
        events[1].forEach((event) => {
            const eventDate = new Date(event.date);
            if (isAfter(eventDate, new Date())) {
                // this event is the one where it says ended
                haActive = true;
            }
            if (event.type === "ended") {
                haEndDate = event.date;
            }
        });

        resultMap[person.personnel_ID] = events;

        results.push({
            isSecondYear,
            haActive,
            haEndDate,
            events,
            details: {
                ...person,
            },
            activities: mappedActivitiesFinal,
        });

        await executeQuery({
            // query: `UPDATE personnel SET ha_active = ?, ha_end_date = ? WHERE personnel_ID = ?`,
            query: `UPDATE personnel SET ha_end_date = ? WHERE personnel_ID = ?`,
            values: [
                formatMySQLDateHelper(haEndDate || new Date().toDateString()),
                person.personnel_ID,
            ],
        });

        const flatEvents = events.flat();

        allEventValues.push(
            ...flatEvents.map((event) => [
                person.personnel_ID,
                event.type,
                formatMySQLDateHelper(event.date),
            ])
        );
        // await executeQuery({
        //     query: `INSERT INTO ha_events (personnel_ID, event_type, date) VALUES (?)`,
        //     values: [
        //         ...flatEvents.map((event) => [
        //             person.personnel_ID,
        //             event.type,
        //             formatMySQLDateHelper(event.date),
        //         ]),
        //     ],
        // });
    }

    await executeQuery({
        query: `INSERT INTO ha_events (personnel_ID, event_type, date) VALUES ?`,
        values: [allEventValues],
    });
    console.log("------------ FINISH UPDATING HA STATUS (ALL) ------------");
    return results;
};

export const refreshPersonnelID = async (
    personnel_ID: string,
    company: string,
    unit: string
) => {
    console.log(
        `------------ BEGIN UPDATING HA STATUS (${personnel_ID}) ------------`
    );
    await executeQuery({
        query: `DELETE FROM ha_events WHERE personnel_ID = ?`,
        values: [personnel_ID],
    });
    // grab a list of activities this person attended
    const attendeesObject: {
        activity_ID: number;
        personnel_ID: number;
    }[] = await executeQuery({
        query: `SELECT * FROM activity_attendees WHERE personnel_ID = ?`,
        values: [personnel_ID],
    });

    const activity_IDs = attendeesObject.map(
        (activity) => activity.activity_ID
    );

    // grab a list of all activities

    const activities: {
        activity_ID: number;
        date: Date;
        contributes: string;
    }[] = activity_IDs.length
        ? await executeQuery({
              // todo set limit of looking back to the earliest post in of the currently active personnel
              query: `SELECT activity_ID, date, contributes FROM activity_list WHERE activity_ID IN (?) AND contributes > 0 ORDER BY date ASC`,
              values: [activity_IDs],
          })
        : [];
    const personList: Personnel[] = await executeQuery({
        query: `SELECT *, CASE WHEN (personnel.ha_end_date) > (NOW()) THEN true ELSE false END AS ha_active  FROM personnel WHERE personnel_ID = ? AND company = ? AND unit = ?`,
        values: [personnel_ID, company, unit],
    });
    if (!personList) return { error: "No personnel found " };
    const person = personList[0];

    if (!activities.length) {
        console.log("NO ACTIVITIE");
        await noActivitiesAtAll(person);
        return;
    }

    // For each activity, if the activity 'contributes' value is > 1, duplicate the activity
    const stringifiedActivitiesArray = activities.map((activity) => ({
        ...activity,
        stringifiedDate: activity.date.toDateString(),
    }));

    // Map activities to date key
    const mappedActivities: {
        [key: string]: {
            activity_ID: number;
            date: Date;
            stringifiedDate: string;
            contributes: string;
        }[];
    } = stringifiedActivitiesArray.reduce(
        (
            r: {
                [key: string]: {
                    activity_ID: number;
                    date: Date;
                    stringifiedDate: string;
                    contributes: string;
                }[];
            },
            a
        ) => {
            r[a.stringifiedDate] = [...(r[a.stringifiedDate] || []), a];
            return r;
        },
        {}
    );

    // Group according to personnel ID
    const attendedActivitiesGroupedByPersonnelID = attendeesObject.reduce<{
        [key: string]: {
            activity_ID: number;
            personnel_ID: number;
        }[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    // Clean up the object
    let cleanedAttendees: { [key: string]: number[] } = {};
    for (let personnelID in attendedActivitiesGroupedByPersonnelID) {
        cleanedAttendees[personnelID] = attendedActivitiesGroupedByPersonnelID[
            personnelID
        ].map((a) => a.activity_ID);
    }

    // construct the date range
    // const now = new Date(); // TODO
    // const now = new Date("2022-07-01");
    // const end = addDays(new Date(), 15);

    // set to the last activityDate + 15
    const end = addDays(activities[activities.length - 1].date, 15);

    const results = [];

    const resultMap: {
        [key: string]: {
            date: string;
            type: string;
        }[][];
    } = {};

   

    const ord = person.ord; // end date
    const post_in = person.post_in; // start date
    const secondYearDate =
        person.svc_status === "REG" ? post_in : subMonths(ord, 10);

    let dateArrayHAForFirstYear: Date[] = [];
    let dateArrayHAForSecondYear: Date[] = [];
    // check if we've passed the second year mark
    let isSecondYear = false;
    if (isAfter(end, secondYearDate)) {
        // this dude is a second year soldier
        dateArrayHAForFirstYear = getDaysArray(post_in, secondYearDate);
        dateArrayHAForSecondYear = getDaysArray(
            subDays(secondYearDate, 12), // 12 days before the start of 2nd year to account for them doing the 10 consective PTs before the swap to 2nd year
            end
        );
        isSecondYear = true;
    } else {
        // solely first year soldier
        dateArrayHAForFirstYear = getDaysArray(post_in, end);
    }

    const stringifiedDateArrayForFirstYear = dateArrayHAForFirstYear.map(
        (date) => date.toDateString()
    );
    const stringifiedDateArrayForSecondYear = dateArrayHAForSecondYear.map(
        (date) => date.toDateString()
    );

    // Start of main work
    let events: {
        date: string;
        type: string;
    }[][] = [[], []];

    let currentlyOnHA = true;

    const recursiveCalculateFirstYear = (
        stringifiedDateArrayForFirstYear: string[],
        mappedActivities: { [key: string]: number }
    ) => {
        if (currentlyOnHA) {
            const endedInFirstYear = determineIfHAEnded(
                stringifiedDateArrayForFirstYear,
                mappedActivities
            );
            if (endedInFirstYear) {
                events[0].push({
                    date: endedInFirstYear,
                    type: "ended",
                });
                currentlyOnHA = false;
                // failed to maintain, execute first year protocol
                // From the first year date array, cut out the dates 9 days before the endedInFirstYear date,
                // get the index of the returned date in the array
                const indexEnded =
                    stringifiedDateArrayForFirstYear.indexOf(endedInFirstYear);
                if (indexEnded < 0)
                    return console.log(
                        "error, idk  index not found",
                        endedInFirstYear
                    );

                const indexEndedToRemoveUntil =
                    indexEnded - 9 < 0 ? 0 : indexEnded - 9;
                const trimmedDates = stringifiedDateArrayForFirstYear.slice(
                    indexEndedToRemoveUntil
                );
                recursiveCalculateFirstYear(trimmedDates, mappedActivities);
            }
        } else {
            const resumedDate = determineIfYearOneAchievedHA(
                stringifiedDateArrayForFirstYear,
                mappedActivities
            );
            console.log("-----------------------------------");

            if (resumedDate) {
                // personnel resumed HA after being on hiatus
                events[0].push({
                    date: resumedDate,
                    type: "resumed",
                });
                currentlyOnHA = true;

                // Enter maintenance phase
                // From the trimmed dates, cut out the dates 14 days before the resumed date,
                // get the index of the returned date in the array
                const index =
                    stringifiedDateArrayForFirstYear.indexOf(resumedDate);
                const indexToRemoveUntil = index - 14 < 0 ? 0 : index - 14;
                const trimmedDates =
                    stringifiedDateArrayForFirstYear.slice(indexToRemoveUntil);
                recursiveCalculateFirstYear(trimmedDates, mappedActivities);
            }
        }
    };
    const recursiveCalculateSecondYear = (
        stringifiedDateArrayForSecondYear: string[],
        mappedActivities: { [key: string]: number }
    ) => {
        if (currentlyOnHA) {
            const endedInSecondYear = determineIfHAEnded(
                stringifiedDateArrayForSecondYear,
                mappedActivities
            );
            if (endedInSecondYear) {
                events[1].push({
                    date: endedInSecondYear,
                    type: "ended",
                });
                currentlyOnHA = false;
                // failed to maintain, execute first year protocol
                // From the first year date array, cut out the dates 9 days before the endedInFirstYear date,
                // get the index of the returned date in the array
                const indexEnded =
                    stringifiedDateArrayForSecondYear.indexOf(
                        endedInSecondYear
                    );
                if (indexEnded < 0)
                    return console.log(
                        "error, idk  index not found",
                        endedInSecondYear
                    );

                const indexEndedToRemoveUntil =
                    indexEnded - 9 < 0 ? 0 : indexEnded - 9;
                const trimmedDates = stringifiedDateArrayForSecondYear.slice(
                    indexEndedToRemoveUntil
                );
                recursiveCalculateSecondYear(trimmedDates, mappedActivities);
            }
        } else {
            const resumedDate = determineIfYearTwoAchievedHA(
                stringifiedDateArrayForSecondYear,
                mappedActivities
            );

            if (resumedDate) {
                // personnel resumed HA after being on hiatus
                events[1].push({
                    date: resumedDate,
                    type: "resumed",
                });
                currentlyOnHA = true;

                // Enter maintenance phase
                // From the trimmed dates, cut out the dates 14 days before the resumed date,
                // get the index of the returned date in the array
                const index =
                    stringifiedDateArrayForSecondYear.indexOf(resumedDate);
                const indexToRemoveUntil = index - 14 < 0 ? 0 : index - 14;
                const trimmedDates =
                    stringifiedDateArrayForSecondYear.slice(indexToRemoveUntil);
                recursiveCalculateSecondYear(trimmedDates, mappedActivities);
            }
        }
    };

    // Filter the activities to only include the ones that are attended by this person
    let mappedActivitiesFinal: { [key: string]: number } = {};
    const attendedActivityIDsArray = cleanedAttendees[person.personnel_ID];
    
    if (attendedActivityIDsArray) {
        // skip if no activities attended at all, which means mappedActivitiesFinal is empty
        for (let date in mappedActivities) {
            const activitiesOnThisDate = mappedActivities[date];

            let haUnitsOnThisDay = 0;          
            activitiesOnThisDate.forEach((activity) => {
                if (attendedActivityIDsArray.includes(activity.activity_ID)) {
                    haUnitsOnThisDay =
                        Number(activity.contributes) + haUnitsOnThisDay;
                    // add the number attended to the contribute number (the # of HA units this is)
                    
                    // Don't clamp to 2 here, clamp in the function which decides when HA has resumed (determineIfYearTwoAchievedHA())
                }
                
            });
            if (haUnitsOnThisDay > 0)
                mappedActivitiesFinal[date] = haUnitsOnThisDay;
        }
    }
    if (stringifiedDateArrayForFirstYear.length)
        recursiveCalculateFirstYear(
            stringifiedDateArrayForFirstYear,
            mappedActivitiesFinal
        );
    if (stringifiedDateArrayForSecondYear.length)
        recursiveCalculateSecondYear(
            stringifiedDateArrayForSecondYear,
            mappedActivitiesFinal
        );

    // look for the event with a date in the future, this event when the HA ends, if any
    let haActive = false;
    let haEndDate = "";
    events[0].forEach((event) => {
        const eventDate = new Date(event.date);
        if (isAfter(eventDate, new Date())) {
            // this event is the one where it says ended
            haActive = true;
        }
        if (event.type === "ended") {
            haEndDate = event.date;
        }
    });
    events[1].forEach((event) => {
        const eventDate = new Date(event.date);
        if (isAfter(eventDate, new Date())) {
            // this event is the one where it says ended
            haActive = true;
        }
        if (event.type === "ended") {
            haEndDate = event.date;
        }
    });
    resultMap[person.personnel_ID] = events;
    results.push({
        isSecondYear,
        haActive,
        haEndDate,
        events,
        details: {
            ...person,
        },
        activities: mappedActivitiesFinal,
    });

    // delete everything from ha_status and ha_events where personnel_ID in selected
    // await executeQuery({
    //     query: `DELETE FROM ha_status WHERE personnel_ID IN (?)`,
    //     values: [activePersonnelIDs],
    // })
    const flatEvents = events.flat();
    const allEventValues: any[][] = [];
    allEventValues.push(
        ...flatEvents.map((event) => [
            person.personnel_ID,
            event.type,
            formatMySQLDateHelper(event.date),
        ])
    );

    await executeQuery({
        query: `INSERT INTO ha_events (personnel_ID, event_type, date) VALUES ?`,
        values: [allEventValues],
    });
    await executeQuery({
        query: `UPDATE personnel SET ha_end_date = ? WHERE personnel_ID = ?`,
        // query: `UPDATE personnel SET ha_active = ?, ha_end_date = ? WHERE personnel_ID = ?`,
        values: [
            formatMySQLDateHelper(haEndDate || new Date().toDateString()),
            person.personnel_ID,
        ],
    });

    console.log(
        `------------ FINISH UPDATING HA STATUS (${personnel_ID}) ------------`
    );

    return results;
};

const noActivitiesAtAll = async (person: Personnel) => {
    try {
        console.log("no activities at all for person ", person.name);
        // HA ends 14 days after post in and lasts until ORD
        
        const haEndDate = addDays(person.post_in, 15);
        const res = await executeQuery({
            query: `INSERT INTO ha_events SET personnel_ID = ?, event_type = 'ended', date = ?`,
            values: [
                person.personnel_ID,
                formatMySQLDateHelper(haEndDate.toString()),
            ],
        });
     

        await executeQuery({
            query: `UPDATE personnel SET ha_end_date = ? WHERE personnel_ID = ?`,
            // query: `UPDATE personnel SET ha_active = ?, ha_end_date = ? WHERE personnel_ID = ?`,
            values: [
                formatMySQLDateHelper(haEndDate.toString()),
                person.personnel_ID,
            ],
        });
    } catch (e) {
        console.log(e);
    }
};
