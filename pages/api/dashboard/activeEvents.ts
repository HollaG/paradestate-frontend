import parse from "date-fns/parse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import executeQuery from "../../../lib/db";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import { EventData, HighlightedDay } from "../../../types/types";
import Assignments from "../../../config/assignments.json";
import getDate from "date-fns/getDate";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        const currentDate = new Date();
        if (req.method === "GET") {
            // Recieves personnel_ID, type, and date
            const date = parse(
                req.query.date.toString(),
                Assignments.mysqldateformat,
                new Date()
            );
            const mysqlDate = req.query.date;
            const personnel_ID = req.query.personnel_ID;
            const type = req.query.type;

            let query;
            let arr = [personnel_ID, mysqlDate, mysqlDate];
            switch (type) {
                case "off":
                    query = `SELECT * FROM off_tracker WHERE personnel_ID = ? AND (MONTH(DATE(?)) = MONTH(start) OR MONTH(DATE(?)) = MONTH(end))`;
                    break;
                case "leave":
                    query = `SELECT * FROM leave_tracker WHERE personnel_ID = ? AND (MONTH(DATE(?)) = MONTH(start) OR MONTH(DATE(?)) = MONTH(end))`;
                    break;
                case "attc":
                    query = `SELECT * FROM attc_tracker WHERE personnel_ID = ? AND (MONTH(DATE(?)) = MONTH(start) OR MONTH(DATE(?)) = MONTH(end))`;
                    break;
                case "course":
                    query = `SELECT * FROM course_tracker WHERE personnel_ID = ? AND (MONTH(DATE(?)) = MONTH(start) OR MONTH(DATE(?)) = MONTH(end))`;
                    break;
                case "ma":
                    query = `SELECT * FROM ma_tracker WHERE personnel_ID = ? AND MONTH(DATE(?)) = MONTH(date)`;
                    arr = [personnel_ID, mysqlDate];
                    break;
                case "others":
                    query = `SELECT * FROM others_tracker WHERE personnel_ID = ?`;
                    break;
                default:
                    return res.status(400).json({ error: "Invalid type" });
            }

            console.log({ query, arr });

            const result = await executeQuery({
                query,
                values: arr,
            });
            console.log({ type, result });
            console.log("------------------------------------");

            const responseData: HighlightedDay[] = [];

            result.forEach((r: any) => {
                if (type === "ma") {
                    // For every date, push to responseData
                    // badgeText: "IN" or "OUT"
                    let badgeText = r.in_camp ? "IN" : "OUT";
                    responseData.push({
                        day: getDate(r.date),
                        badgeText,
                        disabled: false,
                    });
                } else if (type === "others") {
                } else {
                    // For every day between the start and end dates,
                    // push to responseData an object with the day and the badgeText
                    const startDay = getDate(r.start);
                    const endDay = getDate(r.end);
                    if (startDay > endDay) {
                        // startDay = 31, endDay = 1 --> previous month
                    } else {
                        for (let i = 0; i < endDay - startDay + 1; i++) {
                            let badgeText;
                            if (type === "off" || type == "leave") {
                                if (i === 0 && i === endDay - startDay) {
                                    // one day off
                                    if (r.start_time === r.end_time) badgeText = r.start_time;
                                    else badgeText = "FULL"
                                } else {
                                    if (i === 0)
                                        badgeText = r.start_time;
                                    else if (i === endDay - startDay)
                                        badgeText = r.end_time;
                                }
                            } else if (type === "course") {
                                badgeText = r.in_camp ? "IN" : "OUT";
                                
                            }

                            responseData.push({
                                day: startDay + i,
                                badgeText,
                                disabled: badgeText === "FULL",
                            });
                        }
                    }
                }
            });
            console.log({ responseData });

            res.status(200).json(responseData);
        } else {
            res.json({});
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
