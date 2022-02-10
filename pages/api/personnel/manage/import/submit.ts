import { format, isBefore, isValid, parse } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery, { db } from "../../../../../lib/db";
import Assignments from "../../../../../config/assignments.json";
import { BasicPersonnel } from "../../../../../types/database";
import {
    formatMySQLDateHelper,
    parseMySQLDateHelper,
} from "../../../../../lib/custom";

const requiredHeaders: (keyof BasicPersonnel)[] = [
    "rank",
    "name",
    "pes",
    "post_in",
    "ord",
    "platoon",
    "svc_status",
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    if (!session || !session.user)
        return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
    } else {
        try {
            console.log("hello");
            console.log(req.body);
            const data: BasicPersonnel[] = req.body;

            // validate data first
            const errors: any[] = [];
            data.forEach((person, index) => {
                // Check rank
                if (
                    !Object.keys(Assignments.rank_army).includes(
                        person.rank.trim().toUpperCase()
                    )
                ) {
                    errors.push({
                        name: `input.${index}.rank`,
                        message: "Invalid rank!",
                    });
                }

                // Check name exists
                if (!person.name) {
                    errors.push({
                        name: `input.${index}.name`,
                        message: "Please enter a name!",
                    });
                }
                if (!person.platoon) {
                    errors.push({
                        name: `input.${index}.platoon`,
                        message: "Please enter a platoon!",
                    });
                }

                // Check pes
                if (
                    !Assignments.pes.includes(person.pes.trim().toUpperCase())
                ) {
                    errors.push({
                        name: `input.${index}.pes`,
                        message: "Invalid PES!",
                    });
                }

                // check ord and post in
                if (!isValid(new Date(person.ord.toString()))) {
                    errors.push({
                        name: `input.${index}.ord`,
                        message: "Invalid ORD format or date!",
                    });
                }
                if (!isValid(new Date(person.post_in.toString()))) {
                    errors.push({
                        name: `input.${index}.post_in`,
                        message: "Invalid Post In format or date!",
                    });
                }

                // Check ORD > post in
                if (
                    isValid(new Date(person.ord.toString())) &&
                    isValid(new Date(person.post_in.toString()))
                ) {
                    if (
                        !isBefore(
                            new Date(person.post_in.toString()),
                            new Date(person.ord.toString())
                        )
                    ) {
                        errors.push({
                            name: `input.${index}.post_in`,
                            message: `Post in cannot be after ORD! (${formatMySQLDateHelper(person.post_in.toString())})`,
                        });
                        errors.push({
                            name: `input.${index}.ord`,
                            message: `Post in cannot be after ORD! (${formatMySQLDateHelper(person.ord.toString())})`,
                        });
                    }
                }

                // Check svc status
                if (
                    !Assignments.svc_status.includes(
                        person.svc_status.trim().toUpperCase()
                    )
                ) {
                    errors.push({
                        name: `input.${index}.svc_status`,
                        message: "Invalid service status!",
                    });
                }
            });

            if (errors.length) {
                console.log(errors);
                return res.status(400).json({
                    error: {
                        message: "Invalid data!",
                        type: "validation_fail",
                        data: errors,
                    },
                });
            }

            // console.log({ errors, data });

            const sql =
                "INSERT INTO personnel (`rank`, name, pes, post_in, ord, off_balance, leave_balance, unit, company, platoon, section, svc_status) VALUES ?";
            const values = data.map((person) => [
                person.rank.trim().toUpperCase(),
                person.name.trim().toUpperCase(),
                person.pes.trim().toUpperCase(),
                formatMySQLDateHelper(person.post_in.toString()),
                formatMySQLDateHelper(person.ord.toString()),
                0,
                0,
                session.user.unit,
                session.user.company,
                person.platoon.trim().toUpperCase(),
                "UNASSIGNED",
                person.svc_status.trim().toUpperCase(),
            ]);
            console.log({ sql, values });

            const result = await executeQuery({
                query: sql,
                values: [values],
            });

            const personnelIDOfFirstPerson = result.insertId;
            const numberOfPersonnelAdded = result.affectedRows;

            const finalPersonnelID =
                personnelIDOfFirstPerson + numberOfPersonnelAdded - 1;

            let group_ID = await executeQuery({
                query: `SELECT MAX(group_ID) as max FROM audit_log`,
                values: [],
            });
            group_ID = Number(group_ID[0].max) + 1;

            const auditQuery =
                "INSERT INTO audit_log (group_ID, user_ID, operation, type, row_ID, personnel_ID, date) VALUES ?";
            const auditValues = [];
            for (let i = personnelIDOfFirstPerson; i <= finalPersonnelID; i++) {
                auditValues.push([
                    group_ID,
                    session.user.row_ID,
                    "CREATE",
                    "personnel",
                    i,
                    i,
                    new Date(),
                ]);
            }

            console.log({ auditQuery, auditValues });
            const auditResult = await executeQuery({
                query: auditQuery,
                values: [auditValues],
            });

            console.log({ result, auditResult });
            res.status(200).json({
                success: true,
                data,
            });
        } catch (e: any) {
            console.log(e);
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
