import {
    Box,
    Button,
    Flex,
    HStack,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Select,
    Text,
    SimpleGrid,
    WrapItem,
    Badge,
} from "@chakra-ui/react";

import DateTimePicker from "@mui/lab/DateTimePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Control, Controller, FieldValues, useFormContext } from "react-hook-form";
import {
    CalendarPickerSkeleton,
    MobileDatePicker,
    MobileDateTimePicker,
    PickersDay,
    PickersDayProps,
} from "@mui/lab";

import Assignments from "../../config/assignments.json";
import { format, subMonths } from "date-fns";
import { HighlightedDay } from "../../types/types";

const CustomControlledDatePicker: React.FC<{
    placeholder: string;
    size?: string;
    defaultValue?: Date;

    name: string;

    control: Control<FieldValues, object>;
}> = ({
    placeholder,
    size = "sm",
    defaultValue = new Date(),
    name,
    control,
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                rules={{
                    required: true,
                }}
                render={(
                    { field: { onChange, value } } // Value has to be set to an array of length 2 for the start value and end value
                ) => (
                    <MobileDatePicker
                       
                        value={value}
                        onChange={onChange}
                        inputFormat={Assignments.dateformat}
                        showTodayButton
                        renderInput={(props) => (
                            <Input
                                // textAlign="center"
                                size={size}
                                ref={props.inputRef}
                                {...props.inputProps}
                                placeholder={placeholder}
                            />
                        )}
                    />
                )}
            />
        </LocalizationProvider>
        // </ThemeProvider>
    );
};

export default CustomControlledDatePicker;
