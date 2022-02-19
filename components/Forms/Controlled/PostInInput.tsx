import { Box, InputGroup, InputLeftAddon } from "@chakra-ui/react";
import { Control, FieldValues } from "react-hook-form";
import CustomControlledDatePicker from "../../Dates/CustomControlledDatePicker";
import ErrorText from "../ErrorText";

const PostInInput: React.FC<{
    control: Control<FieldValues, object>;
    errors: {
        [x: string]: any;
    };
}> = ({control, errors}) => {
    return (
        <Box>
            <InputGroup size="sm">
                <InputLeftAddon children="Post in" />
                <CustomControlledDatePicker
                    control={control}
                    name="post_in"
                    placeholder="Date when personnel joined the company"
                />
            </InputGroup>
            {errors?.post_in?.type === "required" && (
                <ErrorText text="Please enter a date for post-in!" />
            )}
            {errors?.post_in?.type === "wrong_date" && (
                <ErrorText text="ORD must be after post-in date!" />
            )}
        </Box>
    );
};

export default PostInInput;
