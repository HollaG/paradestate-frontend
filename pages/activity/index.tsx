import {
    Heading,
    Accordion,
    Center,
    Button,
    AccordionButton,
    Text,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Collapse,
    Divider,
    Flex,
    Link,
    SimpleGrid,
    Stack,
    Tag,
    TagLabel,
    Skeleton,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Spacer,
} from "@chakra-ui/react";
import { addDays, format, isAfter } from "date-fns";
import { useSession } from "next-auth/react";
import { useMemo, useState, useEffect, useRef } from "react";

import useSWR from "swr";

import BasicCard from "../../components/Card/BasicCard";

import { NextProtectedPage } from "../../lib/auth";
import fetcher, { sendPOST } from "../../lib/fetcher";
import { Activity } from "../../types/activity";
import { ExtendedPersonnel } from "../../types/database";

import Assignments from "../../config/assignments.json";
import NextLink from "next/link";
import ActivityCalendar, {
    CustomEvent,
} from "../../components/Calendar/ActivityCalendar";
import { Event } from "react-big-calendar";
import { useRouter } from "next/router";

import { isBefore, isSameDay, subDays } from "date-fns";
const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    selectedDate: Date;
    search: string;
}> = ({ person, selectedDate, search }) => {
    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    return (
        <Collapse in={isVisible} animateOpacity>
            <SimpleGrid columns={{ sm: 1, lg: 2 }} my={3} spacing="6px">
                <Box>
                    {/* <Flex align="center"> */}
                    <Stack direction="row">
                        <Center>
                            <Badge colorScheme="purple">{person.pes}</Badge>
                        </Center>
                        <Text fontWeight="semibold">
                            <Link
                                isExternal
                                href={`/personnel/manage/${person.personnel_ID}`}
                            >
                                {person.rank} {person.name}
                            </Link>
                        </Text>
                    </Stack>
                    {/* </Flex> */}
                    <Flex align="center">
                        {/* <Icon as={icon} mr={1} color={textColor} /> */}
                        {/* <Text textColor={textColor}> {person.location}</Text> */}
                        <Stack direction="row" my={1}>
                            {person.location === "In camp" && (
                                // <Badge colorScheme="green" variant="subtle"> In camp </Badge>
                                <Tag
                                    size="sm"
                                    variant="subtle"
                                    colorScheme="green"
                                >
                                    {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}
                                    <TagLabel> In camp </TagLabel>
                                </Tag>
                            )}
                        </Stack>
                    </Flex>
                </Box>
                {/* <Spacer /> */}
            </SimpleGrid>

            <Divider />
        </Collapse>
    );
};
const PlatoonAccordianItem: React.FC<{
    personnel: ExtendedPersonnel[];
    platoon: string;
    selectedDate: Date;
    // search: string;
}> = ({
    personnel,
    platoon,
    selectedDate,
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
                    {rendered &&
                        personnel.map((person, index) => (
                            <PersonAccordionItem
                                selectedDate={selectedDate}
                                key={index}
                                person={person}
                                search={""}
                            />
                        ))}
                </AccordionPanel>
            </>
        </AccordionItem>
    );
};

const ActivityCard: React.FC<{ activity: Activity; data: PageData }> = ({
    activity,
    data,
}) => {
    let activityDateText = `Upcoming activity on ${format(
        new Date(activity.date),
        Assignments.dateformat
    )}`;
    if (isSameDay(new Date(activity.date), new Date()))
        activityDateText = `Activity today (${format(
            new Date(activity.date),
            Assignments.dateformat
        )})`;
    if (isBefore(new Date(activity.date), subDays(new Date(), 1)))
        activityDateText = `Past activity on ${format(
            new Date(activity.date),
            Assignments.dateformat
        )}`;

    // TODO - what do we do with the old activities?  do we hide them or show them
    // we can use TABS again?
    if (isBefore(new Date(activity.date), subDays(new Date(), 1))) return null;
    return (
        <BasicCard>
            <Stat>
                <StatLabel>{activityDateText}</StatLabel>
                <StatNumber>
                    <Skeleton
                        isLoaded={!!data}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Flex width="100%" alignItems="center">
                            <Text> {activity.name} </Text>
                            <Spacer />
                            <NextLink
                                href={`/activity/${activity.activity_ID}`}
                                passHref
                            >
                                <Button size="xs" colorScheme="teal" as={Link}>
                                    View
                                </Button>
                            </NextLink>
                        </Flex>
                    </Skeleton>
                </StatNumber>
                <StatHelpText>
                    <Skeleton isLoaded={!!data} height="21px">
                        {activity.type} |{" "}
                        {data.attendeesGroupedByActivityID[activity.activity_ID]
                            ? data.attendeesGroupedByActivityID[
                                  activity.activity_ID
                              ].length
                            : 0}{" "}
                        /{" "}
                        {(data.absenteesGroupedByActivityID[
                            activity.activity_ID
                        ]
                            ? data.absenteesGroupedByActivityID[
                                  activity.activity_ID
                              ].length
                            : 0) +
                            (data.attendeesGroupedByActivityID[
                                activity.activity_ID
                            ]
                                ? data.attendeesGroupedByActivityID[
                                      activity.activity_ID
                                  ].length
                                : 0)}{" "}
                        |{" "}
                        {activity.start_date !== activity.end_date &&
                            `Day ${activity.day}`}
                    </Skeleton>
                </StatHelpText>
            </Stat>
        </BasicCard>
    );
};
interface PageData {
    sortedByPlatoon: { [key: string]: ExtendedPersonnel[] };
    selectedDate: string;
    upcomingActivities: Activity[];
    attendeesGroupedByActivityID: {
        [key: number]: number[];
    };
    absenteesGroupedByActivityID: {
        [key: number]: number[];
    };
    calendarData: CustomEvent[];
}
const ActivityHomePage: NextProtectedPage = () => {
    // useEffect(() => {
    //     sendPOST("/api/activity/maintenance/refreshAll", {}).then(console.log);
    // }, []);
    const { data, error } = useSWR<PageData>("/api/activity", fetcher);

    const { data: session } = useSession();

    const defaultIndex = useMemo(
        () => [
            Object.keys(data?.sortedByPlatoon || {}).indexOf(
                session?.user.platoon || ""
            ),
        ],
        [data, session]
    );
    const selectedDate = data?.selectedDate
        ? new Date(data?.selectedDate)
        : new Date();
    const [index, setIndex] = useState(defaultIndex); // todo - set this to the user platoon
    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };
    // useEffect(() => {
    //     // if (search.length && data?.sortedByPlatoon) {
    //     //     // do stuff
    //     //     // Open all the tabs
    //     //     setIndex(
    //     //         Object.keys(data.sortedByPlatoon).map((_, index) => index)
    //     //     );
    //     // } else {
    //     setIndex(defaultIndex);
    //     // }
    // }, [data?.sortedByPlatoon, defaultIndex]);

    const router = useRouter();
    const [activity_ID, setActivity_ID] = useState<number>();
    const activityRef = useRef<HTMLDivElement>(null);
    // const eventClickHandler = (event: CustomEvent) => {
    //     setActivity_ID(event.activity_ID);
    //     // activityRef.current?.scrollIntoView({
    //     //     behavior: "smooth",

    //     // })
    // };
    const eventClickHandler = (event: CustomEvent) =>
        router.push(`/activity/${event.activity_ID}`);
    return (
        <>
            {data && data.upcomingActivities && (
                <Stack direction="column">
                    <Heading textAlign="center"> Activity agenda </Heading>

                    {/* {activity_ID && (
                        <Box ref={activityRef}>
                            <IndividualActivityComponent
                                activity_ID={activity_ID}
                            />
                        </Box>
                    )} */}

                    <ActivityCalendar
                        data={data.calendarData || []}
                        onClick={eventClickHandler}
                    />
                    <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                        {data.upcomingActivities.map((activity, index) => (
                            <ActivityCard
                                key={index}
                                activity={activity}
                                data={data}
                            />
                        ))}
                    </SimpleGrid>

                    {/* <Accordion
                        // defaultIndex={[0]}
                        allowMultiple
                        allowToggle
                        index={index}
                        onChange={(e) => handleAccordion(e as number[])}
                    >
                        {Object.keys(data.sortedByPlatoon).map(
                            (platoon, index) => (
                                <PlatoonAccordianItem
                                    selectedDate={selectedDate}
                                    key={index}
                                    personnel={data.sortedByPlatoon[platoon]}
                                    platoon={platoon}
                                    // search={search}
                                />
                            )
                        )}
                    </Accordion> */}
                </Stack>
            )}
            {data && !data.upcomingActivities && (
                <Heading>No activities yet!</Heading>
            )}
        </>
    );
};

ActivityHomePage.requireAuth = true;

export default ActivityHomePage;
