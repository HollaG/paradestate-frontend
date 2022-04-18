import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import executeQuery from "../../../../lib/db";
import { Activity } from "../../../../types/activity";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    const activity_ID = req.query.activity_ID.toString();

    if (req.method === "POST") {
        const activity: Activity[] = await executeQuery({
            query: `SELECT * FROM activity_list WHERE activity_ID = ? AND unit = ? AND company = ?`,
            values: [activity_ID, session.user.unit, session.user.company],
        });

        // ensure activity is found
        if (!activity)
            return res.status(400).json({ error: "Activity not found" });

        // ensure person can be edited
        const person = await executeQuery({
            query: "SELECT * FROM personnel WHERE personnel_ID = ? AND unit = ? AND company = ?",
            values: [
                req.body.personnel_ID,
                session.user.unit,
                session.user.company,
            ],
        });
        if (!person)
            return res
                .status(400)
                .json({ error: "Person not found or no permissions" });

        // delete personnel ID from attendee
        await executeQuery({
            query: `DELETE FROM activity_absentees WHERE activity_ID = ? AND personnel_ID = ?`,
            values: [activity_ID, req.body.personnel_ID],
        });

        await executeQuery({
            query: `INSERT INTO activity_attendees SET activity_ID = ?, personnel_ID = ?`,
            values: [activity_ID, req.body.personnel_ID],
        });

        res.status(200).json({ success: true });
    }
    // res.json(data);
}
