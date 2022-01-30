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

export const ConfirmLeave: React.FC<{
    personnel_ID: number;
    data: {
        reason: string;
        date: [Date, Date];
        "start-time": "AM" | "PM";
        "end-time": "AM" | "PM";
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="leave"
                startLeftAdorn="Start"
                startPlaceholder="Leave start date"
                endLeftAdorn="End"
                endPlaceholder="Leave end date"
                renderSelects={true}
                defaultValues={data.date}
                defaultStartTime={data["start-time"]}
                defaultEndTime={data["end-time"]}
            />

            <InputGroup size="sm">
                <InputLeftAddon children="Reason" />
                <Input
                    placeholder="Reason for leave"
                    defaultValue={data.reason}
                    {...register(`${personnel_ID}-leave-reason`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const ConfirmOff: React.FC<{
    personnel_ID: number;
    data: {
        reason: string;
        date: [Date, Date];
        "start-time": "AM" | "PM";
        "end-time": "AM" | "PM";
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="off"
                startLeftAdorn="Start"
                startPlaceholder="Off start date"
                endLeftAdorn="End"
                endPlaceholder="Off end date"
                renderSelects={true}
                defaultValues={data.date}
                defaultStartTime={data["start-time"]}
                defaultEndTime={data["end-time"]}
            />

            <InputGroup size="sm">
                <InputLeftAddon children="Reason" />
                <Input
                    placeholder="Reason for off"
                    defaultValue={data.reason}
                    {...register(`${personnel_ID}-off-reason`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const ConfirmAttC: React.FC<{
    personnel_ID: number;
    data: {
        reason: string;
        date: [Date, Date];
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="attc"
                startLeftAdorn="Start"
                startPlaceholder="AttC start date"
                endLeftAdorn="End"
                endPlaceholder="AttC end date"
                renderSelects={false}
                defaultValues={data.date}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Reason" />
                <Input
                    placeholder="Reason for AttC"
                    defaultValue={data.reason}
                    {...register(`${personnel_ID}-attc-reason`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const ConfirmCourse: React.FC<{
    personnel_ID: number;
    data: {
        name: string;
        date: [Date, Date];
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="course"
                startLeftAdorn="Start"
                startPlaceholder="Course start date"
                endLeftAdorn="End"
                endPlaceholder="Course end date"
                renderSelects={false}
                defaultValues={data.date}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input
                    placeholder="Name of Course"
                    defaultValue={data.name}
                    {...register(`${personnel_ID}-course-name`)}
                />
            </InputGroup>
        </SimpleGrid>
    );
};

export const ConfirmMA: React.FC<{
    personnel_ID: number;
    data: {
        name: string;
        location: string;
        incamp: boolean;
        "date-time": Date;
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <CustomDateTimePicker
                personnel_ID={personnel_ID}
                type="ma"
                leftAdorn="Date"
                placeholder="Medical appointment date and time"
                defaultValue={data["date-time"]}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input
                    defaultValue={data.name}
                    placeholder="Name of Medical Appointment"
                    {...register(`${personnel_ID}-ma-name`)}
                />
            </InputGroup>
            <InputGroup size="sm">
                <InputLeftAddon children="Location" />
                <Input
                    defaultValue={data.location}
                    placeholder="Location of Medical Appointment"
                    {...register(`${personnel_ID}-ma-location`)}
                />
                <InputRightAddon w="6rem" />
                <InputRightElement w="6rem">
                    <Checkbox
                        size="sm"
                        defaultChecked={data.incamp}
                        {...register(`${personnel_ID}-ma-incamp`)}
                    >
                        In camp
                    </Checkbox>
                </InputRightElement>
            </InputGroup>
        </SimpleGrid>
    );
};

export const ConfirmOthers: React.FC<{
    personnel_ID: number;
    data: {
        name: string;
        incamp: boolean;
        date: [Date, Date];
    };
}> = ({ personnel_ID, data }) => {
    const { register } = useFormContext();
    return (
        <SimpleGrid p={2} columns={1} spacing={2}>
            <CustomDateRangePicker
                personnel_ID={personnel_ID}
                type="others"
                startLeftAdorn="Start"
                startPlaceholder="Other appointment's start date"
                endLeftAdorn="End"
                endPlaceholder="Other appointment's end date"
                renderSelects={false}
                defaultValues={data.date}
            />
            <InputGroup size="sm">
                <InputLeftAddon children="Name" />
                <Input
                    defaultValue={data.name}
                    placeholder="Other appointment name"
                    {...register(`${personnel_ID}-others-name`)}
                />
                <InputRightAddon w="10rem" />
                <InputRightElement w="10rem">
                    <Checkbox
                        size="sm"
                        defaultChecked={data.incamp}
                        {...register(`${personnel_ID}-others-incamp`)}
                    >
                        Include in strength
                    </Checkbox>
                </InputRightElement>
            </InputGroup>
        </SimpleGrid>
    );
};
