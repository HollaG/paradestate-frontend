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
    Link,
} from "@chakra-ui/react";
import { format } from "date-fns";
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
import DashboardHeading from "../components/Dashboard/Heading";
import Layout from "../components/Sidebar";
import { NextProtectedPage } from "../lib/auth";
import { capitalizeFirstLetter } from "../lib/custom";
import fetcher, { sendPOST } from "../lib/fetcher";
import { dashboardActions } from "../store/dashboard-slice";
import { DashboardState, EventData, RootState } from "../types/types";
import NextLink from "next/link";
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

const Confirm: NextProtectedPage = () => {
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
    const [secondsLeft, setSecondsLeft] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const dispatch = useDispatch();

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        const responseData = await sendPOST("/api/dashboard/submit", data);

        console.log({ responseData });
        if (responseData.success) {
            setSuccess(true);
            setConfirmedDashboardData(responseData.data);

            dispatch(dashboardActions.clearData());
        } else {
            alert(responseData.error);
        }
    };

    useEffect(() => {
        if (!success) return;

        if (secondsLeft <= 0) {
            router.push("/");
            return;
        }
        const timeout = setTimeout(() => {
            setSecondsLeft((prevSecs) => prevSecs - 1);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [success, secondsLeft, setSecondsLeft, router]);
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
        if (confirmedDashboardData) return;
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
    }, [dashboardData, router, confirmedDashboardData]);

    const clearSelection = () => {
        dispatch(dashboardActions.clearData());
    };

    const Verify = (
        <>
            <DashboardHeading step={1}>
                <Heading>{format(new Date(), "eee d LLL yyyy")}</Heading>
                <Button
                    colorScheme="teal"
                    size="xs"
                    ml={2}
                    onClick={() => clearSelection()}
                >
                    Clear
                </Button>
            </DashboardHeading>
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
                                                                <Link
                                                                    isExternal
                                                                    href={`/personnel/manage/${personnel_ID}`}
                                                                >
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
                                                                </Link>
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
                        <Button
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Submit
                        </Button>
                    </Center>
                </form>
            </FormProvider>
        </>
    );

    const Confirmed = (
        <>
            <DashboardHeading step={2}>
                <Heading>Events added</Heading>
                <Link href="/">
                    <Button
                        colorScheme="teal"
                        size="xs"
                        ml={2}
                        onClick={() => clearSelection()}
                    >
                        Back to home ({secondsLeft}s)
                    </Button>
                </Link>
                {/* <Box>
                    <Text>
                        
                        You will be automatically redirected in 10 seconds.
                    </Text>
                </Box> */}
            </DashboardHeading>

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
        </>
    );
    return confirmedDashboardData ? Confirmed : Verify;
};

Confirm.requireAuth = true;
export default Confirm;
