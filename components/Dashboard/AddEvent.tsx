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
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { FieldValues, useFormContext, UseFormReturn } from "react-hook-form";
import CustomDateRangePicker from "../Dates/CustomDateRangePicker";
import CustomDateTimePicker from "../Dates/CustomDateTimePicker";

import Assignments from "../../config/assignments.json";
import { HighlightedDay } from "../../types/types";

export const AddLeave: React.FC<{
    personnel_ID: number;
    data?: {
        reason: string;
        date: [Date, Date];
        "start-time": "AM" | "PM";
        "end-time": "AM" | "PM";
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();

    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
                Add new leave
            </Text>

            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="leave"
                startLeftAdorn="Start"
                startPlaceholder="Leave start date"
                endLeftAdorn="End"
                endPlaceholder="Leave end date"
                renderSelects={true}

                defaultValues={data?.date}
                defaultStartTime={data?.["start-time"]}
                defaultEndTime={data?.["end-time"]}
            />

            <InputGroup size="sm">
                <InputLeftAddon children="Reason" />
                <Input
                    placeholder="Reason for leave"
                    defaultValue={data?.reason}

                    {...register(`${personnel_ID}-leave-reason`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const AddOff: React.FC<{
    personnel_ID: number;
    data?: {
        reason: string;
        date: [Date, Date];
        "start-time": "AM" | "PM";
        "end-time": "AM" | "PM";
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();

    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
                Add new off
            </Text>

            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="off"
                startLeftAdorn="Start"
                startPlaceholder="Off start date"
                endLeftAdorn="End"
                endPlaceholder="Off end date"
                renderSelects={true}

                defaultValues={data?.date}
                defaultStartTime={data?.["start-time"]}
                defaultEndTime={data?.["end-time"]}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Reason" />
                <Input
                    defaultValue={data?.reason}
                    placeholder="Reason for off"
                    {...register(`${personnel_ID}-off-reason`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const AddAttC: React.FC<{
    personnel_ID: number;
    data?: {
        reason: string;
        date: [Date, Date];
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
                Add new AttC
            </Text>

            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="attc"
                startLeftAdorn="Start"
                startPlaceholder="AttC start date"
                endLeftAdorn="End"
                endPlaceholder="AttC end date"
                renderSelects={false}

                defaultValues={data?.date}
                
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Reason" />
                <Input
                    placeholder="Reason for AttC"
                    defaultValue={data?.reason}
                    
                    {...register(`${personnel_ID}-attc-reason`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const AddCourse: React.FC<{
    personnel_ID: number;
    data?: {
        name: string;
        date: [Date, Date];
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
                Add new course
            </Text>

            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="course"
                startLeftAdorn="Start"
                startPlaceholder="Course start date"
                endLeftAdorn="End"
                endPlaceholder="Course end date"
                renderSelects={false}

                defaultValues={data?.date}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input
                    placeholder="Name of Course"
                    defaultValue={data?.name}

                    {...register(`${personnel_ID}-course-name`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const AddMA: React.FC<{
    personnel_ID: number;
    data?: {
        name: string;
        location: string;
        incamp: boolean;
        "date-time": Date;
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
                Add new Medical Appointment
            </Text>

            <CustomDateTimePicker
                personnel_ID={personnel_ID}
                type="ma"
                leftAdorn="Date"
                placeholder="Medical appointment date and time"

                defaultValue={data?.["date-time"]}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input
                    defaultValue={data?.name}
                    placeholder="Name of Medical Appointment"
                    {...register(`${personnel_ID}-ma-name`)}
                />
            </InputGroup>
            <InputGroup size="sm">
                <InputLeftAddon children="Location" />
                <Input
                    defaultValue={data?.location}
                    placeholder="Location of Medical Appointment"
                    {...register(`${personnel_ID}-ma-location`)}
                />
                <InputRightAddon w="6rem" />
                <InputRightElement w="6rem">
                    <Checkbox
                        defaultChecked={data?.incamp}
                        size="sm"
                        {...register(`${personnel_ID}-ma-incamp`)}
                    >
                        In camp
                    </Checkbox>
                </InputRightElement>
            </InputGroup>
        </SimpleGrid>
    );
};

export const AddOthers: React.FC<{
    personnel_ID: number;
    data?: {
        name: string;
        incamp: boolean;
        date: [Date, Date];
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
                Add new other Appointment
            </Text>

            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="others"
                startLeftAdorn="Start"
                startPlaceholder="Other appointment's start date"
                endLeftAdorn="End"
                endPlaceholder="Other appointment's end date"
                renderSelects={false}

                defaultValues={data?.date}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input
                    defaultValue={data?.name}
                    placeholder="Other appointment name"
                    {...register(`${personnel_ID}-others-name`)}
                />
                <InputRightAddon w="10rem" />
                <InputRightElement w="10rem">
                    <Checkbox
                        defaultChecked={data?.incamp}
                        size="sm"
                        {...register(`${personnel_ID}-others-incamp`)}
                    >
                        Include in strength
                    </Checkbox>
                </InputRightElement>
            </InputGroup>
        </SimpleGrid>
    );
};
