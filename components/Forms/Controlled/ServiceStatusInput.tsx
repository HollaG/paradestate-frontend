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

const ServiceStatusInput:React.FC<{
    control: Control<FieldValues, object>,
    errors: {
        [x: string]: any;
    }
}> = ({control, errors}) => {
    return (
        <Box>
            <InputGroup size="sm">
                <InputLeftAddon children="Service status" />
                <Box w="100%">
                    <Controller
                        name="svc_status"
                        control={control}
                        rules={{
                            required: true,
                        }}
                        render={({ field: { onChange, value = [] } }) => (
                            <Select<ServiceStatusOption, false>
                                defaultValue={{
                                    label: "NSF/NSMan",
                                    value: "NSF/NSMan",
                                }}
                                id="svc_status"
                                name="svc_status"
                                options={Assignments.svc_status.map(
                                    (status) => ({
                                        label: status,
                                        value: status,
                                    })
                                )}
                                placeholder="Select service status"
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
            {errors?.svc_status?.type === "required" && (
                <ErrorText text="Please select a service status!" />
            )}
        </Box>
    );
};

export default ServiceStatusInput;
