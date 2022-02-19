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
            const unitCompany = req.body[`unit${Assignments.separator}company`]
            const password = req.body.password
            const unit = unitCompany.split(Assignments.separator)[0]
            const company = unitCompany.split(Assignments.separator)[1]

            // Ensure company and unit exists
            const resultExists = await executeQuery({
                query: `SELECT * FROM company_list WHERE company = ? AND unit = ?`,
                values: [company, unit]
            })

            if (!resultExists[0]) { 
                // doesbt Exists
                return res.status(400).json({
                    error: "Company or Unit does not exist",
                    type: "not_found"
                })
            }

            const dbPassword = resultExists[0].password

            const result = await new Promise((resolve, reject) => {
                bcrypt.compare(password, dbPassword, (err, result) => {
                    if (err) reject(err)
                    resolve(result)
                })
            })

            if (!result) { 
                // password was wrong
                return res.status(400).json({
                    error: "Password does not match!",
                    type: "wrong_password"
                })
            }

            await executeQuery({
                query: `UPDATE users SET company = ?, unit = ?, platoon = ? WHERE email = ?`,
                values: [company, unit, "", session.user.email]
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
