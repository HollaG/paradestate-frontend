import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { EventData } from "../../../types/types";


// Expects an array (always!!) of personnel IDs to retrieve information for.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{responseData: keyof EventData, personnelMap: {[key:string]: Personnel}} | {}>
) {
    const session = await getSession({ req });
    // console.log({ session });
    if (!session) return res.status(401);

    if (req.method === "POST") {
   

        const { data } = req.body;
        const personnel_IDs = [
            ...new Set(
                Object.keys(data).map((inputName) => inputName.split("-")[0])
            ),
        ];

        // Make hashmap mapping personnel_IDs to their details
        const personnel: Personnel[] = await executeQuery({
            query: `SELECT *, CASE WHEN (personnel.ha_end_date) > (NOW()) THEN true ELSE false END AS ha_active FROM personnel WHERE personnel_ID IN (?)`,
            values: [personnel_IDs],
        });
        const personnelMap: { [key: string]: Personnel } = {};
        personnel.forEach((person) => (personnelMap[person.personnel_ID] = person));

        const eventData: EventData = {
            off: {},
            leave: {},
            attc: {},
            course: {},
            ma: {},
            others: {}
        };
      
        Object.keys(data).forEach((inputName) => {
            
            const personnel_ID = Number(inputName.split("-")[0]);
            const type = inputName.split("-")[1] as keyof EventData;

            const tempArr = [...inputName.split("-")]
            tempArr.splice(0, 2)

            const subType = tempArr.join("-")
         
            if (eventData[type][personnel_ID]) { 
                // Loop has gone through this personnel_ID before
                eventData[type][personnel_ID][subType] = data[inputName];
            } else { 
                // Hasn't gone through this personnelID yet
                eventData[type][personnel_ID] = { [subType]: data[inputName] };
            }
        });

        res.status(200).json({data: eventData, personnelMap});

    } else { 
        res.status(403).json({});

    }

}
