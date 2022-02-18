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
                    <Box>
                        <InputGroup size="sm">
                            <InputLeftAddon children="Service status" />
                            <Box w="100%">
                                <Controller
                                    name="service_status"
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({
                                        field: { onChange, value = [] },
                                    }) => (
                                        <Select<ServiceStatusOption, false>
                                            defaultValue={{
                                                label: "NSF",
                                                value: "NSF",
                                            }}
                                            id="service_status"
                                            name="service_status"
                                            options={Assignments.service_status.map(
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
                        {errors?.service_status?.type === "required" && (
                            <ErrorText text="Please select a service status!" />
                        )}
                    </Box>
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
                                    render={({
                                        field: { onChange, value = [] },
                                    }) => (
                                        <Select<ServiceStatusOption, false>
                                            id="rank"
                                            name="rank"
                                            options={Object.keys(
                                                Assignments.rank_army
                                            ).map((rank) => ({
                                                label: rank,
                                                value: rank,
                                            }))}
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
                            <InputLeftAddon children="PES" />
                            <Box w="100%">
                                <Controller
                                    name="pes"
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({
                                        field: { onChange, value = [] },
                                    }) => (
                                        <Select<ServiceStatusOption, false>
                                            id="pes"
                                            name="pes"
                                            options={Assignments.pes.map(
                                                (pes) => ({
                                                    label: pes,
                                                    value: pes,
                                                })
                                            )}
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
