import parse from "date-fns/parse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import getDate from "date-fns/getDate";
import { format, addDays, isSameDay } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import Assignments from "../../../../config/assignments.json";
import executeQuery from "../../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../../types/database";
import {
    attcFilterer,
    changeTo2Digit,
    filterer,
    replaceSlash,
    sortActiveInactiveStatus,
} from "../../../../lib/custom";
import { ExtendedStatus, GenericEvent } from "../../../../types/types";

export interface DictFormat {
    "PLATOON-NAME": string;
    "SELECTED-DATE": string;
    "INCLUDE-PLATOONS": any[];
    "INCLUDE-ATTC": any[];
    "INCLUDE-OFF": any[];
    "INCLUDE-LEAVE": any[];
    "INCLUDE-MA": any[];
    "INCLUDE-STATUS": any[];
    "INCLUDE-COURSE": any[];
    "INCLUDE-OTHERS": any[];
    "GENERATE-TIMING": string;
    "GENERATE-OWNER": string;
    [key: string]: any;
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        // let selectedDate = new Date();
        if (req.method === "GET") {
            let { date, platoon } = req.query as {
                date: string;
                platoon: string;
            }; // date format is yyyy-MM-dd
            if (!platoon) platoon = session.user.platoon || "Company"
            const { unit, company } = session.user;

            const parsedDate = parse(
                date,
                Assignments.mysqldateformat,
                new Date()
            );

            const selectedDate = format(parsedDate, Assignments.dateformat);
            const mysqlFormatted = date;

            let personnel = null;
            if (platoon == "Company") {
                // if is to generate for the whole company
                personnel = await executeQuery({
                    query: `SELECT * FROM personnel WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) AND DATE(post_in) <= DATE(?) ORDER BY platoon ASC`,
                    values: [unit, company, mysqlFormatted, mysqlFormatted],
                });
            } else {
                personnel = await executeQuery({
                    query: `SELECT * FROM personnel WHERE unit = ? AND company = ? AND platoon = ? AND DATE(ord) >= DATE(?) AND DATE(post_in) <= DATE(?)`,
                    values: [
                        unit,
                        company,
                        platoon,
                        mysqlFormatted,
                        mysqlFormatted,
                    ],
                });
            }

            // Sort personnel by platoon
            // get personnel_IDs to query later
            const personnel_IDs: string[] = [];
            const sortedByPlatoon: { [key: string]: Personnel[] } =
                personnel.reduce((r: any, a: any) => {
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
                    if (
                        Assignments.commander.officer_wospec.includes(
                            person.rank
                        )
                    ) {
                        // person is an officer
                        accounter[platoon].OFFICER_WOSPEC_PRESENT =
                            accounter[platoon].OFFICER_WOSPEC_PRESENT + 1;
                        accounter[platoon].OFFICER_WOSPEC_TOTAL =
                            accounter[platoon].OFFICER_WOSPEC_TOTAL + 1;
                    } else if (
                        Assignments.commander.spec.includes(person.rank)
                    ) {
                        // person is a spec
                        accounter[platoon].SPEC_PRESENT =
                            accounter[platoon].SPEC_PRESENT + 1;
                        accounter[platoon].SPEC_TOTAL =
                            accounter[platoon].SPEC_TOTAL + 1;
                    } else {
                        // person is a men
                        accounter[platoon].MEN_PRESENT =
                            accounter[platoon].MEN_PRESENT + 1;
                        accounter[platoon].MEN_TOTAL =
                            accounter[platoon].MEN_TOTAL + 1;
                    }

                    personnel_IDs.push(person.personnel_ID.toString());
                });
            }

            if (!personnel_IDs.length) return 0;

            let dict:DictFormat = {
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
                "GENERATE-TIMING": format(
                    new Date(),
                    Assignments.datetimeformat
                ),
                "GENERATE-OWNER": session.user.email,
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

            const [filteredAttcs, duplicateAttcs] =
                attcFilterer(attc_personnel);

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
            console.log({ offs: off_personnel });
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
                            Assignments.commander.officer_wospec.includes(
                                person.rank
                            )
                        ) {
                            // person is an officer
                            accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                                accounter[person.platoon]
                                    .OFFICER_WOSPEC_PRESENT - 1;
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
                            Assignments.commander.officer_wospec.includes(
                                person.rank
                            )
                        ) {
                            // person is an officer
                            accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                                accounter[person.platoon]
                                    .OFFICER_WOSPEC_PRESENT - 1;
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
            });

            // Checking MA table
            // Specify the MA table column name as ma_name to avoid confusion with personnel table
            var ma_personnel: ExtendedPersonnel[] = await executeQuery({
                query: `SELECT * FROM ma_tracker LEFT JOIN personnel ON ma_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(ma_tracker.date) = DATE(?) AND personnel.personnel_ID IN (?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC`,
                values: [
                    unit,
                    company,
                    mysqlFormatted,
                    personnel_IDs,
                    mysqlFormatted,
                ],
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
                            subtractedPersonnel.push(
                                person.personnel_ID.toString()
                            );

                            // Update the numbers in the total strength
                            if (
                                Assignments.commander.officer_wospec.includes(
                                    person.rank
                                )
                            ) {
                                // person is an officer
                                accounter[
                                    person.platoon
                                ].OFFICER_WOSPEC_PRESENT =
                                    accounter[person.platoon]
                                        .OFFICER_WOSPEC_PRESENT - 1;
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
            const groupedByPersonnel_ID: { [key: string]: ExtendedStatus[] } =
                activeStatuses.reduce((r: any, a) => {
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
                    PID: statuses[0].personnel_ID,
                    RANK: statuses[0].rank,
                    NAME: statuses[0].name,
                    "INCLUDE-STATUSES": [],
                };

                statuses.forEach((status) => {
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
                        STRING:
                            status.type == "perm"
                                ? "Perm"
                                : `${custStart} - ${custEnd}`,
                    });
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
                    START: replaceSlash(
                        format(person.start, Assignments.dateformat)
                    ),
                    END: replaceSlash(format(person.end, Assignments.dateformat)),
                    COURSE_NAME: person.course_name,
                });
                // if person is already subtracted, we don't do anything:
                if (!subtractedPersonnel.includes(person.personnel_ID)) {
                    // Add to subtracted count
                    subtractedPersonnel.push(person.personnel_ID);

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
                    START: replaceSlash(
                        format(person.start, Assignments.dateformat)
                    ),
                    END: replaceSlash(
                        format(person.start, Assignments.dateformat)
                    ),
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
                            Assignments.commander.officer_wospec.includes(
                                person.rank
                            )
                        ) {
                            // person is an officer
                            accounter[person.platoon].OFFICER_WOSPEC_PRESENT =
                                accounter[person.platoon]
                                    .OFFICER_WOSPEC_PRESENT - 1;
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
            dict["LEAVE-PAX"] = changeTo2Digit(
                dict["INCLUDE-LEAVE"].length
            );
            dict["MA-PAX"] = changeTo2Digit(dict["INCLUDE-MA"].length);
            dict["STATUS-PAX"] = changeTo2Digit(
                dict["INCLUDE-STATUS"].length
            );
            dict["COURSE-PAX"] = changeTo2Digit(
                dict["INCLUDE-COURSE"].length
            );
            dict["OTHERS-PAX"] = changeTo2Digit(
                dict["INCLUDE-OTHERS"].length
            );
            dict["TOTAL-PRESENT"] = totalPresent;
            dict["TOTAL-PAX"] = totalPax;
            res.status(200).json({
                success: true,
                data: dict,
            })
        } else {
            res.json({});
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
