import {
    Stack,
    Center,
    Heading,
    Box,
    InputGroup,
    InputLeftAddon,
    Input,
    Text,
    Button,
} from "@chakra-ui/react";
import { Select, CreatableSelect, OptionBase } from "chakra-react-select";
import { Controller, useFormContext } from "react-hook-form";
import submit from "../../../../pages/api/dashboard/submit";
import CustomStepper from "../../../Common/CustomStepper";

import CustomControlledDatePicker from "../../../Dates/CustomControlledDatePicker";
import ErrorText from "../../../Forms/ErrorText";
import HelpText from "../../../Forms/HelpText";
import Assignments from "../../../../config/assignments.json"
import ServiceStatusInput from "../../../Forms/Controlled/ServiceStatusInput";
import RankInput from "../../../Forms/Controlled/RankInput";
import PesInput from "../../../Forms/Controlled/PesInput";
import PostInInput from "../../../Forms/Controlled/PostInInput";
import ORDInput from "../../../Forms/Controlled/ORDInput";

interface ServiceStatusOption extends OptionBase {
    label: string;
    value: string;
}
[];

const AddFormTemplate: React.FC<{
    submit: (data: any) => void;
    steps: string[];
    isSubmitting: boolean;
    platoons: string[];
    sections: string[];
    step: 0 | 1 | 2
}> = ({ submit, steps, isSubmitting, platoons, sections, step }) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useFormContext<any>();
    return (
        <form onSubmit={handleSubmit(submit)}>
            <Stack direction="column">
                <Center>
                    <Heading> Add Personnel </Heading>
                </Center>
                <Center>
                    <CustomStepper step={step} steps={steps} />
                </Center>
                {/* <Center>
                    <Box>
                        <Button colorScheme="teal"> Import </Button>
                    </Box>
                </Center> */}
                <Text pl={2}> All fields are required. </Text>
                <Stack direction="column" spacing={6}>
                    <ServiceStatusInput control={control} errors={errors}/>
                    <RankInput control={control} errors={errors}/>
                    <Box>
                        <InputGroup size="sm">
                            <InputLeftAddon children="Name" />
                            <Input
                                placeholder="Full name of personnel"
                                {...register("name", {
                                    required: true,
                                })}
                            />
                        </InputGroup>
                        {errors?.name?.type === "required" && (
                            <ErrorText text="Please enter a name!" />
                        )}
                    </Box>
                    <Box>
                        <InputGroup size="sm">
                            <InputLeftAddon children="Persnode #" />
                            <Input
                                placeholder="Persnode ID"
                                {...register("pers_num", {
                                    required: true,
                                })}
                            />
                        </InputGroup>
                        {errors?.pers_num?.type === "required" && (
                            <ErrorText text="Please enter a persnode identification number!!" />
                        )}
                    </Box>
                    <PesInput control={control} errors={errors}/>
                    <PostInInput control={control} errors={errors}/>
                    <ORDInput control={control} errors={errors} />
                    <Box>
                        <InputGroup size="sm">
                            <InputLeftAddon children="Platoon" />
                            <Box w="100%">
                                <Controller
                                    name="platoon"
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({
                                        field: { onChange, value = [] },
                                    }) => (
                                        <CreatableSelect<
                                            ServiceStatusOption,
                                            true
                                        >
                                            name="platoon"
                                            placeholder="Select or enter a platoon..."
                                            options={platoons.map(
                                                (platoon) => ({
                                                    label: platoon,
                                                    value: platoon,
                                                })
                                            )}
                                            value={value}
                                            onChange={onChange}
                                            size="sm"
                                        />
                                    )}
                                />
                            </Box>
                        </InputGroup>
                        {errors?.platoon?.type === "required" ? (
                            <ErrorText text="Please choose or type a platoon!" />
                        ) : (
                            <HelpText text="If the desired platoon does not exist, create the platoon by typing the name." />
                        )}
                    </Box>
                    <Center>
                        <Button
                            colorScheme="teal"
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Submit
                        </Button>
                    </Center>
                </Stack>
            </Stack>
        </form>
    );
};

export default AddFormTemplate;
