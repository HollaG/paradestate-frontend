import { format, parse } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../../config/assignments.json";
import {
    changeTo2Digit,
    replaceSlash,
    sortActiveInactiveStatus,
} from "../../../../lib/custom";
import executeQuery from "../../../../lib/db";
import { ExtendedPersonnel } from "../../../../types/database";
import { ExtendedStatus } from "../../../../types/types";
export interface StatusListFormatInterface {
    "COMPANY-NAME": string;
    "SELECTED-DATE": string;
    "GENERATE-TIMING": string;
    "GENERATE-OWNER": string;

    "INCLUDE-PLATOON-STATUS": {
        INDEX: number;
        PLATOON: string;
        "STATUS-PAX": string;
        "INCLUDE-PERSONNEL": {
            INDEX: number;
            NAME: string;
            RANK: string;
            "INCLUDE-STATUSES": {
                INDEX: number;
                NAME: string;
                STRING: string;
                TYPE: string;
                START: string;
                END: string;
            }[];
        }[];
    }[];
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{} | { error: any }>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        if (req.method === "GET") {
            let { date, platoon } = req.query as {
                date: string;
                platoon: string;
            }; // date format is yyyy-MM-dd
            if (!platoon) platoon = session.user.platoon || "Company";
            const { unit, company } = session.user;

            const parsedDate = parse(
                date,
                Assignments.mysqldateformat,
                new Date()
            );

            const selectedDate = format(parsedDate, Assignments.dateformat);
            const mysqlFormatted = date;

            var dict: StatusListFormatInterface = {
                "COMPANY-NAME": company.toUpperCase(),
                "SELECTED-DATE": replaceSlash(selectedDate),
                "GENERATE-TIMING": format(
                    new Date(),
                    Assignments.datetimeformat
                ),
                "GENERATE-OWNER": session.user.email,
                "INCLUDE-PLATOON-STATUS": [],
            };

            // Sorted by platoons, get all the status data

            // 1) Get all the personnel IDs in the company
            let personnel: { personnel_ID: string; [key: string]: any }[] =
                await executeQuery({
                    query: `SELECT *, CASE WHEN (personnel.ha_end_date) > (DATE(?)) THEN true ELSE false END AS ha_active FROM personnel WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) AND DATE(post_in) <= DATE(?) ORDER BY platoon ASC`,
                    values: [mysqlFormatted, unit, company, mysqlFormatted, mysqlFormatted],
                });
            let personnel_IDs = personnel.map((x) => x.personnel_ID);
            if (personnel_IDs.length == 0) return 0;
            // 2) Get all the personnel that have statuses
            // Checking STATUS table
            let status_personnel = await executeQuery({
                query: `SELECT * FROM status_tracker LEFT JOIN personnel ON status_tracker.personnel_ID = personnel.personnel_ID LEFT JOIN status_list ON status_tracker.status_ID = status_list.status_ID WHERE (personnel.unit = ? AND personnel.company = ?  AND DATE(ord) >= DATE(?) OR type = 'perm') AND personnel.personnel_ID IN (?)  ORDER BY platoon ASC`,
                values: [unit, company, mysqlFormatted, personnel_IDs],
            });

            // 3) Do filtering to remove duplicate statues
            let funcResultArr = (await sortActiveInactiveStatus(
                status_personnel,

                parsedDate
            )) as ExtendedStatus[][];
            let activeStatuses = funcResultArr[0];

            // Order by platoon
            let groupedByPlatoon = activeStatuses.reduce((r: any, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

            // Group the status list together in each platoon
            for (platoon of Object.keys(groupedByPlatoon)) {
                groupedByPlatoon[platoon] = groupedByPlatoon[platoon].reduce(
                    (r: any, a: any) => {
                        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
                        return r;
                    },
                    {}
                );

                let personnel = groupedByPlatoon[platoon];
                var o: {
                    INDEX: number;
                    PLATOON: string;
                    "INCLUDE-PERSONNEL": any[];
                    "STATUS-PAX": string;
                } = {
                    INDEX: dict["INCLUDE-PLATOON-STATUS"].length + 1,
                    PLATOON: platoon,
                    "INCLUDE-PERSONNEL": [],
                    "STATUS-PAX": "",
                };

                for (let personnel_ID of Object.keys(personnel)) {
                    let person: ExtendedPersonnel[] = personnel[personnel_ID];

                    var p: {
                        NAME: string;
                        RANK: string;
                        INDEX: number;
                        "INCLUDE-STATUSES": any[];
                    } = {
                        NAME: person[0].name, // [0] cos the info is stored in the array of statuses, so just take the first one
                        RANK: person[0].rank,
                        INDEX: o["INCLUDE-PERSONNEL"].length + 1,
                        "INCLUDE-STATUSES": [],
                    };
                    person.forEach((status) => {
                        let custStart = replaceSlash(
                            format(
                                new Date(status.start),
                                Assignments.dateformat
                            )
                        );
                        let custEnd = replaceSlash(
                            format(new Date(status.end), Assignments.dateformat)
                        );

                        p["INCLUDE-STATUSES"].push({
                            INDEX: p["INCLUDE-STATUSES"].length + 1,
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
                    o["INCLUDE-PERSONNEL"].push(p);
                }

                o["STATUS-PAX"] = changeTo2Digit(
                    o["INCLUDE-PERSONNEL"].length
                ).toString();

                dict["INCLUDE-PLATOON-STATUS"].push(o);
            }

            res.status(200).json({ success: true, data: dict });
        } else {
            res.json({ error: "POST not supported" });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
