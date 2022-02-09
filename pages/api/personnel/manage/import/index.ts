import { format, isBefore, isValid, parse } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery, { db } from "../../../../../lib/db";
import Assignments from "../../../../../config/assignments.json";
import { BasicPersonnel } from "../../../../../types/database";
import { parseMySQLDateHelper } from "../../../../../lib/custom";

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
            console.log(req.body);
            const personnel: BasicPersonnel[] = req.body.personnel;

            const final = personnel.map((person) => {
                // validate data
                const finalPerson: BasicPersonnel = {
                    name: person.name.trim().toUpperCase(),
                    platoon: person.platoon.trim().toUpperCase(),
                    ord: "",
                    pes: "",
                    post_in: "",
                    rank: "",
                    svc_status: ""
                };
                requiredHeaders.forEach((header) => {
                    const trimmed = person[header]
                        .toString()
                        .trim()
                        .toUpperCase();
                    if (!person[header]) {
                        // Missing header or no values
                        finalPerson[header] = "error: Missing values!";
                    }
                });

                // Check rank
                if (
                    Object.keys(Assignments.rank_army).includes(
                        person.rank.trim().toUpperCase()
                    )
                ) {
                    // Rank is good
                    finalPerson.rank = person.rank.trim().toUpperCase();
                } else {
                    // Rank is not good
                    finalPerson.rank = `error: Invalid rank! (${person.rank})`;
                }

                // Check name exists

                // Check pes
                if (Assignments.pes.includes(person.pes.trim().toUpperCase())) {
                    // pes is good
                    finalPerson.pes = person.pes.trim().toUpperCase();
                } else {
                    // pes is not good
                    finalPerson.pes = `error: Invalid PES! (${person.pes})`;
                }

                // Check post_in
                if (isValid(new Date(person.post_in.toString().trim()))) {
                    // obj[headers[index]] = new Date(column).toISOString();
                    // is date string
                    finalPerson.post_in = format(
                        new Date(person.post_in.toString().trim()),
                        Assignments.mysqldateformat
                    );
                } else if (
                    isValid(
                        parse(
                            person.post_in.toString().trim(),
                            Assignments.mysqldateformat,
                            new Date()
                        )
                    )
                ) {
                    // is formatted correctly
                    finalPerson.post_in = person.post_in.toString().trim();
                } else {
                    // Error parsing DATE!
                    finalPerson.post_in = `error:Invalid Date Format (${person.post_in})`;
                }

                // Check ord
                if (isValid(new Date(person.ord.toString().trim()))) {
                    // obj[headers[index]] = new Date(column).toISOString();
                    // is date string
                    finalPerson.ord = format(
                        new Date(person.ord.toString().trim()),
                        Assignments.mysqldateformat
                    );
                } else if (
                    isValid(
                        parse(
                            person.ord.toString().trim(),
                            Assignments.mysqldateformat,
                            new Date()
                        )
                    )
                ) {
                    // is formatted correctly
                    finalPerson.ord = person.ord.toString().trim();
                } else {
                    // Error parsing DATE!
                    finalPerson.ord = `error:Invalid Date Format (${person.ord})`;
                }

                // Check ord after post in
                if (
                    !finalPerson.post_in.startsWith("error") &&
                    !finalPerson.ord.startsWith("error")
                ) {
                    if (
                        isBefore(
                            parseMySQLDateHelper(finalPerson.ord),
                            parseMySQLDateHelper(finalPerson.post_in)
                        )
                    ) {
                        // error - ord should not be before post in date
                        finalPerson.ord = `error: ORD should not be before Post In (${finalPerson.ord})`;
                        finalPerson.post_in = `error: ORD should not be before Post In (${finalPerson.post_in})`;
                    }
                }

                // Check svc status
                if (
                    Assignments.svc_status.includes(
                        person.svc_status.trim().toUpperCase()
                    )
                ) {
                    // svc status is good
                    finalPerson.svc_status = person.svc_status
                        .trim()
                        .toUpperCase();
                } else {
                    // svc status is not good
                    finalPerson.svc_status = `error: Invalid Service Status! (${person.svc_status})`;
                }

                return finalPerson;
            });

            res.status(200).json({
                success: true,
                data: final,
            });
        } catch (e: any) {
            res.status(400).json({
                error: e.toString(),
            });
        }
    }
}
