import { format } from "date-fns";
import { queryBuilder } from "mysql-query-placeholders";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Assignments from "../../../../config/assignments.json";
import executeQuery from "../../../../lib/db";
import { ExtendedPersonnel } from "../../../../types/database";
import { ExtendedStatus } from "../../../../types/types";

export interface SortedObject {
    [key: string]: {
        [key: string]: ExtendedPersonnel[];
    };
}

interface StatusPersonnel extends ExtendedStatus, ExtendedPersonnel {}

export interface SortedStatusObject {
    [key: string]: {
        [key: string]: StatusPersonnel[];
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) return res.status(401);

    const currentDate = new Date(); // todo - let this be user-selectable
    const mysqlFormatted = format(currentDate, Assignments.mysqldateformat);
    const opts = {
        unit: session.user.unit,
        company: session.user.company,
        selDate: mysqlFormatted,
    };

    const query = queryBuilder(
        "select * from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as a USING(personnel_ID) left join (SELECT personnel_ID, start as attc_start, end as attc_end, attc_name, row_ID as attc_row_ID FROM attc_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as b USING(personnel_ID) left join (SELECT personnel_ID, row_ID as course_row_ID, course_name, start as course_start, end as course_end FROM course_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as c USING(personnel_ID) left join (SELECT personnel_ID, start as leave_start, start_time as leave_start_time, end as leave_end, end_time as leave_end_time, reason as leave_reason, row_ID as leave_row_ID FROM leave_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as d USING(personnel_ID) left join (SELECT personnel_ID, start as off_start, start_time as off_start_time, end as off_end, end_time as off_end_time, reason as off_reason, row_ID as off_row_ID FROM off_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as e USING(personnel_ID) left join (SELECT personnel_ID, row_ID as others_row_ID, start as others_start, end as others_end, others_name, in_camp as others_incamp FROM others_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as f USING(personnel_ID) left join (SELECT personnel_ID, date as ma_date, time as ma_time, location as ma_location, ma_name, in_camp as ma_in_camp, row_ID as ma_row_ID FROM ma_tracker WHERE DATE(date) = DATE(:selDate) group by personnel_ID) as g USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE unit = :unit AND company = :company AND DATE(ord) >= DATE(:selDate) AND DATE(post_in) <= DATE(:selDate) ORDER BY platoon ASC, ranks.rank_order DESC, personnel.name ASC",
        opts
    );
    // console.log(query);
    const personnel: ExtendedPersonnel[] = await executeQuery({
        query: query.sql,
        values: query.values,
    });

    const objectified = [...personnel];

    if (!objectified) return { props: {} };

    // const edited: ExtendedPersonnel[] = [];
    let commitmentsIDs: string[] = [];
    let numberOfMAsInCamp = 0;
    let platoonNumbers: { [key: string]: { in: number; out: number } } = {};
    const hasEvent: any[] = [];
    const noEvent: any[] = [];
    objectified.forEach((x) => {
        const locationArr = [];

        if (x.attc_row_ID) locationArr.push("On AttC");
        if (x.course_row_ID) locationArr.push("On course");
        if (x.leave_row_ID) locationArr.push("On leave");
        if (x.off_row_ID) locationArr.push("On off");
        if (x.ma_row_ID) {
            if (x.ma_in_camp) {
                locationArr.push("On MA (In camp)");
                numberOfMAsInCamp++;
            } else {
                locationArr.push("On MA");
            }
        }
        if (x.others_row_ID) {
            if (x.others_in_camp) {
                locationArr.push("Others (In camp)");
            } else {
                locationArr.push("Others");
            }
        }

        const str = locationArr.join(", ");
        if (!platoonNumbers[x.platoon])
            platoonNumbers[x.platoon] = { in: 0, out: 0 };
        if (str.length) {
            // if (!commitmentsIDs.includes(x.personnel_ID.toString()))
            commitmentsIDs.push(x.personnel_ID.toString());
            platoonNumbers[x.platoon].out++;
        } else {
            platoonNumbers[x.platoon].in++;
        }
        x.location = str || "In camp";
        x.locationArr = locationArr;
        // Remove null values
        const cleansed = Object.fromEntries(
            Object.entries(x).filter(([_, v]) => v != null)
        ) as ExtendedPersonnel;
        // edited.push(cleansed);
        if (cleansed.location === "In camp") {
            noEvent.push(cleansed);
        } else {
            hasEvent.push(cleansed);
        }
    });

    const edited: ExtendedPersonnel[] = [...noEvent, ...hasEvent];

    const commitments = commitmentsIDs.length;

    const sortedByPlatoon = edited.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});

    const inCampSortedByPlatoon = noEvent.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});

    // ----------------------------------------------------
    const off_personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM off_tracker LEFT JOIN personnel ON off_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(off_tracker.start) <= DATE(?) AND DATE(off_tracker.end) >= DATE(?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC, name ASC`,
        values: [
            session.user.unit,
            session.user.company,
            mysqlFormatted,
            mysqlFormatted,
            mysqlFormatted,
        ],
    });

    const offSortedByPlatoon = off_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});

    const offSortedByPlatoonThenID: SortedObject = {};
    Object.keys(offSortedByPlatoon).forEach((platoon) => {
        const personnel = offSortedByPlatoon[platoon];
        const temp = personnel.reduce<{
            [key: string]: ExtendedPersonnel[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});
        offSortedByPlatoonThenID[platoon] = temp;
    });

    const sortedByOff = off_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    const leave_personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM leave_tracker LEFT JOIN personnel ON leave_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(leave_tracker.start) <= DATE(?) AND DATE(leave_tracker.end) >= DATE(?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC, name ASC`,
        values: [
            session.user.unit,
            session.user.company,
            mysqlFormatted,
            mysqlFormatted,
            mysqlFormatted,
        ],
    });

    const leaveSortedByPlatoon = leave_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});
    const leaveSortedByPlatoonThenID: SortedObject = {};
    Object.keys(leaveSortedByPlatoon).forEach((platoon) => {
        const personnel = leaveSortedByPlatoon[platoon];
        const temp = personnel.reduce<{
            [key: string]: ExtendedPersonnel[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});
        leaveSortedByPlatoonThenID[platoon] = temp;
    });

    const sortedByLeave = leave_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    const attc_personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM attc_tracker LEFT JOIN personnel ON attc_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(attc_tracker.start) <= DATE(?) AND DATE(attc_tracker.end) >= DATE(?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC, name ASC`,
        values: [
            session.user.unit,
            session.user.company,
            mysqlFormatted,
            mysqlFormatted,
            mysqlFormatted,
        ],
    });

    const attcSortedByPlatoon = attc_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});
    const attcSortedByPlatoonThenID: SortedObject = {};
    Object.keys(attcSortedByPlatoon).forEach((platoon) => {
        const personnel = attcSortedByPlatoon[platoon];
        const temp = personnel.reduce<{
            [key: string]: ExtendedPersonnel[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});
        attcSortedByPlatoonThenID[platoon] = temp;
    });

    const sortedByAttc = attc_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    const course_personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM course_tracker LEFT JOIN personnel ON course_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(course_tracker.start) <= DATE(?) AND DATE(course_tracker.end) >= DATE(?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC, name ASC`,
        values: [
            session.user.unit,
            session.user.company,
            mysqlFormatted,
            mysqlFormatted,
            mysqlFormatted,
        ],
    });

    const courseSortedByPlatoon = course_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});
    const courseSortedByPlatoonThenID: SortedObject = {};
    Object.keys(courseSortedByPlatoon).forEach((platoon) => {
        const personnel = courseSortedByPlatoon[platoon];
        const temp = personnel.reduce<{
            [key: string]: ExtendedPersonnel[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});
        courseSortedByPlatoonThenID[platoon] = temp;
    });

    const sortedByCourse = course_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    const ma_personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM ma_tracker LEFT JOIN personnel ON ma_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(ma_tracker.date) = DATE(?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC, name ASC`,
        values: [
            session.user.unit,
            session.user.company,
            mysqlFormatted,
            mysqlFormatted,
        ],
    });

    const maSortedByPlatoon = ma_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});
    const maSortedByPlatoonThenID: SortedObject = {};
    Object.keys(maSortedByPlatoon).forEach((platoon) => {
        const personnel = maSortedByPlatoon[platoon];
        const temp = personnel.reduce<{
            [key: string]: ExtendedPersonnel[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});
        maSortedByPlatoonThenID[platoon] = temp;
    });

    const sortedByMa = ma_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});
    const others_personnel: ExtendedPersonnel[] = await executeQuery({
        query: `SELECT * FROM others_tracker LEFT JOIN personnel ON others_tracker.personnel_ID = personnel.personnel_ID WHERE personnel.unit = ? AND personnel.company = ? AND DATE(others_tracker.start) <= DATE(?) AND DATE(others_tracker.end) >= DATE(?) AND DATE(ord) >= DATE(?) ORDER BY platoon ASC, name ASC`,
        values: [
            session.user.unit,
            session.user.company,
            mysqlFormatted,
            mysqlFormatted,
            mysqlFormatted,
        ],
    });

    const othersSortedByPlatoon = others_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});
    const othersSortedByPlatoonThenID: SortedObject = {};
    Object.keys(othersSortedByPlatoon).forEach((platoon) => {
        const personnel = othersSortedByPlatoon[platoon];
        const temp = personnel.reduce<{
            [key: string]: ExtendedPersonnel[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});
        othersSortedByPlatoonThenID[platoon] = temp;
    });

    const sortedByOthers = others_personnel.reduce<{
        [key: string]: ExtendedPersonnel[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    // ----------------------------------------------------
    // Get all personnel statuses
    const currentPersonnel = personnel.map((person) => person.personnel_ID);
    const query2 =
        "SELECT status_tracker.*, status_list.*, personnel.platoon, personnel.name, personnel.rank, personnel.pes FROM status_tracker LEFT JOIN personnel ON personnel.personnel_ID = status_tracker.personnel_ID LEFT JOIN status_list ON status_list.status_ID = status_tracker.status_ID WHERE status_tracker.personnel_ID IN (?) AND (type='perm' OR (DATE(start) <= DATE(?) AND DATE(END) >= DATE(?))) ORDER BY platoon ASC ";
    const values2 = [currentPersonnel, mysqlFormatted, mysqlFormatted];

    const statuses: StatusPersonnel[] = await executeQuery({
        query: query2,
        values: values2,
    });

    const statusesSortedByPlatoon = statuses.reduce<{
        [key: string]: StatusPersonnel[];
    }>((r, a) => {
        r[a.platoon] = [...(r[a.platoon] || []), a];
        return r;
    }, {});
    const statusesSortedByPlatoonThenID: SortedStatusObject = {};
    Object.keys(statusesSortedByPlatoon).forEach((platoon) => {
        const personnel = statusesSortedByPlatoon[platoon];
        const temp = personnel.reduce<{
            [key: number]: StatusPersonnel[];
        }>((r, a) => {
            r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
            return r;
        }, {});
        statusesSortedByPlatoonThenID[platoon] = temp;
    });

    const statusesSortedByPersonnelID = statuses.reduce<{
        [key: string]: StatusPersonnel[];
    }>((r, a) => {
        r[a.personnel_ID] = [...(r[a.personnel_ID] || []), a];
        return r;
    }, {});

    const data = {
        sortedByPlatoon,
        
        numbers: {
            total: personnel.length,
            commitments,
            numberOfMAsInCamp,
            platoonNumbers,
            off: Object.keys(sortedByOff).length,
            leave: Object.keys(sortedByLeave).length,
            attc: Object.keys(sortedByAttc).length,
            course: Object.keys(sortedByCourse).length,
            ma: Object.keys(sortedByMa).length,
            others: Object.keys(sortedByOthers).length,
            status: Object.keys(statusesSortedByPersonnelID).length,
        },

        statusesSortedByPersonnelID,

        offSortedByPlatoonThenID,
        leaveSortedByPlatoonThenID,
        attcSortedByPlatoonThenID,
        courseSortedByPlatoonThenID,
        maSortedByPlatoonThenID,
        othersSortedByPlatoonThenID,
        statusesSortedByPlatoonThenID,
    };
    res.json(data);
}
