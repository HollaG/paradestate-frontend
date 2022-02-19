import { format, subDays } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import Assignments from "../../../config/assignments.json";
import { formatMySQLDateHelper } from "../../../lib/custom";
// Expects an array (always!!) of personnel IDs to retrieve information for.

export interface AuditLogInterface {
    audit_ID: number;
    date: Date;
    group_ID: number;
    operation: string;
    personnel_ID: number;
    row_ID: number;
    type: string;
    user_ID: number;
    username: string;
    email: string;
    company: string;
    unit: string;
}

export interface AuditResponse {
    [date: string]: {
        [groupID: string]: AuditLogInterface[];
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    const limit = req.query.limit;

    if (Number.isNaN(limit))
        return res.status(400).json({
            message: "Limit must be a number",
        });

    const now = new Date();
    const until = formatMySQLDateHelper(subDays(now, Number(limit)).toString());

    // sort into days, then sort into groups

    if (req.method === "GET") {
        try {
            console.log(until);
            const auditLogs: AuditLogInterface[] = await executeQuery({
                query: `SELECT audit_log.*, users.username, users.email, users.company, users.unit FROM audit_log LEFT JOIN users ON audit_log.user_ID = users.row_ID WHERE users.company = ? AND users.unit = ? AND DATE(date) >= DATE(?) ORDER BY audit_ID DESC`,
                values: [session.user.company, session.user.unit, until],
            });
            // console.log({auditLogs})
            const orderedByDate = auditLogs.reduce<{
                [key: string]: AuditLogInterface[];
            }>((r, a) => {
                r[format(a.date, Assignments.dateformat)] = [
                    ...(r[format(a.date, Assignments.dateformat)] || []),
                    a,
                ];
                return r;
            }, {});
            const orderedByDateAndGroup: AuditResponse = {};
            Object.keys(orderedByDate).forEach((date) => {
                orderedByDateAndGroup[date] = orderedByDate[date].reduce<{
                    [key: string]: AuditLogInterface[];
                }>((r, a) => {
                    r[a.group_ID] = [...(r[a.group_ID] || []), a];
                    return r;
                }, {});
            });

            res.json(orderedByDateAndGroup);
        } catch (e) {
            console.log(e);
            res.json({});
        }
    }
}
