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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
    CalendarPickerSkeleton,
    MobileDateTimePicker,
    PickersDay,
    PickersDayProps,
} from "@mui/lab";

import Assignments from "../../config/assignments.json";
import { format, subMonths } from "date-fns";
import { HighlightedDay } from "../../types/types";

const CustomDateTimePicker: React.FC<{
    personnel_ID: number;

    type: string;
    leftAdorn: string;
    placeholder: string;

    defaultValue?: Date;
}> = ({
    personnel_ID,
    type,
    leftAdorn,
    placeholder,

    defaultValue = new Date(),
}) => {
    const { register, control } = useFormContext();

    const [isLoading, setIsLoading] = useState(true);
    const [highlightedDays, setHighlightedDays] = useState<HighlightedDay[]>(
        []
    );


    const fetchDisabledDates = useCallback((date: Date) => {
        const formattedDate = format(date, Assignments.mysqldateformat);
        const url = `/api/dashboard/activeEvents?personnel_ID=${personnel_ID}&type=${type}&date=${formattedDate}`;
        console.log({ url });
        fetch(url)
            .then((res) => res.json())
            .then((data: HighlightedDay[]) => {
                setIsLoading(false);
                setHighlightedDays(data);
            });
    }, [personnel_ID, type])

    const handleMonthChange = (date: Date) => {
        setIsLoading(true);
        fetchDisabledDates(date);
    };

    const memoized = useMemo(() => fetchDisabledDates, [fetchDisabledDates]);
    useEffect(() => {
        memoized(new Date());
    }, [memoized, setIsLoading]);

    const disableDateHandler = (date: Date) => {
        console.log("running");
        const highlightedDay = highlightedDays.find(
            (highlightedDay) => highlightedDay.day === date.getDate()
        );

        return Boolean(highlightedDay && highlightedDay.disabled);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
                name={`${personnel_ID}-${type}-date-time`}
                control={control}
                defaultValue={defaultValue}
                render={(
                    { field: { onChange, value } } // Value has to be set to an array of length 2 for the start value and end value
                ) => (
                    <MobileDateTimePicker
                        minDateTime={subMonths(new Date(), 1)}
                        minutesStep={5}
                        value={value}
                        onChange={onChange}
                        inputFormat={Assignments.datetimeformat}
                        onMonthChange={handleMonthChange}
                        loading={isLoading}
                        renderLoading={() => <CalendarPickerSkeleton />}
                        shouldDisableDate={disableDateHandler}
                        renderDay={(
                            day: any,
                            selectedDates: any[],
                            pickersDayProps: PickersDayProps<any>
                        ) => {
                            const highlightedDay = highlightedDays.find(
                                (highlightedDay) =>
                                    highlightedDay.day === day.getDate()
                            );
                            const isSelected =
                                !pickersDayProps.outsideCurrentMonth &&
                                highlightedDay;

                            if (isSelected) {
                                return (
                                    <Box
                                        sx={{
                                            position: "relative",
                                        }}
                                    >
                                        {isSelected && (
                                            <Badge
                                                key={day.getDay()}
                                                sx={{
                                                    position: "absolute",
                                                    right: " -7px",
                                                    top: "-3px",
                                                    transform: " scale(0.8)",
                                                    zIndex: 100

                                                }}
                                                colorScheme="teal"
                                            >
                                                {highlightedDay.badgeText}
                                            </Badge>
                                        )}
                                        <PickersDay {...pickersDayProps} />
                                    </Box>
                                );
                            } else return <PickersDay {...pickersDayProps} />;
                        }}
                        renderInput={(props) => (
                            <InputGroup size="sm" flexGrow={1}>
                                <InputLeftAddon w="14" children={leftAdorn} />
                                <Input
                                    size="sm"
                                    ref={props.inputRef}
                                    {...props.inputProps}
                                    placeholder={placeholder}
                                />
                            </InputGroup>
                        )}
                    />
                )}
            />
        </LocalizationProvider>
        // </ThemeProvider>
    );
};

export default CustomDateTimePicker;
