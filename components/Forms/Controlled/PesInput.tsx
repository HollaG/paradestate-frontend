import { Box, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { OptionBase, Select } from "chakra-react-select";
import { Control, FieldValues, Controller } from "react-hook-form";
import ErrorText from "../ErrorText";
import Assignments from '../../../config/assignments.json'

interface ServiceStatusOption extends OptionBase {
    label: string;
    value: string;
}
[];
const PesInput: React.FC<{
    control: Control<FieldValues, object>;
    errors: {
        [x: string]: any;
    };
}> = ({ control, errors }) => {
    return (
        <Box>
            <InputGroup size="sm">
                <InputLeftAddon children="PES" />
                <Box w="100%">
                    <Controller
                        name="pes"
                        control={control}
                        rules={{
                            required: true,
                        }}
                        render={({ field: { onChange, value = [] } }) => (
                            <Select<ServiceStatusOption, false>
                                id="pes"
                                name="pes"
                                options={Assignments.pes.map((pes) => ({
                                    label: pes,
                                    value: pes,
                                }))}
                                placeholder="Select PES"
                                closeMenuOnSelect={true}
                                size="sm"
                                isSearchable={false}
                                value={value}
                                onChange={onChange}
                            />
                        )}
                    />
                </Box>
            </InputGroup>
            {errors?.pes?.type === "required" && (
                <ErrorText text="Please select a PES!" />
            )}
        </Box>
    );
};

export default PesInput;
