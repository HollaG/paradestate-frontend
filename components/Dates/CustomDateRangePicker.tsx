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
} from "@chakra-ui/react";

import MobileDateRangePicker  from "@mui/lab/MobileDateRangePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import Assignments from '../../config/assignments.json'
const AMPMSelection: React.FC<{
    personnel_ID: number;
    type: string;
    identifier: string;
}> = ({ personnel_ID, type, identifier }) => {
    const { register } = useFormContext();
    return (
        <Select
            size="sm"
            w="28"
            {...register(`${personnel_ID}-${type}-${identifier}-time`)}
            defaultValue={type === "start" ? "AM" : "PM"}
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
}> = ({
    personnel_ID,
    type,
    startLeftAdorn,
    startPlaceholder,
    endLeftAdorn,
    endPlaceholder,
    renderSelects,
}) => {
    const { register, control } = useFormContext();
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
                name={`${personnel_ID}-${type}-date`}
                control={control}
                render={(
                    { field: { onChange, value = [null, null] } } // Value has to be set to an array of length 2 for the start value and end value
                ) => (
                    <MobileDateRangePicker
                        value={value}
                        onChange={onChange}
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

                                    {renderSelects && (
                                        <AMPMSelection
                                            type={type}
                                            identifier="start"
                                            personnel_ID={personnel_ID}
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
                                        />
                                    </InputGroup>

                                    {renderSelects && (
                                        <AMPMSelection
                                            type={type}
                                            identifier="end"
                                            personnel_ID={personnel_ID}
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
