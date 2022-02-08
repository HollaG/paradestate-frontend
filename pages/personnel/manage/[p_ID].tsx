// TODO - simplify the code by splitting the repetitive parts into functions
import {
    Avatar,
    Badge,
    Box,
    Center,
    Flex,
    Grid,
    GridItem,
    Heading,
    SimpleGrid,
    Stack,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Tag,
    TagLabel,
    Text,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { NextProtectedPage } from "../../../lib/auth";
import fetcher from "../../../lib/fetcher";
import { Personnel } from "../../../types/database";
import Assignments from "../../../config/assignments.json";
import { format } from "date-fns";
import {
    calculateMonthsToOrFrom,
    capitalizeFirstLetter,
    convertToAMPM,
} from "../../../lib/custom";
import CustomCalendar from "../../../components/Calendar/CustomCalendar";
import { Event } from "react-big-calendar";
import {
    Data,
    ExtendedStatus,
    GenericEvent,
    MAEvent,
    OffOrLeaveEvent,
    OtherEvent,
} from "../../../types/types";
import {
    AddedAttCOrCourse,
    AddedLeaveOrOff,
    AddedMA,
    AddedOthers,
} from "../../../components/Dashboard/AddedEvent";
import StatusEntry from "../../../components/Personnel/Status/StatusEntry";
import ClickedContainerWrapper from "../../../components/Common/ClickedContainerWrapper";

export interface PersonnelPageData {
    person: Personnel;
    eventData: {
        offs: {
            offsExpired: OffOrLeaveEvent[];
            offsActive: OffOrLeaveEvent[];
            offsUpcoming: OffOrLeaveEvent[];
        };
        leaves: {
            leavesExpired: OffOrLeaveEvent[];
            leavesActive: OffOrLeaveEvent[];
            leavesUpcoming: OffOrLeaveEvent[];
        };
        attcs: {
            attcsExpired: GenericEvent[];
            attcsActive: GenericEvent[];
            attcsUpcoming: GenericEvent[];
        };
        mas: {
            masUpcoming: MAEvent[];
            masActive: MAEvent[];
            masExpired: MAEvent[];
        };
        courses: {
            coursesExpired: GenericEvent[];
            coursesActive: GenericEvent[];
            coursesUpcoming: GenericEvent[];
        };
        others: {
            othersExpired: OtherEvent[];
            othersActive: OtherEvent[];
            othersUpcoming: OtherEvent[];
        };
        statuses: {
            statusesActive: ExtendedStatus[];
            statusesInactive: ExtendedStatus[];
            statusesDuplicates: ExtendedStatus[];
        };
    };
    calendarData: Event[];
    locationArr: (keyof Data)[];
    onStatus: boolean;
}
const PersonnelPage: NextProtectedPage = () => {
    const router = useRouter();

    const { data, error } = useSWR<PersonnelPageData>(
        `/api/personnel/manage/${router.query.p_ID}`,
        fetcher
    );
    console.log({data});

    const [clickedType, setClickedType] = useState(null);
    const [clickedID, setClickedID] = useState(null);
    const [refresher, setRefresher] = useState(false);
    const eventOnClick = React.useCallback(
        (event: any) => {
            // router.push(`${router.asPath}#${event.type}-${event.id}`);
            setClickedType(event.type ?? "status");
            setClickedID(event.id ?? null);
            setRefresher((prev) => !prev);
        },
        [setClickedType, setClickedID, setRefresher]
    );
    const scrollRef = useRef<HTMLDivElement>(null);
        console.log({clickedType, clickedID})
    useEffect(() => {
        if (scrollRef && scrollRef.current) {
            window.scrollTo({
                top:
                    scrollRef.current.offsetTop -
                    (window.innerHeight - scrollRef.current.offsetHeight) / 2,
                left: 0,
                behavior: "smooth",
            });
        }
    }, [scrollRef, refresher]);
    return (
        <>
            {router && data && data.person ? (
                <Stack direction="column">
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
                                    src="/user.png"
                                    size="2xl"
                                    name={data.person.name}
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
                                {/* <Stack direction="row" alignItems="center">
                                     <Box>
                                        <Badge
                                            colorScheme="purple"
                                            fontSize={{ base: "lg", lg: "2xl" }}
                                        >
                                            {data.person.pes}
                                        </Badge>
                                    </Box> 
                                    <Heading size="2xl" textAlign="center">
                                        {data.person.rank} {data.person.name}
                                    </Heading>
                                </Stack> */}
                                <Box
                                    // columns={{ base: 1, lg: 2 }}
                                    // spacing={2}
                                    // re
                                    display={{ base: "block", lg: "flex" }}
                                    flexDirection="row-reverse"
                                >
                                    
                                    <Flex
                                        gridRow={{ base: 1, lg: "unset" }}
                                        alignItems="center"
                                        justifyContent={{
                                            base: "center",
                                            lg: "unset",
                                        }}
                                        wrap="wrap"
                                    >
                                        {/* <Badge
                                            colorScheme="purple"
                                            // fontSize={{ base: "lg", lg: "2xl" }}
                                        >
                                            {data.onStatus
                                                ? "On status"
                                                : "No active status"}
                                        </Badge> */}
                                        {data.locationArr.length ? (
                                            data.locationArr.map(
                                                (location, index) => (
                                                    <Tag
                                                        colorScheme="red"
                                                        key={index}
                                                        mr={1}
                                                    >
                                                        <TagLabel>
                                                            On{" "}
                                                            {capitalizeFirstLetter(
                                                                location
                                                            )}
                                                        </TagLabel>
                                                    </Tag>
                                                )
                                            )
                                        ) : (
                                            <Tag colorScheme="green" mr={1}>
                                                <TagLabel>In camp</TagLabel>
                                            </Tag>
                                        )}
                                        <Tag
                                            colorScheme={
                                                data.onStatus ? "red" : "green"
                                            }
                                        >
                                            <TagLabel>
                                                {data.onStatus
                                                    ? "On status"
                                                    : "No active status"}
                                            </TagLabel>
                                        </Tag>
                                    </Flex>
                                    <Heading
                                        size="2xl"
                                        textAlign="center"
                                        mr={{ base: 0, lg: 2 }}
                                    >
                                        {data.person.rank} {data.person.name}
                                    </Heading>
                                </Box>
                                <Flex
                                    justifyContent={{
                                        base: "center",
                                        lg: "unset",
                                    }}
                                >
                                    {/* <Tag
                                        variant="solid"
                                        colorScheme="teal"
                                        size="lg"
                                        mt={2}
                                    >
                                        <TagLabel>
                                            {" "}
                                            {data.person.platoon}
                                        </TagLabel>
                                    </Tag> */}
                                    <Text
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        textAlign="center"
                                    >
                                        {data.person.unit} {data.person.company}{" "}
                                        {data.person.platoon}
                                    </Text>
                                </Flex>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <SimpleGrid
                                columns={{ base: 2, lg: 1 }}
                                spacing={2}
                            >
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Service status </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.svc_status}
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> PES </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.pes}
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Post-in </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {" "}
                                            {format(
                                                new Date(data.person.post_in),
                                                Assignments.dateformat
                                            )}
                                        </Badge>
                                    </StatNumber>
                                    <StatHelpText>
                                        {calculateMonthsToOrFrom([
                                            new Date(data.person.post_in),
                                            new Date(),
                                        ])}
                                    </StatHelpText>
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> ORD </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {format(
                                                new Date(data.person.ord),
                                                Assignments.dateformat
                                            )}
                                        </Badge>
                                    </StatNumber>
                                    <StatHelpText>
                                        {calculateMonthsToOrFrom([
                                            new Date(data.person.ord),
                                            new Date(),
                                        ])}
                                    </StatHelpText>
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Leaves taken </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.leave_balance} days
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText> </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Offs taken </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.off_balance} days
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText> </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Personnel ID</StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.personnel_ID}
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText>
                            {" "}
                            For internal reference only{" "}
                        </StatHelpText> */}
                                </Stat>
                            </SimpleGrid>
                        </GridItem>
                        <GridItem colSpan={5} mt={2}>
                            <CustomCalendar
                                data={data}
                                onClick={eventOnClick}
                            />
                        </GridItem>
                        <GridItem></GridItem>
                        <GridItem colSpan={5}>
                            <Stack direction="column">
                                <Stack direction="column">
                                    <Heading> Offs </Heading>
                                    <Stack direction="column">
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Active (
                                                {
                                                    data.eventData.offs
                                                        .offsActive.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.offs.offsActive.map(
                                                (off, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "off" &&
                                                            clickedID ===
                                                                off.row_ID
                                                        }
                                                        scrollId={`off-${off.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedLeaveOrOff
                                                            data={{
                                                                "end-time":
                                                                    off.end_time,
                                                                "start-time":
                                                                    off.start_time,
                                                                date: [
                                                                    off.start.toString(),
                                                                    off.end.toString(),
                                                                ],
                                                                reason: off.reason,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Upcoming (
                                                {
                                                    data.eventData.offs
                                                        .offsUpcoming.length
                                                }
                                                )
                                            </Text>{" "}
                                            {data.eventData.offs.offsUpcoming.map(
                                                (off, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "off" &&
                                                            clickedID ===
                                                                off.row_ID
                                                        }
                                                        scrollId={`off-${off.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedLeaveOrOff
                                                            data={{
                                                                "end-time":
                                                                    off.end_time,
                                                                "start-time":
                                                                    off.start_time,
                                                                date: [
                                                                    off.start.toString(),
                                                                    off.end.toString(),
                                                                ],
                                                                reason: off.reason,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Expired (
                                                {
                                                    data.eventData.offs
                                                        .offsExpired.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.offs.offsExpired.map(
                                                (off, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "off" &&
                                                            clickedID ===
                                                                off.row_ID
                                                        }
                                                        scrollId={`off-${off.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedLeaveOrOff
                                                            data={{
                                                                "end-time":
                                                                    off.end_time,
                                                                "start-time":
                                                                    off.start_time,
                                                                date: [
                                                                    off.start.toString(),
                                                                    off.end.toString(),
                                                                ],
                                                                reason: off.reason,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Stack direction="column">
                                    <Heading> Leaves </Heading>
                                    <Stack direction="column">
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Active (
                                                {
                                                    data.eventData.leaves
                                                        .leavesActive.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.leaves.leavesActive.map(
                                                (leave, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "leave" &&
                                                            clickedID ===
                                                                leave.row_ID
                                                        }
                                                        scrollId={`leave-${leave.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedLeaveOrOff
                                                            data={{
                                                                "end-time":
                                                                    leave.end_time,
                                                                "start-time":
                                                                    leave.start_time,
                                                                date: [
                                                                    leave.start.toString(),
                                                                    leave.end.toString(),
                                                                ],
                                                                reason: leave.reason,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Upcoming (
                                                {
                                                    data.eventData.leaves
                                                        .leavesUpcoming.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.leaves.leavesUpcoming.map(
                                                (leave, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "leave" &&
                                                            clickedID ===
                                                                leave.row_ID
                                                        }
                                                        scrollId={`leave-${leave.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedLeaveOrOff
                                                            data={{
                                                                "end-time":
                                                                    leave.end_time,
                                                                "start-time":
                                                                    leave.start_time,
                                                                date: [
                                                                    leave.start.toString(),
                                                                    leave.end.toString(),
                                                                ],
                                                                reason: leave.reason,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Expired (
                                                {
                                                    data.eventData.leaves
                                                        .leavesExpired.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.leaves.leavesExpired.map(
                                                (leave, index) => (
                                                    <ClickedContainerWrapper
                                                        condition={
                                                            clickedType ===
                                                                "leave" &&
                                                            clickedID ===
                                                                leave.row_ID
                                                        }
                                                        scrollId={`leave-${leave.row_ID}`}
                                                        ref={scrollRef}
                                                        key={index}
                                                    >
                                                        <AddedLeaveOrOff
                                                            data={{
                                                                "end-time":
                                                                    leave.end_time,
                                                                "start-time":
                                                                    leave.start_time,
                                                                date: [
                                                                    leave.start.toString(),
                                                                    leave.end.toString(),
                                                                ],
                                                                reason: leave.reason,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Stack direction="column">
                                    <Heading> AttCs </Heading>
                                    <Stack direction="column">
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Active (
                                                {
                                                    data.eventData.attcs
                                                        .attcsActive.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.attcs.attcsActive.map(
                                                (attc, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "attc" &&
                                                            clickedID ===
                                                                attc.row_ID
                                                        }
                                                        scrollId={`attc-${attc.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedAttCOrCourse
                                                            data={{
                                                                date: [
                                                                    attc.start.toString(),
                                                                    attc.end.toString(),
                                                                ],
                                                                reason: attc.attc_name,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Upcoming (
                                                {
                                                    data.eventData.attcs
                                                        .attcsUpcoming.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.attcs.attcsUpcoming.map(
                                                (attc, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "attc" &&
                                                            clickedID ===
                                                                attc.row_ID
                                                        }
                                                        scrollId={`attc-${attc.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedAttCOrCourse
                                                            data={{
                                                                date: [
                                                                    attc.start.toString(),
                                                                    attc.end.toString(),
                                                                ],
                                                                reason: attc.attc_name,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Expired (
                                                {
                                                    data.eventData.attcs
                                                        .attcsExpired.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.attcs.attcsExpired.map(
                                                (attc, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "attc" &&
                                                            clickedID ===
                                                                attc.row_ID
                                                        }
                                                        scrollId={`attc-${attc.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedAttCOrCourse
                                                            data={{
                                                                date: [
                                                                    attc.start.toString(),
                                                                    attc.end.toString(),
                                                                ],
                                                                reason: attc.attc_name,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Stack direction="column">
                                    <Heading> Courses </Heading>
                                    <Stack direction="column">
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Active (
                                                {
                                                    data.eventData.courses
                                                        .coursesActive.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.courses.coursesActive.map(
                                                (course, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "course" &&
                                                            clickedID ===
                                                                course.row_ID
                                                        }
                                                        scrollId={`course-${course.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedAttCOrCourse
                                                            data={{
                                                                date: [
                                                                    course.start.toString(),
                                                                    course.end.toString(),
                                                                ],
                                                                reason: course.course_name,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Upcoming (
                                                {
                                                    data.eventData.courses
                                                        .coursesUpcoming.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.courses.coursesUpcoming.map(
                                                (course, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "course" &&
                                                            clickedID ===
                                                                course.row_ID
                                                        }
                                                        scrollId={`course-${course.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedAttCOrCourse
                                                            data={{
                                                                date: [
                                                                    course.start.toString(),
                                                                    course.end.toString(),
                                                                ],
                                                                reason: course.course_name,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Expired (
                                                {
                                                    data.eventData.courses
                                                        .coursesExpired.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.courses.coursesExpired.map(
                                                (course, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "course" &&
                                                            clickedID ===
                                                                course.row_ID
                                                        }
                                                        scrollId={`course-${course.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedAttCOrCourse
                                                            data={{
                                                                date: [
                                                                    course.start.toString(),
                                                                    course.end.toString(),
                                                                ],
                                                                reason: course.course_name,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Stack direction="column">
                                    <Heading> Medical Appointments </Heading>
                                    <Stack direction="column">
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Active (
                                                {
                                                    data.eventData.mas.masActive
                                                        .length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.mas.masActive.map(
                                                (ma, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "ma" &&
                                                            clickedID ===
                                                                ma.row_ID
                                                        }
                                                        scrollId={`ma-${ma.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedMA
                                                            data={{
                                                                name: ma.ma_name,
                                                                location:
                                                                    ma.location,
                                                                incamp: ma.in_camp,
                                                                "date-time-formatted": `${format(
                                                                    new Date(
                                                                        ma.date
                                                                    ),
                                                                    Assignments.dateformat
                                                                )} ${convertToAMPM(
                                                                    ma.time
                                                                )}`,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Upcoming (
                                                {
                                                    data.eventData.mas
                                                        .masUpcoming.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.mas.masUpcoming.map(
                                                (ma, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "ma" &&
                                                            clickedID ===
                                                                ma.row_ID
                                                        }
                                                        scrollId={`ma-${ma.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedMA
                                                            data={{
                                                                name: ma.ma_name,
                                                                location:
                                                                    ma.location,
                                                                incamp: ma.in_camp,
                                                                "date-time-formatted": `${format(
                                                                    new Date(
                                                                        ma.date
                                                                    ),
                                                                    Assignments.dateformat
                                                                )} ${convertToAMPM(
                                                                    ma.time
                                                                )}`,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Expired (
                                                {
                                                    data.eventData.mas
                                                        .masExpired.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.mas.masExpired.map(
                                                (ma, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "ma" &&
                                                            clickedID ===
                                                                ma.row_ID
                                                        }
                                                        scrollId={`ma-${ma.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedMA
                                                            data={{
                                                                name: ma.ma_name,
                                                                location:
                                                                    ma.location,
                                                                incamp: ma.in_camp,
                                                                "date-time-formatted": `${format(
                                                                    new Date(
                                                                        ma.date
                                                                    ),
                                                                    Assignments.dateformat
                                                                )} ${convertToAMPM(
                                                                    ma.time
                                                                )}`,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Stack direction="column">
                                    <Heading> Others </Heading>
                                    <Stack direction="column">
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Active (
                                                {
                                                    data.eventData.others
                                                        .othersActive.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.others.othersActive.map(
                                                (other, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "others" &&
                                                            clickedID ===
                                                                other.row_ID
                                                        }
                                                        scrollId={`others-${other.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedOthers
                                                            data={{
                                                                date: [
                                                                    other.start.toString(),
                                                                    other.end.toString(),
                                                                ],
                                                                name: other.others_name,
                                                                incamp: other.in_camp,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Upcoming (
                                                {
                                                    data.eventData.others
                                                        .othersUpcoming.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.others.othersUpcoming.map(
                                                (other, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "others" &&
                                                            clickedID ===
                                                                other.row_ID
                                                        }
                                                        scrollId={`others-${other.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedOthers
                                                            data={{
                                                                date: [
                                                                    other.start.toString(),
                                                                    other.end.toString(),
                                                                ],
                                                                name: other.others_name,
                                                                incamp: other.in_camp,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Expired (
                                                {
                                                    data.eventData.others
                                                        .othersExpired.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.others.othersExpired.map(
                                                (other, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "others" &&
                                                            clickedID ===
                                                                other.row_ID
                                                        }
                                                        scrollId={`others-${other.row_ID}`}
                                                        ref={scrollRef}
                                                    >
                                                        <AddedOthers
                                                            data={{
                                                                date: [
                                                                    other.start.toString(),
                                                                    other.end.toString(),
                                                                ],
                                                                name: other.others_name,
                                                                incamp: other.in_camp,
                                                            }}
                                                        />
                                                    </ClickedContainerWrapper>
                                                )
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Stack direction="column">
                                    <Heading> Statuses </Heading>
                                    <Stack direction="column">
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Active (
                                                {
                                                    data.eventData.statuses
                                                        .statusesActive.length
                                                }
                                                )
                                            </Text>
                                            {data.eventData.statuses.statusesActive.map(
                                                (status, index) => (
                                                    <StatusEntry
                                                        key={index}
                                                        status={status}
                                                    />
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Inactive (
                                                {
                                                    data.eventData.statuses
                                                        .statusesInactive.length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.statuses.statusesInactive.map(
                                                (status, index) => (
                                                    <StatusEntry
                                                        key={index}
                                                        status={status}
                                                    />
                                                )
                                            )}
                                        </Box>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="bold"
                                            >
                                                Duplicates (
                                                {
                                                    data.eventData.statuses
                                                        .statusesDuplicates
                                                        .length
                                                }
                                                )
                                            </Text>

                                            {data.eventData.statuses.statusesDuplicates.map(
                                                (status, index) => (
                                                    <StatusEntry
                                                        key={index}
                                                        status={status}
                                                    />
                                                )
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </GridItem>
                    </Grid>
                </Stack>
            ) : (
                <> Loading data... </>
            )}
        </>
    );
};

PersonnelPage.requireAuth = true;
export default React.memo(PersonnelPage);
