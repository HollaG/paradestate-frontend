import { Box, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { OptionBase, Select } from "chakra-react-select";
import { Control, FieldValues, Controller } from "react-hook-form";
import ErrorText from "../../ErrorText";
import Assignments from "../../../../config/assignments.json";



interface ServiceStatusOption extends OptionBase {
    label: string;
    value: string;
}
[];
const ActivityTypeInput: React.FC<{
    control: Control<FieldValues, object>;
    errors: {
        [x: string]: any;
    };
}> = ({ control, errors }) => {
    return (
        <Box>
            <InputGroup size="sm">
                <InputLeftAddon children="Type" />
                <Box w="100%">
                    <Controller
                        name="activity_type"
                        control={control}
                        rules={{
                            required: true,
                        }}
                        render={({ field: { onChange, value = [] } }) => (
                            <Select<ServiceStatusOption, false>
                                id="activity_type"
                                name="activity_type"
                                options={Assignments.activity_types}
                                placeholder="Select type of HA"
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
            {errors?.hatype?.type === "required" && (
                <ErrorText text="Please select a type of activity!" />
            )}
        </Box>
    );
};

export default ActivityTypeInput;
