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

export const AddedLeaveOrOff: React.FC<{
    data: {
        reason: string;
        date: [string, string];
        "start-time": "AM" | "PM";
        "end-time": "AM" | "PM";
        days: number;
    };
}> = ({ data }) => {
    const convertedDate = data.date.map((date) => new Date(date));
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text>{data.reason || "Unspecified reason"}</Text>
            <Text fontWeight="light">
                {format(convertedDate[0], Assignments.dateformat)} (
                {data["start-time"]}) -{" "}
                {format(convertedDate[1], Assignments.dateformat)} (
                {data["end-time"]}) ({data.days} days)
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
                {differenceInCalendarDays(convertedDate[0], convertedDate[1])}{" "}
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
        "date-time": string;
    };
}> = ({ data }) => {
    const convertedDate = new Date(data["date-time"]);

    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text>
                {data.name || "Unspecified name"} @{" "}
                {data.location || "Unspecified location"}
            </Text>
            <Text fontWeight="light">
                {format(convertedDate, Assignments.datetimeformat)} (
                {data.incamp ? "In Camp" : "Out of Camp"})
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
                {differenceInCalendarDays(convertedDate[0], convertedDate[1])}{" "}
                days) ({data.incamp ? "In Camp" : "Out of Camp"})
            </Text>
        </SimpleGrid>
    );
};
