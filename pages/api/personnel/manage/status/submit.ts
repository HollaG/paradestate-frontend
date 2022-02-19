import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery, { db } from "../../../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../../../types/database";
import {
    ExtendedStatus,
    PersonnelMap,
    Status,
    StatusState,
} from "../../../../../types/types";
import Assignments from "../../../../../config/assignments.json";
import { format } from "date-fns";
import { StatusOption } from "../../../../personnel/manage/status";
export interface StatusData {
    sortedByPlatoon: {
        [key: string]: ExtendedPersonnel[];
    };
    selectedDate: string;
    formattedStatusList: {
        label: string;
        value: string;
    }[];
    statusesById: {
        [key: string]: ExtendedStatus[];
    };
}

export interface StatusAddedData {
    success: boolean;
    data: {
        sortedByPlatoon: any;
        personnelMap: any;
    };
}

// Expects selectedDate as a string in the format "YYYY-MM-DD"
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<StatusData | StatusAddedData | { error: any }>
) {
    const session = await getSession({ req });
    // console.log({ session });
    if (!session) return res.status(401);

    if (req.method === "GET") {
    } else if (req.method === "POST") {
        try {
            const data = req.body;
            // const statusDate = data.statusDate;
            // const isPerm = data.isPerm;
            // const statuses = data.statuses as StatusOption[];
            // const oldSortedByPlatoon = data.sortedByPlatoon;
            // const personnel_IDs: number[] = [];
            // Object.keys(oldSortedByPlatoon).forEach((platoon) =>
            //     personnel_IDs.push(
            //         ...oldSortedByPlatoon[platoon].map(
            //             (person) => person.personnel_ID
            //         )
            //     )
            // );

            // // Todo - serverside validation of personnel_ID

            // const personnel: Personnel[] = await executeQuery({
            //     query: `SELECT * FROM personnel WHERE personnel_ID IN (?) AND unit = ? AND company = ?`,
            //     values: [
            //         personnel_IDs,
            //         session.user.unit,
            //         session.user.company,
            //     ],
            // });
            // if (personnel.length !== personnel_IDs.length)
            //     res.status(400).json({
            //         error: "Illegal operation - user has no perms to edit this personnel",
            //     });
            const personnelMap: any = {};
            Object.keys(data).forEach((key) => {
                const personnel_ID = key.split("-")[0];
                const num = key.split("-")[1];
                const type = key.split("-")[3] as "perm" | "selected" | "date";

                if (!personnelMap[personnel_ID]) {
                    // personnel never beeen added

                    personnelMap[personnel_ID] = {
                        // use an object bc if we iterate and start from [1], then we have a gap in the array
                        [num]: {
                            [type]: data[key],
                        },
                    };
                } else {
                    if (!personnelMap[personnel_ID][num]) {
                        // this num never been added
                        personnelMap[personnel_ID][num] = {
                            [type]: data[key],
                        };
                    } else {
                        personnelMap[personnel_ID][num] = {
                            ...personnelMap[personnel_ID][num],
                            [type]: data[key],
                        };
                    }
                }
            });

            const personnel_IDs = Object.keys(personnelMap);
            if (!personnel_IDs.length) {
                return res.status(400).json({ error: "No personnel selected" });
            }

            const personnel: Personnel[] = await executeQuery({
                query: `SELECT * FROM personnel WHERE personnel_ID IN (?) AND unit = ? AND company = ?`,
                values: [
                    personnel_IDs,
                    session.user.unit,
                    session.user.company,
                ],
            });
            if (personnel.length !== personnel_IDs.length)
                res.status(400).json({
                    error: "Illegal operation - user has no perms to edit this personnel",
                });

            const sortedByPlatoon = personnel.reduce<{
                [key: string]: Personnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

            const oldGroupID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM audit_log`,
                values: [],
            });
            const groupID = oldGroupID[0].max + 1;
            const txn = db.transaction();

            const pMap: PersonnelMap = personnelMap;
            Object.keys(pMap).forEach((personnel_ID) => {
                const personnel = pMap[personnel_ID];

                Object.keys(personnel).forEach((num) => {
                    const { perm, selected, date } = personnel[num];
                    const start = format(
                        new Date(date[0]),
                        Assignments.mysqldateformat
                    );
                    const end = format(
                        new Date(date[1]),
                        Assignments.mysqldateformat
                    );

                    selected.forEach((status) => {
                        let sql = ``;
                        let values = [];
                        if (perm) {
                            sql = `INSERT INTO status_tracker SET personnel_ID = ?, status_ID = ?, editor_ID = ?, type = "perm"`;
                            values = [
                                personnel_ID,
                                status.value,
                                session.user.row_ID,
                            ];
                        } else {
                            sql = `INSERT INTO status_tracker SET personnel_ID = ?, start = ?, end = ?, status_ID = ?, editor_ID = ?, type = ""`;
                            values = [
                                personnel_ID,
                                start,
                                end,
                                status.value,
                                session.user.row_ID,
                            ];
                        }
                        txn.query(sql, values).query((r: any) => {
                            const auditSql = `INSERT INTO audit_log SET group_ID = ?, user_ID = ?, operation = "CREATE", type = "status", row_ID = ?, personnel_ID = ?, date = NOW()`;
                            const auditArr = [
                                groupID,
                                session.user.row_ID,
                                r.insertId,
                                personnel_ID,
                            ];
                            return [auditSql, auditArr];
                        });
                    });
                });
            });
            txn.rollback(console.log);
            txn.commit();
            const response = {
                success: true,
                data: {
                    sortedByPlatoon,
                    personnelMap,
                },
            };
            res.status(200).json(response);
            return;
            // personnel_IDs.forEach((personnel_ID) => {
            //     statuses.forEach((status) => {
            //         let sql = ``;
            //         let values = [];
            //         if (isPerm) {
            //             sql = `INSERT INTO status_tracker SET personnel_ID = ?, status_ID = ?, editor_ID = ?, type = "perm"`;
            //             values = [
            //                 personnel_ID,
            //                 status.value,
            //                 session.user.row_ID,
            //             ];
            //         } else {
            //             sql = `INSERT INTO status_tracker SET personnel_ID = ?, start = ?, end = ?, status_ID = ?, editor_ID = ?, type = ""`;
            //             values = [
            //                 personnel_ID,
            //                 statusDate[0],
            //                 statusDate[1],
            //                 status.value,
            //                 session.user.row_ID,
            //             ];
            //         }
            //         txn.query(sql, values).query((r: any) => {
            //             const auditSql = `INSERT INTO audit_log SET group_ID = ?, user_ID = ?, operation = "CREATE", type = "status", row_ID = ?, personnel_ID = ?, date = NOW()`;
            //             const auditArr = [
            //                 groupID,
            //                 session.user.row_ID,
            //                 r.insertId,
            //                 personnel_ID,
            //             ];
            //             return [auditSql, auditArr];
            //         });
            //     });
            // });

            // txn.rollback(console.log);
            // txn.commit();

            // const sortedByPlatoon = personnel.reduce((r: any, a: any) => {
            //     r[a.platoon as any] = [...(r[a.platoon as any] || []), a];
            //     return r;
            // }, {});
            // const response = {
            //     success: true,
            //     data: {
            //         sortedByPlatoon,
            //         statusDate,
            //         statuses,
            //         isPerm,
            //     },
            // };
            res.status(200).json(response);
        } catch (e) {
            console.log(e);
            res.status(401).json({ error: e });
        }
    }
}
