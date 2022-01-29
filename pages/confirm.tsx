import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Center,
    Container,
    Divider,
    Flex,
    Heading,
    Icon,
    IconButton,
    Text,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { IoTrash } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import useSWR from "swr";
import {
    AddedAttCOrCourse,
    AddedLeaveOrOff,
    AddedMA,
    AddedOthers,
} from "../components/Dashboard/AddedEvent";
import {
    ConfirmAttC,
    ConfirmCourse,
    ConfirmLeave,
    ConfirmMA,
    ConfirmOff,
    ConfirmOthers,
} from "../components/Dashboard/ConfirmEvent";
import Layout from "../components/Sidebar";
import { capitalizeFirstLetter } from "../lib/custom";
import fetcher, { sendPOST } from "../lib/fetcher";
import { dashboardActions } from "../store/dashboard-slice";
import { DashboardState, EventData, RootState } from "../types/types";
const tempObj = {
    off: {
        "33": {
            date: ["2022-01-27T16:00:00.000Z", "2022-01-27T16:00:00.000Z"],
        },
        "34": {
            date: ["2022-01-27T16:00:00.000Z", "2022-01-27T16:00:00.000Z"],
        },
        "114": {
            reason: "",
            date: ["2022-01-27T16:00:00.000Z", "2022-01-27T16:00:00.000Z"],
            "start-time": "AM",
            "end-time": "PM",
        },
    },
    leave: {
        "112": {
            reason: "",
            date: ["2022-01-27T16:00:00.000Z", "2022-01-27T16:00:00.000Z"],
            "start-time": "AM",
            "end-time": "PM",
        },
    },
    attc: {
        "33": {
            reason: "",
        },
    },
    course: {
        "34": {
            name: "",
        },
    },
    ma: {
        "31": {
            name: "",
            location: "",
            incamp: true,
        },
    },
    others: {
        "243": {
            name: "",
            incamp: true,
            date: ["2022-01-27T16:00:00.000Z", "2022-01-27T16:00:00.000Z"],
        },
    },
};

const InputFields: React.FC<{
    type: "off" | "leave" | "attc" | "course" | "ma" | "others";
    personnel_ID: number;
    data: any;
}> = ({ type, personnel_ID, data }) => {
    switch (type) {
        case "leave":
            return <ConfirmLeave data={data} personnel_ID={personnel_ID} />;
        case "off":
            return <ConfirmOff data={data} personnel_ID={personnel_ID} />;
        case "attc":
            return <ConfirmAttC data={data} personnel_ID={personnel_ID} />;
        case "course":
            return <ConfirmCourse data={data} personnel_ID={personnel_ID} />;
        case "ma":
            return <ConfirmMA data={data} personnel_ID={personnel_ID} />;
        case "others":
            return <ConfirmOthers data={data} personnel_ID={personnel_ID} />;
        default:
            return <></>;
    }
    // if (type === ("off"||"leave")) {
    //     return <ConfirmLeave data={data} personnel_ID={personnel_ID}/>
    // } else if (type === ("course"||"attc")) {

    // } else if (type === "ma") {

    // } else {

    // }
    return <></>;
};

const ResultFields: React.FC<{
    type: "off" | "leave" | "attc" | "course" | "ma" | "others";

    data: any;
}> = ({ type, data }) => {
    switch (type) {
        case "leave":
            return <AddedLeaveOrOff data={data} />;
        case "off":
            return <AddedLeaveOrOff data={data} />;
        case "attc":
            return <AddedAttCOrCourse data={data} />;
        case "course":
            return <AddedAttCOrCourse data={data} />;
        case "ma":
            return <AddedMA data={data} />;
        case "others":
            return <AddedOthers data={data} />;
        default:
            return <></>;
    }
};

const Confirm: NextPage = () => {
    const dashboardData = useSelector(
        (state: RootState) => state.dashboard.data
    );
    const dashboardPersonnel = useSelector(
        (state: RootState) => state.dashboard.personnelMap
    );

    const methods = useForm({ shouldUnregister: true });
    const router = useRouter();

    const {
        register,
        handleSubmit,
        getValues,
        watch,
        formState: { errors },
    } = methods;

    const [confirmedDashboardData, setConfirmedDashboardData] =
        useState<EventData>();
    const onSubmit = async (data: any) => {
        const responseData = await sendPOST("/api/dashboard/submit", data);

        console.log({ responseData });
        if (responseData.success) setConfirmedDashboardData(responseData.data);
    };
    const dispatch = useDispatch();

    const activeEventNames = Object.keys(dashboardData) as Array<
        keyof typeof dashboardData
    >;

    const deleteEntry = (
        type: keyof typeof dashboardData,
        personnel_ID: number
    ) => {
        dispatch(dashboardActions.deleteEntry({ type, personnel_ID }));
    };

    useEffect(() => {
        if (
            !Object.keys(dashboardData.off).length &&
            !Object.keys(dashboardData.leave).length &&
            !Object.keys(dashboardData.ma).length &&
            !Object.keys(dashboardData.attc).length &&
            !Object.keys(dashboardData.course).length &&
            !Object.keys(dashboardData.others).length
        ) {
            // No more
            router.push("/");
        }
    }, [dashboardData]);

    const Verify = (
        <Container maxW="container.lg">
            <Heading> Confirm details </Heading>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Accordion
                        defaultIndex={activeEventNames.map((_, index) => index)}
                        allowMultiple
                        allowToggle
                    >
                        {activeEventNames.map(
                            (type: keyof typeof dashboardData, index1) =>
                                Object.keys(dashboardData[type]).length ? (
                                    // The respective attc/leave etc object has personnelID keys, i.e. is being edited
                                    <AccordionItem key={index1}>
                                        <Text>
                                            <AccordionButton
                                                _expanded={{
                                                    bg: "gray.200",
                                                }}
                                            >
                                                <Box flex={1} textAlign="left">
                                                    {capitalizeFirstLetter(
                                                        type
                                                    )}
                                                    {/* Number of personnelIDs in this section */}{" "}
                                                    (
                                                    {
                                                        Object.keys(
                                                            dashboardData[type]
                                                        ).length
                                                    }
                                                    )
                                                </Box>
                                                <AccordionIcon />
                                            </AccordionButton>
                                        </Text>
                                        <AccordionPanel
                                            borderColor="gray.200"
                                            borderWidth={2}
                                            pb={4}
                                        >
                                            {(
                                                Object.keys(
                                                    dashboardData[type]
                                                ) as unknown as Array<number>
                                            ).map((personnel_ID, index2) => (
                                                <Box key={index2}>
                                                    <Flex
                                                        justify="space-between"
                                                        align="center"
                                                    >
                                                        <Box>
                                                            <Text fontWeight="semibold">
                                                                {
                                                                    dashboardPersonnel[
                                                                        personnel_ID
                                                                    ].rank
                                                                }{" "}
                                                                {
                                                                    dashboardPersonnel[
                                                                        personnel_ID
                                                                    ].name
                                                                }
                                                            </Text>

                                                            <Text>
                                                                {
                                                                    dashboardPersonnel[
                                                                        personnel_ID
                                                                    ].platoon
                                                                }
                                                            </Text>
                                                        </Box>
                                                        <IconButton
                                                            colorScheme="red"
                                                            fontSize="20px"
                                                            icon={
                                                                <Icon
                                                                    as={IoTrash}
                                                                />
                                                            }
                                                            aria-label="Delete entry"
                                                            onClick={() =>
                                                                deleteEntry(
                                                                    type,
                                                                    personnel_ID
                                                                )
                                                            }
                                                        />
                                                    </Flex>

                                                    <InputFields
                                                        type={type}
                                                        personnel_ID={Number(
                                                            personnel_ID
                                                        )}
                                                        data={
                                                            dashboardData[type][
                                                                Number(
                                                                    personnel_ID
                                                                )
                                                            ]
                                                        }
                                                    />
                                                    <Divider />
                                                </Box>
                                            ))}
                                        </AccordionPanel>
                                    </AccordionItem>
                                ) : null
                        )}
                    </Accordion>
                    <Center mt={3}>
                        <Button type="submit" colorScheme="teal">
                            Submit
                        </Button>
                    </Center>
                </form>
            </FormProvider>
        </Container>
    );

    const Confirmed = (
        <Container maxW="container.lg">
            <Heading> Success </Heading>

            <Accordion
                defaultIndex={activeEventNames.map((_, index) => index)}
                allowMultiple
                allowToggle
            >
                {confirmedDashboardData &&
                    (
                        Object.keys(confirmedDashboardData) as Array<
                            keyof typeof confirmedDashboardData
                        >
                    ).map((type: keyof typeof confirmedDashboardData, index1) =>
                        Object.keys(confirmedDashboardData[type]).length ? (
                            // The respective attc/leave etc object has personnelID keys, i.e. is being edited
                            <AccordionItem key={index1}>
                                <Text>
                                    <AccordionButton
                                        _expanded={{
                                            bg: "gray.200",
                                        }}
                                    >
                                        <Box flex={1} textAlign="left">
                                            {capitalizeFirstLetter(type)}
                                            {/* Number of personnelIDs in this section */}{" "}
                                            (
                                            {
                                                Object.keys(
                                                    confirmedDashboardData[type]
                                                ).length
                                            }
                                            )
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </Text>
                                <AccordionPanel
                                    borderColor="gray.200"
                                    borderWidth={2}
                                    pb={4}
                                >
                                    {(
                                        Object.keys(
                                            confirmedDashboardData[type]
                                        ) as unknown as Array<number>
                                    ).map((personnel_ID, index2) => (
                                        <Box key={index2}>
                                            <Flex
                                                justify="space-between"
                                                align="center"
                                            >
                                                <Box>
                                                    <Text fontWeight="semibold">
                                                        {
                                                            dashboardPersonnel[
                                                                personnel_ID
                                                            ].rank
                                                        }{" "}
                                                        {
                                                            dashboardPersonnel[
                                                                personnel_ID
                                                            ].name
                                                        }
                                                    </Text>

                                                    <Text>
                                                        {
                                                            dashboardPersonnel[
                                                                personnel_ID
                                                            ].platoon
                                                        }
                                                    </Text>
                                                </Box>
                                                <IconButton
                                                    colorScheme="red"
                                                    fontSize="20px"
                                                    icon={<Icon as={IoTrash} />}
                                                    aria-label="Edit entry"
                                                    // onClick={
                                                    //     // () =>
                                                    //     // deleteEntry(
                                                    //     //     type,
                                                    //     //     personnel_ID
                                                    //     // )
                                                    // }
                                                />
                                            </Flex>

                                            <ResultFields
                                                type={type}
                                                data={
                                                    confirmedDashboardData[
                                                        type
                                                    ][personnel_ID]
                                                }
                                            />
                                            <Divider />
                                        </Box>
                                    ))}
                                </AccordionPanel>
                            </AccordionItem>
                        ) : null
                    )}
            </Accordion>
        </Container>
    );
    return <Layout content={confirmedDashboardData ? Confirmed : Verify} />;
};

export default Confirm;
