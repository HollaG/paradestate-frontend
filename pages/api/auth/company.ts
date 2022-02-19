import parse from "date-fns/parse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { EventData, HighlightedDay } from "../../../types/types";
import Assignments from "../../../config/assignments.json";
import getDate from "date-fns/getDate";

import bcrypt from 'bcrypt'
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        const currentDate = new Date();
        if (req.method === "POST") {
            const { company, unit, password } = req.body
            if (!company || !unit || !password) return res.status(400).json({error: "Missing required fields"})

            // Check that the company does not already exist
            const companyExists = await executeQuery({
                query: `SELECT company FROM company_list WHERE company = ? AND unit = ?`,
                values: [company, unit]
            })
            if (companyExists.length) return res.status(400).json({error: "Company already exists!", type: "exists"})
            
            // hash password'
            const hashedPassword = await new Promise((resolve, reject) => {
				bcrypt.hash(password, Number(process.env.SALT_ROUNDS), (err, hash) => {
					if (err) reject(err)
					resolve(hash)
				});
			})

            await executeQuery({
                query: `INSERT INTO company_list SET company = ?, unit = ?, password = ?`,
                values: [company, unit, hashedPassword]
            })

            // Set user 
            await executeQuery({
                query: `UPDATE users SET unit = ?, company = ? WHERE email = ?`,
                values: [unit, company, session.user.email]
            })

            return res.status(200).json({
                success: true,
                data: {
                    unit, company
                }
            })
           
        } else {
            res.json({});
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
