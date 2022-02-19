import {
    Box,
    Checkbox,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    InputRightElement,
    SimpleGrid,
    Text,
} from "@chakra-ui/react";
import { DateRange } from "@mui/lab/DateRangePicker";
import { useState } from "react";
import { FieldValues, useFormContext, UseFormReturn } from "react-hook-form";
import CustomDateRangePicker from "../Dates/CustomDateRangePicker";
import CustomDateTimePicker from "../Dates/CustomDateTimePicker";

import Assignments from "../../config/assignments.json";
import { differenceInCalendarDays, format } from "date-fns";
import { parse } from "path/posix";
import { calculateOutOfOfficeDuration } from "../../lib/custom";
import EventBasicDetails from "../Common/EventBasicDetails";

export const AddedLeaveOrOff: React.FC<{
    data: {
        reason: string;
        date: [string, string];
        "start-time": "AM" | "PM";
        "end-time": "AM" | "PM";
        days?: number;
    };
}> = ({ data }) => {
    const convertedDate = data.date.map((date) => new Date(date));
    return (
        <EventBasicDetails
            top={data.reason || "Unspecified reason"}
            bottom={`${format(convertedDate[0], Assignments.dateformat)} 
            (${data["start-time"]}) -
            ${format(convertedDate[1], Assignments.dateformat)} 
            (${data["end-time"]}) (${calculateOutOfOfficeDuration(data)} days)`}
        />
    );
};

export const AddedAttCOrCourse: React.FC<{
    data: {
        reason?: string;
        name?: string;
        date: [string, string];
    };
}> = ({ data }) => {
    const convertedDate = data.date.map((date) => new Date(date));

    let string = "";
    if (data.reason) string = data.reason;
    else string = "Unspecified reason";
    if (data.name) string = data.name;
    else string = "Unspecified name";
    return (
        <EventBasicDetails
            top={string}
            bottom={`${format(convertedDate[0], Assignments.dateformat)} -
            ${format(convertedDate[1], Assignments.dateformat)} 
            (${
                differenceInCalendarDays(convertedDate[1], convertedDate[0]) + 1
            } days)`}
        />
    );
};

export const AddedMA: React.FC<{
    data: {
        name: string;
        location: string;
        incamp: boolean;
        "date-time"?: string;
        "date-time-formatted"?: string;
    };
}> = ({ data }) => {
    const convertedDate =
        data["date-time-formatted"] ||
        format(new Date(data["date-time"] || ""), Assignments.datetimeformat);

    return (
        <EventBasicDetails
            top={`${data.name || "Unspecified name"} @
        ${data.location || "Unspecified location"}`}
            bottom={`${convertedDate} (${
                data.incamp ? "In Camp" : "Out of Camp"
            })`}
        />
    );
};

export const AddedOthers: React.FC<{
    data: {
        name: string;
        incamp: boolean;
        date: [string, string];
    };
}> = ({ data }) => {
    const convertedDate = data.date.map((date) => new Date(date));

    return (
        <EventBasicDetails
            top={`${data.name || "Unspecified name"}`}
            bottom={`${format(convertedDate[0], Assignments.dateformat)} -
            ${format(convertedDate[1], Assignments.dateformat)} 
            (${differenceInCalendarDays(convertedDate[1], convertedDate[0]) + 1}
            days) (${data.incamp ? "In Camp" : "Out of Camp"})`}
        />
    );
};
