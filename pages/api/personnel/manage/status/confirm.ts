import { format } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../../../config/assignments.json";
import executeQuery from "../../../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../../../types/database";
import { StatusOption } from "../../../../personnel/manage/status";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{} | {}>
) {
    const session = await getSession({ req });
    console.log(req);
    // console.log({ session });
    if (!session) return res.status(401);

    if (req.method === "POST") {
        const data = req.body;
        const statusDate = (data["status-date"] as string[]).map((date) =>
            format(new Date(date), Assignments.mysqldateformat)
        );
        const isPerm = !!data["status-perm"];
        const statuses = data["status-selected"] as StatusOption[];

        const personnel_IDs = Object.keys(data)
            .filter(
                (inputName) =>
                    inputName.startsWith("status-personnel") && data[inputName]
            )
            .map((inputName) => Number(inputName.split("-")[2]));

        // Todo - serverside validation of personnel_ID

        if (!personnel_IDs.length) {
            return res.status(400).json({ error: "No personnel selected" });
        }
        if (!statuses.length) {
            return res.status(400).json({ error: "No statuses selected" });
        }

        const personnel: Personnel[] = await executeQuery({
            query: `SELECT * FROM personnel WHERE personnel_ID IN (?) AND unit = ? AND company = ?`,
            values: [personnel_IDs, session.user.unit, session.user.company],
        });
        if (personnel.length !== personnel_IDs.length)
            res.status(400).json({
                error: "Illegal operation - user has no perms to edit this personnel",
            });

        const sortedByPlatoon: { [key: string]: ExtendedPersonnel[] } =
            personnel.reduce((r: any, a: any) => {
                r[a.platoon as any] = [...(r[a.platoon as any] || []), a];
                return r;
            }, {});
        const responseData = {
            sortedByPlatoon,
            isPerm,
            statusDate,
            statuses,
        };
        res.status(200).json({ success: true, data: responseData });
    } else {
        res.status(403).json({});
    }
}
