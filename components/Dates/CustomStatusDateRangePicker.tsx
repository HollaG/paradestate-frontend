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
import { Control, Controller, useForm, useFormContext } from "react-hook-form";
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
    personnel_ID?: number;
    defaultValues?: [Date, Date];
    num?: number,
    row_ID?: string,
    control?: Control<any, any>,
    inputName?: string
}> = ({
    startLeftAdorn,
    startPlaceholder,
    endLeftAdorn,
    endPlaceholder,
    personnel_ID,
    defaultValues,
    num,
    row_ID,
    control,
    inputName
    // isLoading = false,
    // handleMonthChange = () => {},
    // highlightedDays = [],
}) => {

    const methods = useFormContext(); // todo change
    if (!control) control = methods.control;
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
   
    if (!inputName) inputName = row_ID ? `${row_ID}-status-date` : `${personnel_ID}-${num}-status-date`
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
                name={inputName}
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
                        // minDate={row_ID ? undefined : subMonths(currentDate, 1)}
                        value={value}
                        onChange={(dates: any) =>
                            validateStartBeforeEnd(dates)
                                ? onChange(dates)
                                : value
                        }
                        
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
