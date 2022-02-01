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

export const AddedLeaveOrOff: React.FC<{
    data: {
        reason: string;
        date: [string, string];
        "start-time": "AM" | "PM";
        "end-time": "AM" | "PM";
        days: number;
    };
}> = ({ data }) => {
    console.log({data})
    const convertedDate = data.date.map((date) => new Date(date));
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text>{data.reason || "Unspecified reason"}</Text>
            <Text fontWeight="light">
                {format(convertedDate[0], Assignments.dateformat)} (
                {data["start-time"]}) -{" "}
                {format(convertedDate[1], Assignments.dateformat)} (
                {data["end-time"]}) ({calculateOutOfOfficeDuration(data)} days)
            </Text>
        </SimpleGrid>
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
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text>{string}</Text>
            <Text fontWeight="light">
                {format(convertedDate[0], Assignments.dateformat)} -{" "}
                {format(convertedDate[1], Assignments.dateformat)} (
                {differenceInCalendarDays(convertedDate[1], convertedDate[0])}{" "}
                days)
            </Text>
        </SimpleGrid>
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
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text>
                {data.name || "Unspecified name"} @{" "}
                {data.location || "Unspecified location"}
            </Text>
            <Text fontWeight="light">
                {convertedDate} ({data.incamp ? "In Camp" : "Out of Camp"})
            </Text>
        </SimpleGrid>
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
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text>{data.name || "Unspecified name"}</Text>
            <Text fontWeight="light">
                {format(convertedDate[0], Assignments.dateformat)} -{" "}
                {format(convertedDate[1], Assignments.dateformat)} (
                {differenceInCalendarDays(convertedDate[1], convertedDate[0])}{" "}
                days) ({data.incamp ? "In Camp" : "Out of Camp"})
            </Text>
        </SimpleGrid>
    );
};
