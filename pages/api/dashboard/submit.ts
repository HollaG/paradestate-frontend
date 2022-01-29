import { format } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery, { db } from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { EventData } from "../../../types/types";
import Assignments from "../../../config/assignments.json";
import {
    calculateOutOfOfficeDuration,
    formatMySQLDateHelper,
    formatMySQLDateTimeHelper,
    formatMySQLTimeHelper,
} from "../../../lib/custom";
// Expects an array (always!!) of personnel IDs to retrieve information for.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{} | {}>
) {
    const session = await getSession({ req });
    // console.log({ session });
    if (!session) return res.status(401);

    if (req.method === "POST") {
        const userId = session.user.row_ID;

        console.log(req.body);

        const eventData: EventData = {
            off: {},
            leave: {},
            attc: {},
            course: {},
            ma: {},
            others: {},
        };

        const personnel_IDs = [
            ...new Set(
                Object.keys(req.body).map(
                    (inputName) => inputName.split("-")[0]
                )
            ),
        ];
        Object.keys(req.body).forEach((inputName) => {
            const personnel_ID = Number(inputName.split("-")[0]);
            const type = inputName.split("-")[1] as keyof EventData;

            const tempArr = [...inputName.split("-")];
            tempArr.splice(0, 2);

            const subType = tempArr.join("-");
            if (eventData[type][personnel_ID]) {
                // Loop has gone through this personnel_ID before
                eventData[type][personnel_ID][subType] = req.body[inputName];
            } else {
                // Hasn't gone through this personnelID yet
                eventData[type][personnel_ID] = {
                    [subType]: req.body[inputName],
                };
            }
        });

        // Check that the user has rights to submit this data
        // Must be same company and unit
        const personnelIDsInSameCompany = await executeQuery({
            query: `SELECT COUNT(*) FROM personnel WHERE personnel_ID IN (?) AND company = ? AND unit = ?`,
            values: [personnel_IDs, session.user.company, session.user.unit],
        });

        if (personnelIDsInSameCompany[0]["COUNT(*)"] !== personnel_IDs.length) {
            return res.status(403).json({
                message: "You do not have rights to submit this data",
            });
        }

        const oldGroupID = await executeQuery({
            query: `SELECT MAX(group_ID) as max FROM audit_log`,
            values: [],
        });
        const groupID = oldGroupID[0].max + 1;

        const txn = db.transaction();

        (Object.keys(eventData) as Array<keyof EventData>).forEach(
            (event: keyof EventData) => {
                const eventDetails = eventData[event];
                Object.keys(eventDetails).forEach((p_ID) => {
                    const personnel_ID = Number(p_ID);
                    const indivDetails = eventDetails[Number(personnel_ID)];
                    console.log({ indivDetails, personnel_ID });

                    let sql = ``;
                    let arr: string[] = [];

                    switch (event) {
                        case "off": {
                            const daysOff =
                                calculateOutOfOfficeDuration(indivDetails);

                            indivDetails.days = daysOff;

                            arr = [
                                personnel_ID,
                                formatMySQLDateHelper(indivDetails.date[0]),
                                indivDetails["start-time"],
                                formatMySQLDateHelper(indivDetails.date[1]),
                                indivDetails["end-time"],
                                indivDetails.reason,
                                session.user.email,
                            ];
                            sql = `INSERT INTO off_tracker SET personnel_ID = ?, start = ?, start_time = ?, end = ?, end_time = ?, reason = ?, editor_ID = ?`;

                            const updateOffsSql = `UPDATE personnel SET off_balance=off_balance+? WHERE personnel_ID = ?`;
                            const updateOffsArr = [daysOff, personnel_ID];

                            // txn.query(sql, arr).query((r: any) => {
                            //     const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "CREATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
                            //     const auditArr = [
                            //         session.user.row_ID,
                            //         event,
                            //         r.insertId,
                            //         personnel_ID,
                            //         groupID,
                            //     ];
                            //     return [auditSql, auditArr];
                            // });
                            txn.query(updateOffsSql, updateOffsArr);
                            break;
                        }
                        case "leave":
                            const daysLeave =
                                calculateOutOfOfficeDuration(indivDetails);
                            indivDetails.days = daysLeave;

                            arr = [
                                personnel_ID,
                                formatMySQLDateHelper(indivDetails.date[0]),
                                indivDetails["start-time"],
                                formatMySQLDateHelper(indivDetails.date[1]),
                                indivDetails["end-time"],
                                indivDetails.reason,
                                session.user.email,
                            ];
                            sql = `INSERT INTO leave_tracker SET personnel_ID = ?, start = ?, start_time = ?, end = ?, end_time = ?, reason = ?, editor_ID = ?`;

                            const updateLeavesSql = `UPDATE personnel SET leave_balance=leave_balance+? WHERE personnel_ID = ?`;
                            const updateLeavesArr = [daysLeave, personnel_ID];

                            // txn.query(sql, arr).query((r: any) => {
                            //     const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "CREATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
                            //     const auditArr = [
                            //         session.user.row_ID,
                            //         event,
                            //         r.insertId,
                            //         personnel_ID,
                            //         groupID,
                            //     ];
                            //     return [auditSql, auditArr];
                            // });
                            txn.query(updateLeavesSql, updateLeavesArr);
                            break;

                        case "attc":
                            sql = `INSERT INTO attc_tracker SET personnel_ID = ?, start = ?, end = ?, attc_name = ?, editor_ID = ?`;
                            arr = [
                                personnel_ID,
                                formatMySQLDateHelper(indivDetails.date[0]),
                                formatMySQLDateHelper(indivDetails.date[1]),
                                indivDetails.reason,
                                session.user.email,
                            ];
                            // txn.query(sql, arr).query((r: any) => {
                            //     const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "CREATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
                            //     const auditArr = [
                            //         session.user.row_ID,
                            //         event,
                            //         r.insertId,
                            //         personnel_ID,
                            //         groupID,
                            //     ];
                            //     return [auditSql, auditArr];
                            // });
                            break;

                        case "course":
                            sql = `INSERT INTO course_tracker SET personnel_ID = ?, start = ?, end = ?, course_name = ?, editor_ID = ?`;
                            arr = [
                                personnel_ID,
                                formatMySQLDateHelper(indivDetails.date[0]),
                                formatMySQLDateHelper(indivDetails.date[1]),
                                indivDetails.name,
                                session.user.email,
                            ];
                            // txn.query(sql, arr).query((r: any) => {
                            //     const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "CREATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
                            //     const auditArr = [
                            //         session.user.row_ID,
                            //         event,
                            //         r.insertId,
                            //         personnel_ID,
                            //         groupID,
                            //     ];
                            //     return [auditSql, auditArr];
                            // });
                            break;

                        case "ma":
                            sql = `INSERT INTO ma_tracker SET personnel_ID = ?, date = ?, time = ?, location = ?, ma_name = ?, in_camp = ?, editor_ID = ?`;
                            arr = [
                                personnel_ID,
                                formatMySQLDateHelper(
                                    indivDetails["date-time"]
                                ),
                                formatMySQLTimeHelper(
                                    indivDetails["date-time"]
                                ),
                                indivDetails.location,
                                indivDetails.name,
                                indivDetails.incamp,
                                session.user.email,
                            ];
                            // txn.query(sql, arr).query((r: any) => {
                            //     const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "CREATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
                            //     const auditArr = [
                            //         session.user.row_ID,
                            //         event,
                            //         r.insertId,
                            //         personnel_ID,
                            //         groupID,
                            //     ];
                            //     return [auditSql, auditArr];
                            // });
                            break;

                        case "others":
                            sql = `INSERT INTO others_tracker SET personnel_ID = ?, start = ?, end = ?, others_name = ?, in_camp = ?, editor_ID = ?`;
                            arr = [
                                personnel_ID,
                                formatMySQLDateHelper(indivDetails.date[0]),
                                formatMySQLDateHelper(indivDetails.date[1]),
                                indivDetails.name,
                                indivDetails.incamp,
                                session.user.email,
                            ];
                            // txn.query(sql, arr).query((r: any) => {
                            //     const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "CREATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
                            //     const auditArr = [
                            //         session.user.row_ID,
                            //         event,
                            //         r.insertId,
                            //         personnel_ID,
                            //         groupID,
                            //     ];
                            //     return [auditSql, auditArr];
                            // });

                            break;
                    }

                    txn.query(sql, arr).query((r: any) => {
                        const auditSql = `INSERT INTO audit_log SET user_ID = ?, operation = "CREATE", type = ?, row_ID = ?, personnel_ID = ?, date = NOW(), group_ID = ?`;
                        const auditArr = [
                            session.user.row_ID,
                            event,
                            r.insertId,
                            personnel_ID,
                            groupID,
                        ];
                        return [auditSql, auditArr];
                    });
                });
            }
        );
        txn.rollback(console.log);
        txn.commit();
        // const insertIds = await executeQuery({})

        res.status(200).json({
            success: true,
            data: eventData,
        });
    } else {
        res.status(403).json({
            success: false,
        });
    }
}
