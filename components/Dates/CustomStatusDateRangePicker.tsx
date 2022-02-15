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

import MobileDateRangePicker from "@mui/lab/MobileDateRangePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import Assignments from "../../config/assignments.json";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { isBefore, isEqual, subMonths } from "date-fns";
import CalendarPickerSkeleton from "@mui/lab/CalendarPickerSkeleton";
import PickersDay from "@mui/lab/PickersDay";
// import Badge from "@mui/material/Badge";
import { DateRangePickerDay, DateRangePickerDayProps } from "@mui/lab";
import { HighlightedDay } from "../../types/types";

const CustomStatusDateRangePicker: React.FC<{
    startLeftAdorn: string;
    startPlaceholder: string;
    endLeftAdorn: string;
    endPlaceholder: string;
    personnel_ID: number;
    defaultValues?: [Date, Date];
    num?: number,
    row_ID?: string
}> = ({
    startLeftAdorn,
    startPlaceholder,
    endLeftAdorn,
    endPlaceholder,
    personnel_ID,
    defaultValues,
    num,
    row_ID
    // isLoading = false,
    // handleMonthChange = () => {},
    // highlightedDays = [],
}) => {
    const { register, control, setValue, getValues } = useFormContext(); // todo change
    const currentDate = parse(
        format(new Date(), Assignments.dateformat),
        Assignments.dateformat,
        new Date()
    ); // TODO: Change this to the selected date

    const validateStartBeforeEnd = (dates: [Date, Date]) => {
        return isBefore(dates[0], dates[1]) || isEqual(dates[0], dates[1]);
    };

    const [isLoading, setIsLoading] = useState(true);
    const [highlightedDays, setHighlightedDays] = useState<HighlightedDay[]>(
        []
    );
    // const fetchDisabledDates =  (date: Date) => {
    //     const formattedDate = format(date, Assignments.mysqldateformat);
    //     const url = `/api/dashboard/activeEvents?personnel_ID=${personnel_ID}&type=${type}&date=${formattedDate}`;
    //     console.log({ url });
    //     fetch(url)
    //         .then((res) => res.json())
    //         .then((data: HighlightedDay[]) => {
    //             setIsLoading(false);
    //             setHighlightedDays(data);
    //         });
    // };

    // const fetchDisabledDates = useCallback((date: Date) => {
    // const formattedDate = format(date, Assignments.mysqldateformat);
    // const url = `/api/dashboard/activeEvents?personnel_ID=${personnel_ID}&type=${type}&date=${formattedDate}`;
    // console.log({ url });
    // fetch(url)
    //     .then((res) => res.json())
    //     .then((data: HighlightedDay[]) => {
    //         setIsLoading(false);
    //         setHighlightedDays(data);
    //     });
    // }, [personnel_ID, type])

    // const handleMonthChange = (date: Date) => {
    //     setIsLoading(true);
    //     fetchDisabledDates(date);
    // };

    // const memoized = useMemo(() => fetchDisabledDates, [fetchDisabledDates]);
    // useEffect(() => {
    //     memoized(new Date());
    // }, [memoized, setIsLoading]);

    // const disableDateHandler = (date: Date) => {
    //     console.log("running",);
    //     const highlightedDay = highlightedDays.find(
    //         (highlightedDay) => highlightedDay.day === date.getDate()
    //     );

    //     return Boolean(highlightedDay && highlightedDay.disabled);
    // };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
                name={row_ID ? `${row_ID}-status-date` : `${personnel_ID}-${num}-status-date`}
                control={control}
                defaultValue={defaultValues || [currentDate, currentDate]}
                rules={{
                    required: true,
                }}
                render={(
                    {
                        field: {
                            onChange,
                            value = defaultValues || [currentDate, currentDate],
                        },
                    } // Value has to be set to an array of length 2 for the start value and end value
                ) => (
                    <MobileDateRangePicker
                        minDate={row_ID ? undefined : subMonths(currentDate, 1)}
                        value={value}
                        onChange={(dates: any) =>
                            validateStartBeforeEnd(dates)
                                ? onChange(dates)
                                : value
                        }
                        // onMonthChange={handleMonthChange}
                        // loading={isLoading}
                        // renderLoading={() => <CalendarPickerSkeleton />}
                        // shouldDisableDate={disableDateHandler}
                        // renderDay={(
                        //     date: Date,
                        //     dateRangePickerDayProps: DateRangePickerDayProps<Date>
                        // ) => {
                        //     const highlightedDay = highlightedDays.find(
                        //         (highlightedDay) =>
                        //             highlightedDay.day === date.getDate()
                        //     );
                        //     const isSelected =
                        //         !dateRangePickerDayProps.outsideCurrentMonth &&
                        //         highlightedDay;

                        //     if (isSelected) {
                        //         return (

                        //             <Box
                        //                 sx={{
                        //                     position: "relative",
                        //                 }}
                        //             >
                        //                 {isSelected && (
                        //                     <Badge
                        //                         key={date.getDay()}
                        //                         sx={{
                        //                             position: "absolute",
                        //                             right: " -7px",
                        //                             top: "-3px",
                        //                             transform: " scale(0.8)",
                        //                             zIndex: 100
                        //                         }}
                        //                         colorScheme="teal"
                        //                     >
                        //                         {highlightedDay.badgeText}
                        //                     </Badge>
                        //                 )}
                        //                 <DateRangePickerDay
                        //                     {...dateRangePickerDayProps}
                        //                 />
                        //             </Box>
                        //         );
                        //     } else
                        //         return (
                        //             <DateRangePickerDay
                        //                 {...dateRangePickerDayProps}
                        //             />
                        //         );
                        // }}
                        inputFormat={Assignments.dateformat}
                        renderInput={(startProps, endProps) => (
                            <SimpleGrid
                                spacing={3}
                                columns={[2]}
                                w="100%"
                                minChildWidth={250}
                            >
                                <Flex>
                                    <InputGroup size="sm" flexGrow={1}>
                                        <InputLeftAddon
                                            w="14"
                                            children={startLeftAdorn}
                                        />
                                        <Input
                                            size="sm"
                                            ref={
                                                startProps.inputRef as React.Ref<HTMLInputElement>
                                            }
                                            {...startProps.inputProps}
                                            placeholder={startPlaceholder}
                                        />
                                    </InputGroup>
                                </Flex>

                                {/* <Text> to </Text> */}

                                <Flex>
                                    <InputGroup size="sm">
                                        <InputLeftAddon
                                            w="14"
                                            children={endLeftAdorn}
                                        />
                                        <Input
                                            ref={
                                                endProps.inputRef as React.Ref<HTMLInputElement>
                                            }
                                            {...endProps.inputProps}
                                            placeholder={endPlaceholder}
                                        />
                                    </InputGroup>
                                </Flex>
                            </SimpleGrid>
                        )}
                    />
                )}
            />
        </LocalizationProvider>
        // </ThemeProvider>
    );
};

export default CustomStatusDateRangePicker;
