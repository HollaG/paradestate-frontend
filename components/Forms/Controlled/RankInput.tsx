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
const RankInput: React.FC<{
    control: Control<FieldValues, object>;
    errors: {
        [x: string]: any;
    };
}> = ({ control, errors }) => {
    return (
        <Box>
            <InputGroup size="sm">
                <InputLeftAddon children="Rank" />
                <Box w="100%">
                    <Controller
                        name="rank"
                        control={control}
                        rules={{
                            required: true,
                        }}
                        render={({ field: { onChange, value = [] } }) => (
                            <Select<ServiceStatusOption, false>
                                id="rank"
                                name="rank"
                                options={Object.keys(Assignments.rank_army).map(
                                    (rank) => ({
                                        label: rank,
                                        value: rank,
                                    })
                                )}
                                placeholder="Select rank"
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
            {errors?.rank?.type === "required" && (
                <ErrorText text="Please select a rank!" />
            )}
        </Box>
    );
};

export default RankInput;
