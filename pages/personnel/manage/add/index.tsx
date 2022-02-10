import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Center,
    Heading,
    Input,
    InputGroup,
    InputLeftAddon,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { CreatableSelect, OptionBase, Select } from "chakra-react-select";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import CustomStepper from "../../../../components/Common/CustomStepper";
import { NextProtectedPage } from "../../../../lib/auth";
import fetcher, { sendPOST } from "../../../../lib/fetcher";
import Assignments from "../../../../config/assignments.json";
import CustomControlledDatePicker from "../../../../components/Dates/CustomControlledDatePicker";
import ErrorText from "../../../../components/Forms/ErrorText";
import HelpText from "../../../../components/Forms/HelpText";
import { isBefore } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import CustomBigAlert from "../../../../components/Alert/CustomBigAlert";
import { useRouter } from "next/router";

const steps = ["Add details", "Success"];

interface ServiceStatusOption extends OptionBase {
    label: string;
    value: string;
}
[];
const AddPersonnelPage: NextProtectedPage = () => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<any>({
        defaultValues: {
            service_status: { label: "NSF", value: "NSF" },
            post_in: new Date(),
            ord: new Date(),
        },
    });
    const { data, error } = useSWR<{ platoons: string[]; sections: string[] }>(
        "/api/personnel/manage/add",
        fetcher
    );
    console.log({ data });

    const [success, setSuccess] = useState(false);
    const [personnelData, setPersonnelData] = useState<{
        post_in: string;
        ord: string;
        name: string;
        pes: string;
        platoon: string;
        rank: string;
        service_status: string;
        personnel_ID: string;
    }>();
    const toast = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submit = async (data: any) => {
        setIsSubmitting(true);
        console.log({ data });

        const { post_in, ord, name } = data;

        if (isBefore(ord, post_in)) {
            setError("ord", {
                type: "wrong_date",
                message: "ORD must be after post in date!",
            });
            setError("post_in", {
                type: "wrong_date",
                message: "ORD must be after post in date!",
            });
            setIsSubmitting(false);
            return;
        }
        const pes = data.pes.value;
        const platoon = data.platoon.value;
        const rank = data.rank.value;
        const service_status = data.service_status.value;

        const responseData = await sendPOST("/api/personnel/manage/add", {
            post_in,
            ord,
            name,
            pes,
            platoon,
            rank,
            service_status,
        });
        console.log({ responseData });
        if (responseData.success) {
            setSuccess(true);
            console.log(responseData.data);
            setPersonnelData(responseData.data);
        } else {
            toast({
                title: "Error",
                description: responseData.error,
                status: "error",
            });
        }
        setIsSubmitting(false);
    };

    const [secondsLeft, setSecondsLeft] = useState(10);
    useEffect(() => {
        if (!success) return;

        const interval = setInterval(
            () => setSecondsLeft((prev) => (!prev ? prev : prev - 1)),
            1000
        ); // subtract if not 0 (!!0 --> false)
        return () => clearInterval(interval);
    }, [success, setSecondsLeft]);

    const redirectToHome = useCallback(() => {
        setSuccess(false);
        reset();
    }, [setSuccess, reset]);
    const redirectToPersonnelPage = useCallback(
        () => router.push(`/personnel/manage/${personnelData?.personnel_ID}`),
        [personnelData, router]
    );
    useEffect(() => {
        if (secondsLeft <= 0) {
            redirectToHome();
        }
    }, [secondsLeft, redirectToHome]);


    if (success)
        return (
            <Stack direction="column">
                <Center>
                    <Heading> Add Personnel </Heading>
                </Center>
                <Center>
                    <CustomStepper step={1} steps={steps} />
                </Center>

                <CustomBigAlert header="Personnel added!">
                    <>
                        Your personnel {personnelData?.rank || "LCP"}{" "}
                        {personnelData?.name || "testing"} has been added.
                        
                        <Stack direction="row" justifyContent="center" mt={1}>
                            <Button
                                size="xs"
                                colorScheme="teal"
                                onClick={redirectToPersonnelPage}
                            >
                                Personnel page
                            </Button>
                            <Button
                                size="xs"
                                colorScheme="teal"
                                onClick={redirectToHome}
                            >
                                Back to adding ({secondsLeft}s)
                            </Button>
                        </Stack>
                    </>
                </CustomBigAlert>
            </Stack>
        );

    return (
        <form onSubmit={handleSubmit(submit)}>
            <Stack direction="column">
                <Center>
                    <Heading> Add Personnel </Heading>
                </Center>
                <Center>
                    <CustomStepper step={0} steps={steps} />
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
                                            options={data?.platoons.map(
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
                        <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
                            Submit
                        </Button>
                    </Center>
                </Stack>
            </Stack>
        </form>
    );
};

AddPersonnelPage.requireAuth = true;
export default AddPersonnelPage;
