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

import DateTimePicker from "@mui/lab/DateTimePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { MobileDateTimePicker } from "@mui/lab";

import Assignments from '../../config/assignments.json'

const CustomDateTimePicker: React.FC<{
    personnel_ID: number;

    type: string;
    leftAdorn: string;
    placeholder: string;
 
    defaultValue?: string
}> = ({
    personnel_ID,
    type,
    leftAdorn,
    placeholder,
    
    defaultValue = new Date()
}) => {
    const { register, control } = useFormContext();
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
                name={`${personnel_ID}-${type}-date-time`}
                control={control}
                defaultValue={defaultValue}
                render={(
                    { field: { onChange, value }  } // Value has to be set to an array of length 2 for the start value and end value
                ) => (
                    <MobileDateTimePicker
                        value={value}
                        onChange={onChange}
                        inputFormat={Assignments.datetimeformat}
                        renderInput={(props) => (
                            <InputGroup size="sm" flexGrow={1}>
                                <InputLeftAddon
                                    w="14"
                                    children={leftAdorn}
                                />
                                <Input
                                    size="sm"
                                    ref={
                                        props.inputRef
                                    }
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
