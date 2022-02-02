import {
    Flex,
    InputGroup,
    InputLeftAddon,
    Box,
    Checkbox,
    Collapse,
} from "@chakra-ui/react";
import { Select, GroupBase, OptionBase } from "chakra-react-select";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { StatusData } from "../../../pages/api/personnel/manage/status";
import CustomStatusDateRangePicker from "../../Dates/CustomStatusDateRangePicker";
import SearchInput from "./SearchInput";
interface StatusOption extends OptionBase {
    label: string;
    value: string;
}
const StatusInputs: React.FC<{
    data: StatusData;
    selectedDate: Date;
    setSearch: Dispatch<SetStateAction<string>>;
}> = ({ data, selectedDate, setSearch }) => {
    // const [perm, setPerm] = useState(false);

    const { register, watch, setValue, control } = useFormContext();
    const watchCheckbox = watch("status-perm") // todo- this is causing parent rerenders, can we fix it?
    // console.log({watchCheckbox})
    return (
        <>
            <Flex>
                <InputGroup size="sm" mr={3}>
                    <InputLeftAddon children="Status" />
                    <Box w="100%">
                        <Controller
                            name="status-selected"
                            control={control}
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
                                    options={data.formattedStatusList}
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
                    {...register("status-perm")}
                    colorScheme='teal'
                >
                    Perm
                </Checkbox>
            </Flex>

            <Collapse in={!watchCheckbox}>
                <Box mt={2}>
                    <CustomStatusDateRangePicker
                        startLeftAdorn="Start"
                        startPlaceholder="Status start date"
                        endLeftAdorn="End"
                        endPlaceholder="Status end date"
                        defaultValues={[selectedDate, selectedDate]}
                    />
                </Box>
            </Collapse>

            <SearchInput setSearch={setSearch} />
        </>
    );
};

export default StatusInputs;
