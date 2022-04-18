import { Box, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import {
    ChakraStylesConfig,
    components,
    GroupBase,
    OptionBase,
    OptionProps,
    Select,
} from "chakra-react-select";
import { Control, FieldValues, Controller } from "react-hook-form";
import ErrorText from "../../ErrorText";
import Assignments from "../../../../config/assignments.json";

interface ActivityOption extends OptionBase {
    label: string;
    value: string;
    color?: string;
}
[];
const colorStyles = {
    option: (styles: any, { data }: { data: { color: string } }) => {
        return {
            ...styles,
            backgroundColor: data.color,
        };
    },
};
const chakraStyles: ChakraStylesConfig<
    ActivityOption,
    false,
    GroupBase<ActivityOption>
> = {
    option: (provided, state) => {
        
        let color = state.data.color;
        if (state.isSelected) color+= '.400'
        else if (state.isFocused) color+= '.200'
        else color+= '.100'
        return {
            ...provided,
            background: color,
        };
    },
    control : (provided, state) => {
        // console.log({provided, state})
        return({
        ...provided,
        //@ts-ignore
        backgroundColor: `${state.selectProps.value.color}.100`,
        // color: "white"
    })}
};

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
                            <Select<ActivityOption, false>
                                id="activity_type"
                                name="activity_type"
                                options={Assignments.activity_types}
                                placeholder="Select type of activity"
                                closeMenuOnSelect={true}
                                size="sm"
                                isSearchable={false}
                                value={value}
                                onChange={onChange}
                                colorScheme="purple"
                                chakraStyles={chakraStyles}
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
