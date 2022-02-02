import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";


// Expects an array (always!!) of personnel IDs to retrieve information for.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{} | {}>
) {
    const session = await getSession({ req });
    // console.log({ session });
    if (!session) return res.status(401);

    if (req.method === "POST") {
   

        
        res.status(200).json({});

    } else { 
        res.status(403).json({});

    }

}
