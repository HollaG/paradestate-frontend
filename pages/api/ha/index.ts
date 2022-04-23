import { differenceInBusinessDays, format, subDays } from "date-fns";
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

    if (req.method === "GET") {
        try {
            const currentDate = new Date(); // todo - let this be user-selectable
            const mysqlFormatted = format(
                currentDate,
                Assignments.mysqldateformat
            );
            const opts = {
                unit: session.user.unit,
                company: session.user.company,
                selDate: mysqlFormatted,
            };

            // console.log(query);
            const personnel: ExtendedPersonnel[] = await executeQuery({
                query: `SELECT *, CASE WHEN (personnel.ha_end_date) > (DATE(?)) THEN true ELSE false END AS ha_active FROM personnel LEFT JOIN ranks ON ranks.rank = personnel.rank WHERE DATE(post_in) <= DATE(?) AND DATE(ord) >= DATE(?) AND unit = ? AND company = ? ORDER BY ranks.rank_order DESC`,
                values: [opts.selDate, opts.selDate, opts.unit, opts.company],
            });

            // Sort into 'expired', 'expiring', and 'active'
            const expired = personnel.filter((person) => !person.ha_active);
            const expiring = personnel.filter(
                (person) =>
                    person.ha_active &&
                    differenceInBusinessDays(person.ha_end_date, new Date()) <=
                        3
            );
            const active = personnel.filter(
                (person) =>
                    person.ha_active &&
                    differenceInBusinessDays(person.ha_end_date, new Date()) > 3
            );

            
            const numbers = {
                expired: expired.length,
                expiring: expiring.length,
                active: active.length,
            };

            const expiredByPlatoon = expired.reduce<{
                [key: string]: Personnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

            const expiringByPlatoon = expiring.reduce<{
                [key: string]: Personnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

            const activeByPlatoon = active.reduce<{
                [key: string]: Personnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

            // Order by platoon using reduce
            const sortedByPlatoon = personnel.reduce<{
                [key: string]: Personnel[];
            }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});
            const totals: { [key: string]: number } = {};
            Object.keys(sortedByPlatoon).forEach(
                (platoon) => (totals[platoon] = sortedByPlatoon[platoon].length)
            );
            // Calculate number of acclimatised people per platoon
            const acclimatisedNumbers: { [key: string]: number } = {};
            Object.keys(sortedByPlatoon).forEach(
                (key) => (acclimatisedNumbers[key] = 0)
            );
            personnel.forEach((person) => {
                if (person.ha_active) {
                    acclimatisedNumbers[person.platoon] += 1;
                }
            });

            const responseData = {
                
                selectedDate: currentDate,
                totals,
                expiredByPlatoon,
                expiringByPlatoon,
                activeByPlatoon,
                numbers,
            };
            res.status(200).json(responseData);
        } catch (e: any) {
            console.log(e);
            res.json({ error: e.toString() });
        }
    }
}
