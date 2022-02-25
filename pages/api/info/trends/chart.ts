import parse from "date-fns/parse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import getDate from "date-fns/getDate";
import { format, addDays, subMonths, getDay, subDays } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import executeQuery from "../../../../lib/db";
import { ExtendedPersonnel } from "../../../../types/database";

import Assignments from "../../../../config/assignments.json";
import { generatePSObject } from "../../../../lib/custom";

export interface DatasetElement {
    label: string,
    data: any[],
    type?: "bar"|"line",
    order?: number,
    borderColor?: string,
    fill?: boolean,
    backgroundColor?: string
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>
) {
    try {
        const session = await getSession({ req });
        // console.log({ session });
        if (!session) return res.status(401);

        const selectedDate = new Date();
        // const selectedRange = Number(req.query.months) || 1
        // const selectedRange = 1; // 1 months
        
        if (req.method === "GET") {
            try {
                let analysisLengthInMonths = 1
                const selectedRange = Number(req.query.months) || 1
                if (selectedRange <= 6) analysisLengthInMonths = selectedRange;
                
                const endDate = new Date();
                let startDate;

                if (analysisLengthInMonths < 1)
                    startDate = subDays(endDate, (1 / analysisLengthInMonths) * 7); // weeks
                else startDate = subMonths(endDate, analysisLengthInMonths);
                
                const start = format(startDate, Assignments.dateformat);
                const end = format(endDate, Assignments.dateformat);
       
                // .add(1, "days")
                // console.log(startDate, endDate)
                const accounterArray = [];
                const attendance: {
                    present_pax: number[];
                    attc_pax: number[];
                    off_pax: number[];
                    leave_pax: number[];
                    ma_pax: number[];
                    course_pax: number[];
                    others_pax: number[];
                    status_pax: number[];
                    date: string[];
                } = {
                    // total_pax: [],
                    present_pax: [],
                    attc_pax: [],
                    off_pax: [],
                    leave_pax: [],
                    ma_pax: [],
                    course_pax: [],
                    others_pax: [],
                    status_pax: [],
                    date: [],
                };
                
                for (
                    let s = startDate;
                    s <= endDate;
                    s.setDate(s.getDate() + 1)
                ) {
                    // https://stackoverflow.com/questions/4345045/loop-through-a-date-range-with-javascript
                    // console.log(m.format(assignments.dateformat))
                    
                    const date = new Date(s);
                    let day = getDay(date);
                    if (day === 6 || day === 0) continue; // skip weekends

                    let PSObject = await generatePSObject(
                        "Company",
                        format(date, Assignments.mysqldateformat),
                        session.user.unit,
                        session.user.company,
                        session.user.email,
                        executeQuery
                    );
                    if (!PSObject) {
                        // some error
                        return res.status(400).json({
                            message: "Error in generating chart!",
                        });
                    }
                    accounterArray.push(PSObject);

                    // attendance["total_pax"].push(Number(PSObject["TOTAL-PAX"]))
                    let total = Number(PSObject["TOTAL-PAX"]);

                    // Push a % of 100
                    let commitments =
                        Number(PSObject["ATTC-PAX"]) +
                        Number(PSObject["OFF-PAX"]) +
                        Number(PSObject["LEAVE-PAX"]) +
                        Number(PSObject["MA-PAX"]) +
                        Number(PSObject["COURSE-PAX"]) +
                        Number(PSObject["OTHERS-PAX"]);
                    let noCommitments = total - commitments;
                    attendance["present_pax"].push(
                        Math.round((noCommitments / total) * 10000) / 100
                    );
                    attendance["attc_pax"].push(
                        Math.round(
                            (Number(PSObject["ATTC-PAX"]) / total) * 10000
                        ) / 100
                    );
                    attendance["off_pax"].push(
                        Math.round(
                            (Number(PSObject["OFF-PAX"]) / total) * 10000
                        ) / 100
                    );
                    attendance["leave_pax"].push(
                        Math.round(
                            (Number(PSObject["LEAVE-PAX"]) / total) * 10000
                        ) / 100
                    );
                    attendance["ma_pax"].push(
                        Math.round(
                            (Number(PSObject["MA-PAX"]) / total) * 10000
                        ) / 100
                    );
                    attendance["course_pax"].push(
                        Math.round(
                            (Number(PSObject["COURSE-PAX"]) / total) * 10000
                        ) / 100
                    );
                    attendance["others_pax"].push(
                        Math.round(
                            (Number(PSObject["OTHERS-PAX"]) / total) * 10000
                        ) / 100
                    );
                    attendance["status_pax"].push(
                        Math.round(
                            (Number(PSObject["STATUS-PAX"]) / total) * 10000
                        ) / 100
                    );
                    const parsed = parse(
                        PSObject["SELECTED-DATE"],
                        "ddMMyyyy",
                        new Date()
                    );
                    attendance["date"].push(format(parsed, "d/M eee"));
                    // attendance["date"].push(moment(PSObject["SELECTED-DATE"], "DDMMYYYY").format(assignments.datenoyear))
                }


                const attendanceGraphData: {
                    labels: string[];
                    datasets: DatasetElement[];
                } = {
                    labels: attendance["date"],
                    datasets: [],
                };
                const commitmentsGraphData = {
                    labels: attendance["date"],
                    datasets: [],
                };
                const fillColorData = {
                    present_pax: "rgba(163, 207, 187, 0.25)",
                    total_pax: "rgba(241, 174, 181, 0.25)",
                    attc_pax: "rgba(158, 197, 254, 0.25)",
                    off_pax: "rgba(194, 159, 250, 0.25)",
                    leave_pax: "rgba(239, 173, 206, 0.25)",
                    ma_pax: "rgba(254, 203, 161, 0.25)",
                    course_pax: "rgba(197, 179, 230, 0.25)",
                    others_pax: "rgba(158, 234, 249, 0.25)",
                    status_pax: "rgba(241, 174, 181, 0)",
                };
                const borderColorData = {
                    present_pax: "rgba(163, 207, 187, 1)",
                    total_pax: "rgba(241, 174, 181, 1)",
                    attc_pax: "rgba(158, 197, 254, 1)",
                    off_pax: "rgba(194, 159, 250, 1)",
                    leave_pax: "rgba(239, 173, 206, 1)",
                    ma_pax: "rgba(254, 203, 161, 1)",
                    course_pax: "rgba(197, 179, 230, 1)",
                    others_pax: "rgba(158, 234, 249, 1)",
                    status_pax: "rgba(241, 174, 181, 1)",
                };
                for (let key in attendance) {
                    if (key == "date") continue;

                    let datasetElement: DatasetElement = {
                        label: `${key.split("_")[0].toUpperCase()} (%)`,
                        data: attendance[key as keyof typeof attendance],
                        // fill: true,
                    };

                    if (key == "status_pax") {
                        datasetElement.type = "line"; // For status, we draw a line graph instead as it doesn't contribute to the total
                        datasetElement.order = 0;
                        datasetElement.borderColor = borderColorData[key];
                        datasetElement.fill = false;
                    } else {
                        datasetElement.type = "bar";
                        datasetElement.order = 1;
                        datasetElement.backgroundColor = borderColorData[key as keyof typeof borderColorData];
                    }

                    // switch (key) {
                    //     case "present_pax":
                    //         obj.fill = {
                    //             target: "origin",
                    //             above: fillColorData[key]
                    //         }

                    //         break
                    //     case "total_pax":
                    //         obj.fill = {
                    //             target: 1,
                    //             above: fillColorData[key]
                    //         }

                    //         break;
                    //     default:

                    //         obj.fill = {
                    //             target: "origin",
                    //             above: fillColorData[key]
                    //         }
                    // }
                    datasetElement.borderColor = borderColorData[key as keyof typeof borderColorData];
                    // if (key == "present_pax" || key == "total_pax")
                    attendanceGraphData["datasets"].push(datasetElement);
                    // else
                    // commitmentsGraphData['datasets'].push(obj)
                }
             

                const obj = {
                    attendanceGraphData, start, end
                }
                res.status(200).json(obj)
            } catch (e) {
                console.log(e);
                res.status(400).json({
                    error: JSON.stringify(e),
                });
            }
        } else {
            res.json({});
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e });
    }
}
