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
import { Control, Controller, useFormContext } from "react-hook-form";
import Assignments from "../../config/assignments.json";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { isBefore, isEqual, subMonths } from "date-fns";
import CalendarPickerSkeleton from "@mui/lab/CalendarPickerSkeleton";
import PickersDay from "@mui/lab/PickersDay";
// import Badge from "@mui/material/Badge";
import { DateRangePickerDay, DateRangePickerDayProps } from "@mui/lab";
import { HighlightedDay } from "../../types/types";
const AMPMSelection: React.FC<{
    personnel_ID: number;
    type: string;
    identifier: string;

    defaultTime: "AM" | "PM";

    row_ID? : string
}> = ({ personnel_ID, type, identifier, defaultTime, row_ID }) => {
    const { register } = useFormContext();
    return (
        <Select
            size="sm"
            w="28"
            {...register(row_ID ? `${row_ID}-${type}-${identifier}-time` : `${personnel_ID}-${type}-${identifier}-time`)}
            defaultValue={defaultTime}
        >
            <option> AM </option>
            <option> PM </option>
        </Select>
    );
};

const CustomDateRangePicker: React.FC<{
    personnel_ID: number;

    type: string;
    startLeftAdorn: string;
    startPlaceholder: string;
    endLeftAdorn: string;
    endPlaceholder: string;

    renderSelects: boolean;

    defaultValues?: [Date, Date];
    defaultStartTime?: "AM" | "PM";
    defaultEndTime?: "AM" | "PM";

    row_ID? : string
    control?: Control<any, any>
    // isLoading?: boolean;
    // handleMonthChange?: (date: Date) => void;
    // highlightedDays?: HighlightedDay[];
}> = ({
    personnel_ID,
    type,
    startLeftAdorn,
    startPlaceholder,
    endLeftAdorn,
    endPlaceholder,
    renderSelects,

    defaultValues,
    defaultStartTime = "AM",
    defaultEndTime = "PM",
    control,
    row_ID
    // isLoading = false,
    // handleMonthChange = () => {},
    // highlightedDays = [],
}) => {
    const methods = useFormContext();
    if (!control) control = methods.control
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
  

    const fetchDisabledDates = useCallback((date: Date) => {
        const formattedDate = format(date, Assignments.mysqldateformat);
        const url = `/api/dashboard/activeEvents?personnel_ID=${personnel_ID}&type=${type}&date=${formattedDate}`;
        // console.log({ url });
        fetch(url)
            .then((res) => res.json())
            .then((data: HighlightedDay[]) => {                
                setIsLoading(false);
                setHighlightedDays(data);
            });
    }, [personnel_ID, type])

    const handleMonthChange = (date: Date) => {
        console.log('handle month change', date)
        setIsLoading(true);
        fetchDisabledDates(date);
    };

    const memoized = useMemo(() => fetchDisabledDates, [fetchDisabledDates]);
    useEffect(() => {
        memoized(defaultValues?.length ? new Date(defaultValues[0]) : new Date());
    }, [memoized, setIsLoading, defaultValues]);

    const disableDateHandler = (date: Date) => {
        // console.log("running",);
        const highlightedDay = highlightedDays.find(
            (highlightedDay) => highlightedDay.day === date.getDate()
        );

        return Boolean(highlightedDay && highlightedDay.disabled);
    };


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
                name={row_ID ? `${row_ID}-${type}-date` : `${personnel_ID}-${type}-date`}
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
                        onMonthChange={handleMonthChange}
                        loading={isLoading}
                        renderLoading={() => <CalendarPickerSkeleton />}
                        shouldDisableDate={disableDateHandler}
                        renderDay={(
                            date: Date,
                            dateRangePickerDayProps: DateRangePickerDayProps<Date>
                        ) => {
                            const highlightedDay = highlightedDays.find(
                                (highlightedDay) =>
                                    highlightedDay.day === date.getDate()
                            );
                            const isSelected =
                                !dateRangePickerDayProps.outsideCurrentMonth &&
                                highlightedDay;

                            if (isSelected) {
                                return (
                                    
                                    <Box
                                        sx={{
                                            position: "relative",
                                        }}
                                        key={date.getDay()}
                                    >
                                        {isSelected && (
                                            <Badge
                                                
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
                                        <DateRangePickerDay
                                            {...dateRangePickerDayProps}                                            
                                        />
                                    </Box>
                                );
                            } else
                                return (
                                    <DateRangePickerDay
                                        {...dateRangePickerDayProps}
                                    />
                                );
                        }}
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
                                            readOnly
                                        />
                                    </InputGroup>

                                    {renderSelects && (
                                        <AMPMSelection
                                            type={type}
                                            identifier="start"
                                            personnel_ID={personnel_ID}
                                            defaultTime={defaultStartTime}
                                            row_ID={row_ID}
                                        />
                                    )}
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
                                            readOnly

                                        />
                                    </InputGroup>

                                    {renderSelects && (
                                        <AMPMSelection
                                            type={type}
                                            identifier="end"
                                            personnel_ID={personnel_ID}
                                            defaultTime={defaultEndTime}
                                            row_ID={row_ID}

                                        />
                                    )}
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

export default CustomDateRangePicker;
