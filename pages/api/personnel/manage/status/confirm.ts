import { format } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../../../config/assignments.json";
import executeQuery from "../../../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../../../types/database";
import { Status } from "../../../../../types/types";
import { StatusOption } from "../../../../personnel/manage/status";
interface PersonnelMap {
    [key: string]: {
        [key: string]: {
            perm: boolean;
            selected: StatusOption[];
            date: string[];
        };
    };
}
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

        const personnelMap: { [key: string]: { [key: string]: any } } = {};
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
        console.log({ personnelMap });

        const personnel_IDs = Object.keys(personnelMap);
        if (!personnel_IDs.length) {
            return res.status(400).json({ error: "No personnel selected" });
        }

        const personnel: Personnel[] = await executeQuery({
            query: `SELECT * FROM personnel WHERE personnel_ID IN (?) AND unit = ? AND company = ?`,
            values: [personnel_IDs, session.user.unit, session.user.company],
        });
        if (personnel.length !== personnel_IDs.length)
            res.status(400).json({
                error: "Illegal operation - user has no perms to edit this personnel",
            });

        const sortedByPlatoon =
            personnel.reduce<{ [key: string]: Personnel[] }>((r, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

        const statusQuery = `SELECT status_ID, status_name FROM status_list`;

        // const statusPersonnel: ExtendedPersonnel[] = await executeQuery({
        //     query,
        //     values,
        // });
        const statusList: Status[] = await executeQuery({
            query: statusQuery,
        });
        const statuses = statusList.map((status) => ({
            label: status.status_name,
            value: status.status_ID,
        }));
        const responseData = { sortedByPlatoon, personnelMap, statuses };
        res.status(200).json({ success: true, data: responseData });

        return;

        // const statusDate = (data["status-date"] as string[]).map((date) =>
        //     format(new Date(date), Assignments.mysqldateformat)
        // );
        // const isPerm = !!data["status-perm"];
        // const statuses = data["status-selected"] as StatusOption[];

        // const personnel_IDs = Object.keys(data)
        //     .filter(
        //         (inputName) =>
        //             inputName.startsWith("status-personnel") && data[inputName]
        //     )
        //     .map((inputName) => Number(inputName.split("-")[2]));

        // // Todo - serverside validation of personnel_ID

        // if (!personnel_IDs.length) {
        //     return res.status(400).json({ error: "No personnel selected" });
        // }
        // if (!statuses.length) {
        //     return res.status(400).json({ error: "No statuses selected" });
        // }

        // const personnel: Personnel[] = await executeQuery({
        //     query: `SELECT * FROM personnel WHERE personnel_ID IN (?) AND unit = ? AND company = ?`,
        //     values: [personnel_IDs, session.user.unit, session.user.company],
        // });
        // if (personnel.length !== personnel_IDs.length)
        //     res.status(400).json({
        //         error: "Illegal operation - user has no perms to edit this personnel",
        //     });

        // const sortedByPlatoon: { [key: string]: ExtendedPersonnel[] } =
        //     personnel.reduce((r: any, a: any) => {
        //         r[a.platoon as any] = [...(r[a.platoon as any] || []), a];
        //         return r;
        //     }, {});
        // const responseData = {
        //     sortedByPlatoon,
        //     isPerm,
        //     statusDate,
        //     statuses,
        // };
        // res.status(200).json({ success: true, data: responseData });
    } else {
        res.status(403).json({});
    }
}
