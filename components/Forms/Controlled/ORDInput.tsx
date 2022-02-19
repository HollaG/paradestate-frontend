import { Box, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { Control, FieldValues } from "react-hook-form";
import CustomControlledDatePicker from "../../Dates/CustomControlledDatePicker";
import ErrorText from "../ErrorText";

const ORDInput: React.FC<{
    control: Control<FieldValues, object>;
    errors: {
        [x: string]: any;
    };
}> = ({control, errors}) => {
    return (
        <Box>
            <InputGroup size="sm">
                <InputLeftAddon children="ORD" />
                <CustomControlledDatePicker
                    control={control}
                    name="ord"
                    placeholder="Operationally Ready Date"
                />
            </InputGroup>
            {errors?.ord?.type === "required" && (
                <ErrorText text="Please enter an ORD!" />
            )}
            {errors?.ord?.type === "wrong_date" && (
                <ErrorText text="ORD must be after post-in date!" />
            )}
        </Box>
    );
};

export default ORDInput