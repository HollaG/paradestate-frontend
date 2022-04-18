import {
    Stack,
    Center,
    Heading,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Text,
    Badge,
    Collapse,
    Divider,
    Flex,
    Link,
    SimpleGrid,
    Tag,
    TagLabel,
    TagRightIcon,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Skeleton,
    Avatar,
    Grid,
    GridItem,
    Stat,
    StatLabel,
    StatNumber,
    Button,
    Input,
    InputGroup,
    InputLeftAddon,
    Spinner,
    AlertIcon,
    Alert,
} from "@chakra-ui/react";
import { format, isBefore, isSameDay } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { IoOpenOutline } from "react-icons/io5";
import useSWR, { useSWRConfig } from "swr";
import PersonBasicDetails from "../../../components/Common/PersonBasicDetails";
import { NextProtectedPage } from "../../../lib/auth";
import fetcher, { sendDELETE, sendPOST } from "../../../lib/fetcher";
import { Activity } from "../../../types/activity";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import Assignments from "../../../config/assignments.json";
import { capitalizeFirstLetter } from "../../../lib/custom";
import NextLink from "next/link";
import SmallCard from "../../../components/Card/SmallCard";
import { Absentee } from "../../api/activity/[activity_ID]";
import DeleteDialog from "../../../components/Dialogs/DeleteDialog";
const Tags: React.FC<{ person: ExtendedPersonnel }> = ({ person }) => {
    const tags = [];

    if (person.locationArr && person.locationArr.length) {
        person.locationArr.forEach((location) => {
            tags.push(
                <Tag
                    size="sm"
                    variant="subtle"
                    colorScheme="red"
                    key={tags.length}
                    // onClick={onOpen}
                    // sx={{ cursor: "pointer" }}
                >
                    {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}

                    <TagLabel>{location}</TagLabel>
                    <TagRightIcon as={IoOpenOutline} />
                </Tag>
            );
        });
    } else {
        tags.push(
            <Tag
                key={tags.length}
                size="sm"
                variant="subtle"
                colorScheme="green"
            >
                <TagLabel>In camp</TagLabel>
            </Tag>
        );
    }
    if (person.status_row_ID) {
        tags.push(
            <Tag key={tags.length} size="sm" variant="subtle" colorScheme="red">
                <TagLabel>On status</TagLabel>
                <TagRightIcon as={IoOpenOutline} />
            </Tag>
        );
    } else {
        tags.push(
            <Tag
                key={tags.length}
                size="sm"
                variant="subtle"
                colorScheme="green"
            >
                <TagLabel>No status</TagLabel>
            </Tag>
        );
    }
    return <>{tags}</>;
};

const MemoizedTags = React.memo(Tags);
const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;

    search: string;
    attending: boolean;

    absentee?: Absentee;
}> = ({ person, search, attending, absentee }) => {
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const activity_ID = router.query.activity_ID;
    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    /* --- deal with setting attended to absent --- */
    const [settingAbsent, setSettingAbsent] = useState(false);
    const setAsAbsentHandler = () => {
        setSettingAbsent((prev) => !prev);
    };
    const [absentReason, setAbsentReason] = useState("");
    const [setAbsentLoading, setSetAbsentLoading] = useState(false);
    const setAbsent = async () => {
        setSetAbsentLoading(true);
        const responseData = await sendPOST(
            `/api/activity/${activity_ID}/absent`,
            {
                personnel_ID: person.personnel_ID,
                reason: absentReason,
            }
        );
        if (responseData.success) {
            setSettingAbsent(false);
            setAbsentReason("");
            mutate(`/api/activity/${activity_ID}`);
        } else {
            alert(responseData.error);
        }
        setSetAbsentLoading(false);
    };

    /* --- deal with setting absent to attended --- */
    const [isLoading, setIsLoading] = useState(false);
    const setAttended = async () => {
        setIsLoading(true);
        const responseData = await sendPOST(
            `/api/activity/${activity_ID}/attended`,
            {
                personnel_ID: person.personnel_ID,
            }
        );
        if (responseData.success) {
            mutate(`/api/activity/${activity_ID}`);
        } else {
            alert(responseData.error);
        }
        setIsLoading(false);
    };

    return (
        <Collapse in={isVisible} animateOpacity>
            <SimpleGrid columns={{ sm: 1, lg: 2 }} my={3} spacing="6px">
                <Stack>
                    {/* <Flex align="center"> */}
                    <Stack direction="row">
                        <PersonBasicDetails
                            person={person}
                            handleClick={() => {}}
                        >
                            <MemoizedTags person={person} />
                        </PersonBasicDetails>
                    </Stack>
                    {!attending && (
                        <SmallCard
                            colors={["red.50", "gray.800"]}
                            borderColors={["red.100", "gray.800"]}
                        >
                            <Box py={1} px={2}>
                                {/* <Text fontSize="sm" textDecor="underline"> Reason </Text> */}
                                {absentee?.reason || "No specified reason"}
                            </Box>
                        </SmallCard>
                    )}
                </Stack>
                {/* <Spacer /> */}
                <Flex alignItems="center" m={{ lg: "unset", base: "auto" }}>
                    {attending && (
                        <Button
                            size="xs"
                            ml={{ lg: "auto" }}
                            onClick={() => setAsAbsentHandler()}
                            variant={settingAbsent ? "solid" : "outline"}
                            colorScheme="teal"
                        >
                            Set as absent
                        </Button>
                    )}
                    {!attending && (
                        <Button
                            size="xs"
                            ml={{ lg: "auto" }}
                            onClick={() => setAttended()}
                            variant={isLoading ? "solid" : "outline"}
                            colorScheme="teal"
                            isLoading={isLoading}
                        >
                            Set as attended
                        </Button>
                    )}
                </Flex>
            </SimpleGrid>
            <Collapse in={settingAbsent}>
                <Stack pb={2} px={2}>
                    <InputGroup size="sm">
                        <InputLeftAddon children="Reason (optional)" />
                        <Input
                            placeholder="Optional reason for absence"
                            value={absentReason}
                            onChange={(e) => setAbsentReason(e.target.value)}
                        />
                    </InputGroup>
                    <Box>
                        <Button
                            size="sm"
                            colorScheme="teal"
                            onClick={() => setAbsent()}
                            isLoading={setAbsentLoading}
                        >
                            Submit
                        </Button>
                    </Box>
                </Stack>
            </Collapse>

            <Divider />
        </Collapse>
    );
};
const PlatoonAccordianItem: React.FC<{
    personnel: ExtendedPersonnel[];
    platoon: string;
    attendee_IDs: number[];
    absentee_IDs: number[];
    absentees: { [key: number]: Absentee[] };
    // search: string;
}> = ({
    personnel,
    platoon,
    attendee_IDs,
    absentee_IDs,
    absentees,
    //  search
}) => {
    const { data: session } = useSession();
    const [rendered, setRendered] = useState(platoon === session?.user.platoon);
    // don't render the accordion panel by default, only render when use rclicks
    // This allows the page to be more performant as there is less stuff to hydrate
    // Render the accordion panel which corresponds to the user (will render if platoon === personnel[0].platoon)

    // useEffect(() => {
    //     if (search.length) setRendered(true);
    // }, [search]);

    const attendeesID: ExtendedPersonnel[] = [];
    const absenteesIDs: ExtendedPersonnel[] = [];
    personnel.forEach((person) =>
        attendee_IDs.includes(person.personnel_ID)
            ? attendeesID.push(person)
            : absenteesIDs.push(person)
    );
    return (
        <AccordionItem>
            <>
                <Text>
                    <AccordionButton
                        _expanded={{ bg: "gray.200" }}
                        onClick={() => setRendered(true)}
                    >
                        <Box flex={1} textAlign="left">
                            {platoon} ({personnel.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </Text>
                <AccordionPanel borderColor="gray.200" borderWidth={2} pb={4}>
                    {rendered && (
                        <Tabs align="center" variant="soft-rounded">
                            <TabList>
                                <Tab
                                    _selected={{
                                        bg: "green.400",
                                        color: "white",
                                    }}
                                >
                                    Attendees
                                </Tab>
                                <Tab
                                    _selected={{
                                        bg: "red.400",
                                        color: "white",
                                    }}
                                >
                                    Absentees
                                </Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    {attendeesID.map((person, index) => (
                                        <PersonAccordionItem
                                            key={index}
                                            person={person}
                                            search={""}
                                            attending={true}
                                        />
                                    ))}
                                </TabPanel>
                                <TabPanel>
                                    {absenteesIDs.map((person, index) => (
                                        <PersonAccordionItem
                                            key={index}
                                            person={person}
                                            search={""}
                                            attending={false}
                                            absentee={
                                                absentees[
                                                    person.personnel_ID
                                                ][0]
                                            }
                                        />
                                    ))}
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    )}
                </AccordionPanel>
            </>
        </AccordionItem>
    );
};
const IndividualActivityPage: NextProtectedPage = () => {
    const router = useRouter();
    const activity_ID = router.query.activity_ID;
    console.log(activity_ID);
    const { data, error } = useSWR<{
        activity: Activity;
        absentees_IDs: any;
        attendees_IDs: any;
        sortedByPlatoon: {
            [key: string]: ExtendedPersonnel[];
        };
        attendeeNumbers: {
            [key: string]: number;
        };
        absentees: { [key: number]: Absentee[] };
    }>(`/api/activity/${activity_ID}`, fetcher);
    console.log({ data });

    // Check if upcoming / Today / Past
    const activity = data?.activity;
    let pastPresentFuture = {
        color: "",
        text: "",
    };
    if (isSameDay(new Date(activity?.date || ""), new Date())) {
        // same date
        pastPresentFuture.text = "Today";
        pastPresentFuture.color = "purple";
    } else if (isBefore(new Date(activity?.date || ""), new Date())) {
        // past activity
        pastPresentFuture.text = "Past";
        pastPresentFuture.color = "green";
    } else {
        // future
        pastPresentFuture.text = "Upcoming";
        pastPresentFuture.color = "red";
    }
    const [index, setIndex] = useState<number[]>([]); // todo - set this to the user platoon

    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };
    const { data: session } = useSession();
    useEffect(() => {
        // if (search.length && data?.sortedByPlatoon) {
        //     // do stuff
        //     // Open all the tabs
        //     setIndex(
        //         [
        //             ...Object.keys(data.sortedByPlatoon).map(
        //                 (_, index) => index
        //             ),
        //             Object.keys(data.sortedByPlatoon).length,
        //         ] // add the ORD accordion
        //     );
        // } else {
        // Only set the index if it hasn't been set yet

        setIndex((prev) => {
            if (!prev.length) {
                const newIndex = Object.keys(
                    data?.sortedByPlatoon || {}
                ).indexOf(session?.user.platoon || "");
                if (newIndex === -1) return [...prev];
                else return [newIndex];
            } else return [...prev];
        });
        // }
    }, [data?.sortedByPlatoon, session]);

    const activityDate = format(
        activity?.date ? new Date(activity.date) : new Date(),
        Assignments.datewithnameformat
    );

    const [deleteIsOpen, setDeleteIsOpen] = useState(false);
    const deleteActivity = async () => {
        const responseData = await sendDELETE(`/api/activity/${activity_ID}`, {});
        if (responseData.success) { 
            router.push("/activity")
        } else {
            alert(responseData.error)
        }
    }
    return (
        <Stack>
            <Grid
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    lg: "repeat(6, 1fr)",
                }}
                templateRows={{
                    base: "repeat(2, 1fr)",
                    lg: "repeat(1, 1fr)",
                }}
                gap={{
                    base: 0,
                    lg: 4,
                }}
            >
                <GridItem minW="180px">
                    <Center>
                        <Avatar
                            size="2xl"
                            name={activity?.type}
                            bgColor="teal"
                            color="gray.300"
                        />
                    </Center>
                </GridItem>
                <GridItem
                    colSpan={5}
                    mt={2}
                    display="flex"
                    justifyContent={{ base: "center", lg: "unset" }}
                >
                    <Box>
                        <Box
                            display={{ base: "block", lg: "flex" }}
                            // flexDirection="row-reverse"
                            alignItems="center"
                        >
                            <Heading
                                size="2xl"
                                textAlign="center"
                                mr={{ base: 0, lg: 2 }}
                            >
                                {activity?.name}
                            </Heading>
                            <Box textAlign={{ base: "center", lg: "left" }}>
                                <Tag
                                    size="md"
                                    variant="subtle"
                                    colorScheme={"purple"}
                                >
                                    <TagLabel>{activity?.type}</TagLabel>
                                </Tag>
                            </Box>
                        </Box>
                        <Flex
                            justifyContent={{
                                base: "center",
                                lg: "unset",
                            }}
                        >
                            <Stack direction="row" alignItems="center">
                                <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    textAlign="center"
                                >
                                    {activityDate}
                                </Text>
                                <Box>
                                    <Tag
                                        size="md"
                                        variant="subtle"
                                        colorScheme={pastPresentFuture.color}
                                    >
                                        <TagLabel>
                                            {pastPresentFuture.text}
                                        </TagLabel>
                                    </Tag>
                                </Box>
                            </Stack>
                        </Flex>
                        <Box display={{ base: "block", lg: "flex" }}>
                            <Text
                                size="sm"
                                textAlign="center"
                                mr={{ base: 0, lg: 2 }}
                            >
                                {activity?.editor_ID}
                            </Text>
                        </Box>
                    </Box>
                </GridItem>
                <GridItem>
                    <SimpleGrid columns={{ base: 2, lg: 1 }} spacing={2}>
                        <Stat textAlign={{ base: "center", lg: "unset" }}>
                            <StatLabel> Activity ID </StatLabel>
                            <StatNumber>
                                <Badge fontSize="lg" colorScheme="purple">
                                    {activity?.activity_ID}
                                </Badge>
                            </StatNumber>
                            {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                        </Stat>
                        <Stat textAlign={{ base: "center", lg: "unset" }}>
                            <StatLabel> Attendees </StatLabel>
                            <StatNumber>
                                <Badge fontSize="lg" colorScheme="purple">
                                    {data?.attendees_IDs.length} /{" "}
                                    {data?.attendees_IDs.length +
                                        data?.absentees_IDs.length}
                                </Badge>
                            </StatNumber>
                            {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                        </Stat>

                        {data &&
                            Object.keys(data.sortedByPlatoon).map(
                                (platoon, index) => (
                                    <Stat
                                        textAlign={{
                                            base: "center",
                                            lg: "unset",
                                        }}
                                        key={index}
                                    >
                                        <StatLabel> {platoon} </StatLabel>
                                        <StatNumber>
                                            <Badge
                                                fontSize="lg"
                                                colorScheme="purple"
                                            >
                                                {data.attendeeNumbers[
                                                    platoon
                                                ] || 0}{" "}
                                                /{" "}
                                                {
                                                    data.sortedByPlatoon[
                                                        platoon
                                                    ].length
                                                }
                                            </Badge>
                                        </StatNumber>
                                    </Stat>
                                )
                            )}

                        {/* <SimpleGrid columns={2} spacing={2} alignItems="center">
                            <Button colorScheme="teal" onClick={editUser}>
                                Edit
                            </Button> */}
                            
                            <Button
                                colorScheme="red"
                                size="sm"
                                onClick={() => setDeleteIsOpen(true)}
                            >
                                Delete
                            </Button>
                        {/* </SimpleGrid> */}
                    </SimpleGrid>
                </GridItem>
                <GridItem colSpan={5} mt={{ base: 2, lg: 0 }}>
                    <Alert status="info" mb={2}>
                        <AlertIcon />
                        <Flex flexWrap="wrap">
                            <Text>
                                Personnel location and statuses as it appears on{" "}
                                {activityDate}.
                            </Text>
                        </Flex>
                    </Alert>
                    <Accordion
                        defaultIndex={[0]}
                        allowMultiple
                        allowToggle
                        index={index}
                        onChange={(e) => handleAccordion(e as number[])}
                    >
                        {data &&
                            Object.keys(data.sortedByPlatoon).map(
                                (platoon, index) => (
                                    <PlatoonAccordianItem
                                        key={index}
                                        personnel={
                                            data.sortedByPlatoon[platoon]
                                        }
                                        platoon={platoon}
                                        attendee_IDs={data.attendees_IDs}
                                        absentee_IDs={data.absentees_IDs}
                                        // search={search}
                                        absentees={data.absentees}
                                    />
                                )
                            )}
                    </Accordion>
                </GridItem>
            </Grid>
            <DeleteDialog isOpen={deleteIsOpen} setIsOpen={setDeleteIsOpen} confirmDelete={deleteActivity}/>
        </Stack>
    );
};

IndividualActivityPage.requireAuth = true;

export const IndividualActivityComponent: React.FC<{ activity_ID: number }> = ({
    activity_ID,
}) => {
    const activityRef = useRef<HTMLDivElement>(null);
    console.log(activity_ID);
    const { data, error } = useSWR<{
        activity: Activity;
        absentees_IDs: any;
        attendees_IDs: any;
        sortedByPlatoon: {
            [key: string]: ExtendedPersonnel[];
        };
        attendeeNumbers: {
            [key: string]: number;
        };
        absentees: { [key: number]: Absentee[] };
    }>(`/api/activity/${activity_ID}`, fetcher);
    console.log({ data });
    useEffect(() => {
        if (data && activityRef && activityRef.current) {
            // activityRef.current?.scrollIntoView({ behavior: "smooth" });
            // setTimeout(() => {
                window.scrollTo({
                    top:
                        activityRef.current.offsetTop -
                        (window.innerHeight -
                            activityRef.current.offsetHeight) /
                            2 -
                        56,
                    left: 0,
                    behavior: "smooth",
                });
            // }, 150);
        }
    }, [data, activityRef]);
    // Check if upcoming / Today / Past
    const activity = data?.activity;
    let pastPresentFuture = {
        color: "",
        text: "",
    };
    if (isSameDay(new Date(activity?.date || ""), new Date())) {
        // same date
        pastPresentFuture.text = "Today";
        pastPresentFuture.color = "purple";
    } else if (isBefore(new Date(activity?.date || ""), new Date())) {
        // past activity
        pastPresentFuture.text = "Past";
        pastPresentFuture.color = "green";
    } else {
        // future
        pastPresentFuture.text = "Upcoming";
        pastPresentFuture.color = "red";
    }
    const [index, setIndex] = useState<number[]>([]); // todo - set this to the user platoon

    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };
    const { data: session } = useSession();
    useEffect(() => {
        // if (search.length && data?.sortedByPlatoon) {
        //     // do stuff
        //     // Open all the tabs
        //     setIndex(
        //         [
        //             ...Object.keys(data.sortedByPlatoon).map(
        //                 (_, index) => index
        //             ),
        //             Object.keys(data.sortedByPlatoon).length,
        //         ] // add the ORD accordion
        //     );
        // } else {
        // Only set the index if it hasn't been set yet

        setIndex((prev) => {
            if (!prev.length) {
                const newIndex = Object.keys(
                    data?.sortedByPlatoon || {}
                ).indexOf(session?.user.platoon || "");
                if (newIndex === -1) return [...prev];
                else return [newIndex];
            } else return [...prev];
        });
        // }
    }, [data?.sortedByPlatoon, session]);

    const activityDate = format(
        activity?.date ? new Date(activity.date) : new Date(),
        Assignments.datewithnameformat
    );
    return (
        <Stack ref={activityRef}>
            <Grid
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    lg: "repeat(6, 1fr)",
                }}
                templateRows={{
                    base: "repeat(2, 1fr)",
                    lg: "repeat(1, 1fr)",
                }}
                gap={{
                    base: 0,
                    lg: 4,
                }}
            >
                <GridItem minW="180px">
                    <Center>
                        <Avatar
                            size="2xl"
                            name={activity?.type}
                            bgColor="teal"
                            color="gray.300"
                        />
                    </Center>
                </GridItem>
                <GridItem
                    colSpan={5}
                    mt={2}
                    display="flex"
                    justifyContent={{ base: "center", lg: "unset" }}
                >
                    <Box>
                        <Box
                            display={{ base: "block", lg: "flex" }}
                            // flexDirection="row-reverse"
                            alignItems="center"
                        >
                            <Heading
                                size="2xl"
                                textAlign="center"
                                mr={{ base: 0, lg: 2 }}
                            >
                                {activity?.name}
                            </Heading>
                            <Box textAlign={{ base: "center", lg: "left" }}>
                                <Tag
                                    size="md"
                                    variant="subtle"
                                    colorScheme={"purple"}
                                >
                                    <TagLabel>{activity?.type}</TagLabel>
                                </Tag>
                            </Box>
                        </Box>
                        <Flex
                            justifyContent={{
                                base: "center",
                                lg: "unset",
                            }}
                        >
                            <Stack direction="row" alignItems="center">
                                <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    textAlign="center"
                                >
                                    {activityDate}
                                </Text>
                                <Box>
                                    <Tag
                                        size="md"
                                        variant="subtle"
                                        colorScheme={pastPresentFuture.color}
                                    >
                                        <TagLabel>
                                            {pastPresentFuture.text}
                                        </TagLabel>
                                    </Tag>
                                </Box>
                            </Stack>
                        </Flex>
                        <Box display={{ base: "block", lg: "flex" }}>
                            <Text
                                size="sm"
                                textAlign="center"
                                mr={{ base: 0, lg: 2 }}
                            >
                                {activity?.editor_ID}
                            </Text>
                        </Box>
                    </Box>
                </GridItem>
                <GridItem>
                    <SimpleGrid columns={{ base: 2, lg: 1 }} spacing={2}>
                        <Stat textAlign={{ base: "center", lg: "unset" }}>
                            <StatLabel> Activity ID </StatLabel>
                            <StatNumber>
                                <Badge fontSize="lg" colorScheme="purple">
                                    {activity?.activity_ID}
                                </Badge>
                            </StatNumber>
                            {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                        </Stat>
                        <Stat textAlign={{ base: "center", lg: "unset" }}>
                            <StatLabel> Attendees </StatLabel>
                            <StatNumber>
                                <Badge fontSize="lg" colorScheme="purple">
                                    {data?.attendees_IDs.length} /{" "}
                                    {data?.attendees_IDs.length +
                                        data?.absentees_IDs.length}
                                </Badge>
                            </StatNumber>
                            {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                        </Stat>

                        {data &&
                            Object.keys(data.sortedByPlatoon).map(
                                (platoon, index) => (
                                    <Stat
                                        textAlign={{
                                            base: "center",
                                            lg: "unset",
                                        }}
                                        key={index}
                                    >
                                        <StatLabel> {platoon} </StatLabel>
                                        <StatNumber>
                                            <Badge
                                                fontSize="lg"
                                                colorScheme="purple"
                                            >
                                                {data.attendeeNumbers[
                                                    platoon
                                                ] || 0}{" "}
                                                /{" "}
                                                {
                                                    data.sortedByPlatoon[
                                                        platoon
                                                    ].length
                                                }
                                            </Badge>
                                        </StatNumber>
                                    </Stat>
                                )
                            )}

                        {/* <SimpleGrid columns={2} spacing={2} alignItems="center">
                            <Button colorScheme="teal" onClick={editUser}>
                                Edit
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={() => setIsDeleteUserOpen(true)}
                            >
                                Delete
                            </Button>
                        </SimpleGrid> */}
                    </SimpleGrid>
                </GridItem>
                <GridItem colSpan={5} mt={{ base: 2, lg: 0 }}>
                    <Alert status="info" mb={2}>
                        <AlertIcon />
                        <Flex flexWrap="wrap">
                            <Text>
                                Personnel location and statuses as it appears on{" "}
                                {activityDate}.
                            </Text>
                        </Flex>
                    </Alert>
                    <Accordion
                        defaultIndex={[0]}
                        allowMultiple
                        allowToggle
                        index={index}
                        onChange={(e) => handleAccordion(e as number[])}
                    >
                        {data &&
                            Object.keys(data.sortedByPlatoon).map(
                                (platoon, index) => (
                                    <PlatoonAccordianItem
                                        key={index}
                                        personnel={
                                            data.sortedByPlatoon[platoon]
                                        }
                                        platoon={platoon}
                                        attendee_IDs={data.attendees_IDs}
                                        absentee_IDs={data.absentees_IDs}
                                        // search={search}
                                        absentees={data.absentees}
                                    />
                                )
                            )}
                    </Accordion>
                </GridItem>
            </Grid>
        </Stack>
    );
};

export default IndividualActivityPage;
