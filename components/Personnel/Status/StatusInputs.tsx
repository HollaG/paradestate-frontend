import {
    Flex,
    InputGroup,
    InputLeftAddon,
    Box,
    Checkbox,
    Collapse,
    Text,
    useToast,
} from "@chakra-ui/react";
import { Select, GroupBase, OptionBase } from "chakra-react-select";
import React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { StatusData } from "../../../pages/api/personnel/manage/status";
import CustomStatusDateRangePicker from "../../Dates/CustomStatusDateRangePicker";
import SearchInput from "./SearchInput";
interface StatusOption extends OptionBase {
    label: string;
    value: string;
}
const StatusInputs: React.FC<{
    // data: StatusData;
    selectedDate: [Date, Date];
    formattedStatusList: StatusOption[];
    personnel_ID: number;
    num: number;
    defaultStatuses?: StatusOption[],
    defaultPerm?: boolean;
    // setSearch: Dispatch<SetStateAction<string>>;
}> = ({ formattedStatusList, selectedDate = [new Date(), new Date()], personnel_ID, num, defaultStatuses, defaultPerm = false }) => {
    // const [perm, setPerm] = useState(false);
    console.log({formattedStatusList, defaultStatuses})
    const {
        register,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useFormContext();
    // const watchCheckbox = watch(`${personnel_ID}-status-perm`); // todo- this is causing parent rerenders, can we fix it?
    const watchCheckbox = useWatch({
        control,
        name: `${personnel_ID}-${num}-status-perm`,
        defaultValue: defaultPerm,
    });
    const toast = useToast();
    useEffect(() => {
        if (Object.keys(errors).length) {
            // window.scrollTo({
            //     top: 0,
            //     behavior: "smooth",
            // });
            console.log({ errors });
            toast({
                title: "Error",
                description: "Please fill out all fields",
                status: "error",
                isClosable: true,
            });
        }
    }, [errors]);

    // console.log({watchCheckbox})
    return (
        <>
            <Flex mb={2}>
                <InputGroup size="sm" mr={3}>
                    <InputLeftAddon children="Status" />
                    <Box w="100%">
                        <Controller
                            name={`${personnel_ID}-${num}-status-selected`}
                            control={control}
                            defaultValue={defaultStatuses}
                            rules={{
                                required: true,
                            }}
                            render={({ field: { onChange, value = [] } }) => (
                                <Select<
                                    StatusOption,
                                    true,
                                    GroupBase<StatusOption>
                                >
                                    isMulti
                                    options={formattedStatusList}
                                    placeholder="Select a status"
                                    closeMenuOnSelect={false}
                                    size="sm"
                                    value={value}
                                    onChange={onChange}
                                />
                            )}
                        />
                    </Box>
                </InputGroup>
                <Checkbox
                    size="sm"
                    flexGrow={1}
                    // isChecked={perm}
                    // onChange={(e) => setPerm(e.target.checked)}
                    {...register(`${personnel_ID}-${num}-status-perm`)}
                    colorScheme="teal"
                    defaultChecked={defaultPerm}
                >
                    Perm
                </Checkbox>
            </Flex>
            {errors[`${personnel_ID}-${num}-status-selected`] && (
                <Text
                    ml={2}
                    fontSize="xs"
                    color="red.500"
                    fontWeight="semibold"
                >
                    {" "}
                    Please select at least one status{" "}
                </Text>
            )}
            <Collapse in={!watchCheckbox} animateOpacity>
                <Box mb={2}>
                    <CustomStatusDateRangePicker
                        startLeftAdorn="Start"
                        startPlaceholder="Status start date"
                        endLeftAdorn="End"
                        endPlaceholder="Status end date"
                        defaultValues={selectedDate}
                        personnel_ID={personnel_ID}
                        num={num}
                    />
                </Box>
            </Collapse>

            {/* <SearchInput setSearch={setSearch} /> */}
        </>
    );
};

export default React.memo(StatusInputs);
