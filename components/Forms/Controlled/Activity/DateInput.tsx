import { Box, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { Control, FieldValues } from "react-hook-form";
import CustomControlledDatePicker from "../../../Dates/CustomControlledDatePicker";
import ErrorText from "../../ErrorText";


const DateInput: React.FC<{
    control: Control<FieldValues, object>;
    errors: {
        [x: string]: any;
    };
}> = ({control, errors}) => {
    return (
        <Box>
            <InputGroup size="sm">
                <InputLeftAddon children="Activity Date" />
                <CustomControlledDatePicker
                    control={control}
                    name="activity_date"
                    placeholder="Date of Activity"
                />
            </InputGroup>
            {errors?.activity_date?.type === "required" && (
                <ErrorText text="Please enter an activity date!" />
            )}
            
        </Box>
    );
};

export default DateInput