import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";

interface Data  {[key:string]: Personnel}

// Expects an array (always!!) of personnel IDs to retrieve information for.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const session = await getSession({ req })

    if (!session) return res.status(401)


    const personnel_IDs = (req.query.ids as string).split(",");
    if (!personnel_IDs.length) res.json({})

    const personnel: Personnel[] = await executeQuery({
        query: `SELECT * FROM personnel WHERE personnel_ID IN (?)`,
        values: [personnel_IDs],
    });
    const data: Data = {}
    personnel.forEach(person => data[person.personnel_ID] = person)

    res.status(200).json(data)
  }
  