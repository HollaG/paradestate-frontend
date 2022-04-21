import {
    Box,
    Checkbox,
    Flex,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    InputRightElement,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import {
    ChakraStylesConfig,
    components,
    GroupBase,
    OptionBase,
    OptionProps,
    Select,
} from "chakra-react-select";
import {
    Control,
    FieldValues,
    Controller,
    UseFormRegister,
} from "react-hook-form";
import ErrorText from "../../ErrorText";
import Assignments from "../../../../config/assignments.json";
import { useEffect } from "react";

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
        if (state.isSelected) color += ".400";
        else if (state.isFocused) color += ".200";
        else color += ".100";
        return {
            ...provided,
            background: color,
        };
    },
    control: (provided, state) => {
        // console.log({provided, state})
        return {
            ...provided,
            //@ts-ignore
            backgroundColor: `${state.selectProps.value.color}.100`,
            // color: "white"
        };
    },
};

const ActivityTypeInput: React.FC<{
    control: Control<FieldValues, object>;
    errors: {
        [x: string]: any;
    };
    register: UseFormRegister<any>;

    contributes: "0" | "1" | "2";
    setContributes: React.Dispatch<React.SetStateAction<"0" | "1" | "2">>;
}> = ({ control, errors, register, contributes, setContributes }) => {
    
    return (
        <Flex>
            <InputGroup size="sm" flexGrow={1}>
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
            <InputGroup size="sm" w="8.5rem" flexShrink={0}>
                <InputLeftAddon children="HA units" />

                <NumberInput
                    size="sm"
                    defaultValue={0}
                    min={0}
                    max={2}
                    value={contributes}
                    onChange={(event) =>
                        (event === "0" || event === "1" || event === "2") &&
                        setContributes(event as "0"|"1"|"2")
                    }
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </InputGroup>
        </Flex>
    );
};

export default ActivityTypeInput;
