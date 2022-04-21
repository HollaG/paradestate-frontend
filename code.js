const determineIfHAEnded = (dateArray, activitiesMap) => {
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

const determineIfYearOneAchievedHA = (dateArray, activitiesMap) => {
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

const determineIfYearTwoAchievedHA = (dateArray, activityMap) => {
    // HA is achieved when:
    // within 9 days,
    // - 13 conducts
    // - max 2 per day

    const ptDates = Object.keys(activityMap);

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
            score = score + activityMap[date];
        }
        // look back 9 days
        // is there a PT 9 days ago? if so, subtract the score by the number of PTs on that day,

        const index = dateArray.indexOf(date);
        const lookBack = index - 9;
        if (lookBack < 0) {
        } else {
            const date9DaysBack = dateArray[lookBack];
            if (ptDates.includes(date9DaysBack)) {
                score -= activityMap[date9DaysBack]; // TODO
            }
        }
    }

    return dateAchieved;
};
var getDaysArray = function (s, e) {
    for (
        var a = [], d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
    ) {
        a.push(new Date(d));
    }
    return a;
};

const dateArrayHAForFirstYear = getDaysArray(
    new Date("2021-12-13"),
    // new Date("2021-12-20")
    new Date("2022-04-30")
);
const dateArrayHAForSecondYear = getDaysArray(
    new Date("2022-04-17"), // 12 days before the start of 2nd year to account for them doing the 10 consective PTs before the swap to 2nd year
    // new Date("2021-12-20")
    new Date("2022-06-30")
);

const stringifiedDateArrayForFirstYear = dateArrayHAForFirstYear.map((date) =>
    date.toDateString()
);
const stringifiedDateArrayForSecondYear = dateArrayHAForSecondYear.map((date) =>
    date.toDateString()
);

const activities = [
    {
        date: new Date("2021-12-14"),
    },
    {
        date: new Date("2021-12-14"),
    },
    {
        date: new Date("2021-12-15"),
    },
    {
        date: new Date("2021-12-15"),
    },
    {
        date: new Date("2021-12-16"),
    },
    {
        date: new Date("2021-12-16"),
    },
    {
        date: new Date("2021-12-17"),
    },
    {
        date: new Date("2021-12-17"),
    },
    {
        date: new Date("2021-12-20"),
    },
    {
        date: new Date("2021-12-20"),
    },
    {
        date: new Date("2021-12-21"),
    },
    {
        date: new Date("2021-12-21"),
    },
    {
        date: new Date("2021-12-22"),
    },
    {
        date: new Date("2021-12-22"),
    },
    {
        date: new Date("2021-12-23"),
    },
    {
        date: new Date("2021-12-23"),
    },
    {
        date: new Date("2021-12-24"),
    },
    {
        date: new Date("2021-12-24"),
    },
    {
        date: new Date("2022-01-13"),
    },
    {
        date: new Date("2022-01-14"),
    },
    {
        date: new Date("2022-01-17"),
    },
    {
        date: new Date("2022-01-18"),
    },
    {
        date: new Date("2022-01-19"),
    },
    {
        date: new Date("2022-01-20"),
    },
    {
        date: new Date("2022-01-21"),
    },
    {
        date: new Date("2022-01-24"),
    },
    {
        date: new Date("2022-01-25"),
    },
    {
        date: new Date("2022-01-26"),
    },
    {
        date: new Date("2022-01-27"),
    },
    {
        date: new Date("2022-01-28"),
    },
    {
        date: new Date("2022-01-31"),
    },
    {
        date: new Date("2022-02-01"),
    },
    {
        date: new Date("2022-02-02"),
    },
    {
        date: new Date("2022-02-03"),
    },
    {
        date: new Date("2022-02-04"),
    },
    {
        date: new Date("2022-02-07"),
    },
    {
        date: new Date("2022-02-08"),
    },
    {
        date: new Date("2022-02-09"),
    },
    {
        date: new Date("2022-02-10"),
    },
    {
        date: new Date("2022-02-11"),
    },
    {
        date: new Date("2022-02-14"),
    },
    {
        date: new Date("2022-02-15"),
    },
    {
        date: new Date("2022-02-16"),
    },
    {
        date: new Date("2022-02-17"),
    },
    {
        date: new Date("2022-02-18"),
    },
    {
        date: new Date("2022-02-21"),
    },
    {
        date: new Date("2022-02-22"),
    },
    {
        date: new Date("2022-02-23"),
    },
    {
        date: new Date("2022-02-24"),
    },
    {
        date: new Date("2022-02-25"),
    },
    {
        date: new Date("2022-05-02"),
    },
    {
        date: new Date("2022-05-03"),
    },
    {
        date: new Date("2022-05-04"),
    },
    {
        date: new Date("2022-05-05"),
    },
    {
        date: new Date("2022-05-06"),
    },
    {
        date: new Date("2022-05-09"),
    },
    {
        date: new Date("2022-05-10"),
    },
    {
        date: new Date("2022-05-11"),
    },
    {
        date: new Date("2022-05-12"),
    },
    {
        date: new Date("2022-05-13"),
    },
    {
        date: new Date("2022-05-16"),
    },
    {
        date: new Date("2022-05-17"),
    },
    {
        date: new Date("2022-05-18"),
    },
    {
        date: new Date("2022-05-19"),
    },
    {
        date: new Date("2022-05-20"),
    },
    {
        date: new Date("2022-05-23"),
    },
    {
        date: new Date("2022-05-24"),
    },
    {
        date: new Date("2022-05-25"),
    },
    {
        date: new Date("2022-05-26"),
    },
    {
        date: new Date("2022-05-27"),
    },
    {
        date: new Date("2022-05-30"),
    },
    {
        date: new Date("2022-05-31"),
    },
    {
        date: new Date("2022-06-01"),
    },
    {
        date: new Date("2022-06-02"),
    },
    {
        date: new Date("2022-06-03"),
    },
    {
        date: new Date("2022-06-06"),
    },
    {
        date: new Date("2022-06-07"),
    },
    {
        date: new Date("2022-06-08"),
    },
    {
        date: new Date("2022-06-09"),
    },
    {
        date: new Date("2022-06-10"),
    },
    {
        date: new Date("2022-06-13"),
    },
    {
        date: new Date("2022-05-02"),
    },
    {
        date: new Date("2022-05-03"),
    },
    {
        date: new Date("2022-05-04"),
    },
    {
        date: new Date("2022-05-05"),
    },
    {
        date: new Date("2022-05-06"),
    },
    {
        date: new Date("2022-05-09"),
    },
    {
        date: new Date("2022-05-10"),
    },
    {
        date: new Date("2022-05-11"),
    },
    {
        date: new Date("2022-05-12"),
    },
    {
        date: new Date("2022-05-13"),
    },
    {
        date: new Date("2022-05-16"),
    },
    {
        date: new Date("2022-05-17"),
    },
    {
        date: new Date("2022-05-18"),
    },
    {
        date: new Date("2022-05-19"),
    },
    {
        date: new Date("2022-05-20"),
    },
    {
        date: new Date("2022-05-23"),
    },
    {
        date: new Date("2022-05-24"),
    },
    {
        date: new Date("2022-05-25"),
    },
    {
        date: new Date("2022-05-26"),
    },
    {
        date: new Date("2022-05-27"),
    },
    {
        date: new Date("2022-05-30"),
    },
    {
        date: new Date("2022-05-31"),
    },
    {
        date: new Date("2022-06-01"),
    },
    {
        date: new Date("2022-06-02"),
    },
    {
        date: new Date("2022-06-03"),
    },
    {
        date: new Date("2022-06-06"),
    },
    {
        date: new Date("2022-06-07"),
    },
    {
        date: new Date("2022-06-08"),
    },
    {
        date: new Date("2022-06-09"),
    },
    {
        date: new Date("2022-06-10"),
    },
    {
        date: new Date("2022-06-13"),
    },
];

// type = {}[]
// note that this step is not actually required
const stringifiedActivitiesArray = activities.map((activity) => ({
    ...activity,
    stringifiedDate: activity.date.toDateString(),
}));

// Map activities to date key
const mappedActivities = stringifiedActivitiesArray.reduce((r, a) => {
    r[a.stringifiedDate] = [...(r[a.stringifiedDate] || []), a];
    return r;
}, {});

for (let date in mappedActivities) {
    mappedActivities[date] = mappedActivities[date].length;
}

// console.log({mappedActivitiesArray})
/*
    mappedActivitiesArray: {
        'Tue Dec 14 2021': 1,
        'Wed Dec 15 2021': 2,
        'Thu Dec 16 2021': 2,
        'Fri Dec 17 2021': 2,
        'Mon Dec 20 2021': 2,
        'Tue Dec 21 2021': 2,
        'Wed Dec 22 2021': 2,
        'Thu Dec 23 2021': 2,
        'Fri Dec 24 2021': 2
    }
*/

// Assume person has HA from the start date.
// Start the loop on the start date by checking if he maintains HA

// IIFE

let events = [[], []];

let currentlyOnHA = true;
// const recursiveCalculateFirstYear = (
//     stringifiedDateArrayForFirstYear,
//     mappedActivities
// ) => {
//     const endedInFirstYear = determineIfHAEnded(
//         stringifiedDateArrayForFirstYear,
//         mappedActivities
//     );
//     if (endedInFirstYear) {
//         events.push({
//             date: endedInFirstYear,
//             type: "ended",
//         });
//         currentlyOnHA = false;
//         // failed to maintain, execute first year protocol
//         // From the first year date array, cut out the dates 9 days before the endedInFirstYear date,
//         // get the index of the returned date in the array
//         const indexEnded =
//             stringifiedDateArrayForFirstYear.indexOf(endedInFirstYear);
//         if (indexEnded < 0)
//             return console.log(
//                 "error, idk  index not found",
//                 endedInFirstYear
//             );

//         const indexEndedToRemoveUntil =
//             indexEnded - 9 < 0 ? 0 : indexEnded - 9;
//         const trimmedDates = stringifiedDateArrayForFirstYear.slice(
//             indexEndedToRemoveUntil
//         );

//         // console.log(trimmedDates)

//         // with the trimmed dates, calculate if personnel managed to resume his HA
//         const resumedDate = determineIfYearOneAchievedHA(
//             trimmedDates,
//             mappedActivities
//         );
//         if (resumedDate) {
//             // personnel resumed HA after being on hiatus
//             events.push({
//                 date: resumedDate,
//                 type: "resumed",
//             });
//             currentlyOnHA = true;

//             // Enter maintenance phase
//             // From the trimmed dates, cut out the dates 14 days before the resumed date,
//             // get the index of the returned date in the array
//             const indexStarted = trimmedDates.indexOf(resumedDate);
//             const indexStartedToRemoveUntil =
//                 indexStarted - 14 < 0 ? 0 : indexStarted - 14;
//             const trimmedDatesForMaintenance = trimmedDates.slice(
//                 indexStartedToRemoveUntil
//             );
//             recursiveCalculateFirstYear(
//                 trimmedDatesForMaintenance,
//                 mappedActivities
//             );
//         } else {
//             // HA never resumed after stopping in the first year
//         }
//         return;
//     }
// };

let a = 1;
const recursiveCalculateFirstYear = (
    stringifiedDateArrayForFirstYear,
    mappedActivities
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
            const index = stringifiedDateArrayForFirstYear.indexOf(resumedDate);
            const indexToRemoveUntil = index - 14 < 0 ? 0 : index - 14;
            const trimmedDates =
                stringifiedDateArrayForFirstYear.slice(indexToRemoveUntil);
            recursiveCalculateFirstYear(trimmedDates, mappedActivities);
        }
    }
};
recursiveCalculateFirstYear(stringifiedDateArrayForFirstYear, mappedActivities);

const recursiveCalculateSecondYear = (
    stringifiedDateArrayForSecondYear,
    mappedActivities
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
                stringifiedDateArrayForSecondYear.indexOf(endedInSecondYear);
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
recursiveCalculateSecondYear(
    stringifiedDateArrayForSecondYear,
    mappedActivities
);
console.log(events);
