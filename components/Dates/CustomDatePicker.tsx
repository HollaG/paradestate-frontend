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
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
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

const CustomDatePicker: React.FC<{
    placeholder: string;
    size?: string;
    defaultValue?: Date;
    date: Date,
    setDate: Dispatch<SetStateAction<Date>>
}> = ({ placeholder, size = "sm", defaultValue = new Date(), date, setDate }) => {


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            {/* <Controller
                name={`${personnel_ID}-${type}-date-time`}
                control={control}
                defaultValue={defaultValue}
                render={(
                    { field: { onChange, value } } // Value has to be set to an array of length 2 for the start value and end value
                ) => ( */}
            <MobileDatePicker
                minDate={subMonths(new Date(), 1)}
                value={date}
                onChange={(e) => setDate(e || new Date())}
                inputFormat={Assignments.dateformat}
                showTodayButton
                renderInput={(props) => (
                    <Input
                    textAlign="center"
                        size={size}
                        ref={props.inputRef}
                        {...props.inputProps}
                        placeholder={placeholder}
                    />
                )}
            />
            {/* )}
            /> */}
        </LocalizationProvider>
        // </ThemeProvider>
    );
};

export default CustomDatePicker;
