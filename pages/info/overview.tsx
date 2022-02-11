import BasicCard from "../../components/Card/BasicCard";
import { NextProtectedPage } from "../../lib/auth";
import Assignments from "../../config/assignments.json";
import {
    Box,
    Button,
    Center,
    Collapse,
    Flex,
    Heading,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Skeleton,
    Stack,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { format, getDay } from "date-fns";
import useSWR from "swr";
import fetcher from "../../lib/fetcher";
import { ExtendedPersonnel } from "../../types/database";
import { ExtendedStatus } from "../../types/types";
import { IoSearchOutline } from "react-icons/io5";
import { useRef, useState } from "react";
import AllCard from "../../components/Info/Overview/AllCard";
import OffCard from "../../components/Info/Overview/OffCard";
import LeaveCard from "../../components/Info/Overview/LeaveCard";
import AttcCard from "../../components/Info/Overview/AttCCard";
import CourseCard from "../../components/Info/Overview/CourseCard";
import MaCard from "../../components/Info/Overview/MACard";
import OthersCard from "../../components/Info/Overview/OthersCard";
import { SortedObject, SortedStatusObject } from "../api/info/overview";
import StatusCard from "../../components/Info/Overview/StatusCard";

const Dates = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
const types = [
    "All",
    "In camp",
    "Out of camp",
    "Off",
    "Leave",
    "AttC",
    "Course",
    "Others",
    "MA",
    "Status",
];
interface OverviewData {
    sortedByPlatoon: {
        [key: string]: ExtendedPersonnel[];
    };

    numbers: {
        total: number;
        commitments: number;
        numberOfMAsInCamp: number;
        platoonNumbers: {
            [key: string]: {
                in: number;
                out: number;
            };
        };
        off: number;
        leave: number;
        attc: number;
        course: number;
        ma: number;
        others: number;
        status: number;
    };

    statusesSortedByPersonnelID: {
        [key: string]: ExtendedStatus[];
    };
    offSortedByPlatoonThenID: SortedObject;
    leaveSortedByPlatoonThenID: SortedObject;
    attcSortedByPlatoonThenID: SortedObject;
    courseSortedByPlatoonThenID: SortedObject;
    maSortedByPlatoonThenID: SortedObject;
    othersSortedByPlatoonThenID: SortedObject;
    statusesSortedByPlatoonThenID: SortedStatusObject;
}
const OverviewPage: NextProtectedPage = () => {
    const { data, error } = useSWR<OverviewData>("/api/info/overview", fetcher);
    console.log({ error });
    console.log(data);
    const selectedDate = new Date();

    const [searchValue, setSearchValue] = useState("");
    const [type, setType] = useState<typeof types[number]>("All");

    const infoRef = useRef<HTMLDivElement>(null);
    const setTypeWithScroll = (type: typeof types[number]) => {
        // TODO implement better scrolling lol
        infoRef?.current?.scrollIntoView({
            behavior: "smooth",
        });
        setType(type);
    };

    return (
        <Stack direction="column" spacing={6}>
            <Box>
                <Center>
                    <Heading>{format(selectedDate, "eee d LLL yyyy")}</Heading>
                </Center>
                <Center>
                    <Text textAlign="center" fontSize="sm" fontWeight="light">
                        Note: MA (in camp), Others (in camp), Leave (PM) and Off
                        (PM) are not counted as being in camp here.
                    </Text>
                </Center>
            </Box>
            <SimpleGrid
                columns={{
                    base: 2,
                    // sm: 2,
                    lg: 4,
                }}
                spacing={6}
            >
                <BasicCard>
                    <Stat>
                        <StatLabel> Personnel </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {!!data &&
                                    data?.numbers?.total -
                                        data?.numbers.commitments}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("All")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                {data?.numbers.total} total,{" "}
                                {data?.numbers.commitments} w/ commitments
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Medical Appointments </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.numbers.ma}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("MA")}
                                >
                                    {" "}
                                    View{" "}
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                {data && !!data.numbers.ma && (
                                    <>
                                        {data.numbers.numberOfMAsInCamp}{" "}
                                        in camp,
                                        {" "}{data.numbers.ma -
                                            data.numbers.numberOfMAsInCamp}{" "}
                                        out
                                    </>
                                )}
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Off </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.numbers.off}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Off")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        {/* <StatHelpText></StatHelpText> */}
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Leave </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.numbers.leave}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Leave")}
                                >
                                    {" "}
                                    View{" "}
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        {/* <StatHelpText></StatHelpText> */}
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Attend C </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.numbers.attc}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("AttC")}
                                >
                                    {" "}
                                    View{" "}
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        {/* <StatHelpText></StatHelpText> */}
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Course </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.numbers.course}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Course")}
                                >
                                    {" "}
                                    View{" "}
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        {/* <StatHelpText></StatHelpText> */}
                    </Stat>
                </BasicCard>

                <BasicCard>
                    <Stat>
                        <StatLabel> Other Appointments </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.numbers.others}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Others")}
                                >
                                    {" "}
                                    View{" "}
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        {/* <StatHelpText></StatHelpText> */}
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Statuses </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {
                                    Object.keys(
                                        data?.statusesSortedByPersonnelID || {}
                                    ).length
                                }
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Status")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        {/* <StatHelpText></StatHelpText> */}
                    </Stat>
                </BasicCard>
            </SimpleGrid>
            <SimpleGrid
                spacing={6}
                columns={{
                    base: 2,
                    sm: 2,
                    md: 3,
                    lg: 5,
                }}
            >
                {data &&
                    Object.keys(data.numbers.platoonNumbers || {}).map(
                        (platoon, index) => (
                            <BasicCard key={index}>
                                <Stat>
                                    <StatLabel> {platoon} </StatLabel>
                                    <StatNumber>
                                        {
                                            data.numbers.platoonNumbers[platoon]
                                                .in
                                        }
                                        /
                                        {data.numbers.platoonNumbers[platoon]
                                            .in +
                                            data.numbers.platoonNumbers[platoon]
                                                .out}
                                    </StatNumber>
                                </Stat>
                            </BasicCard>
                        )
                    )}
                {!data &&
                    [0, 1, 2].map((_, index) => (
                        <BasicCard key={index}>
                            <Stat>
                                <StatLabel>
                                    <Skeleton isLoaded={!!data} height="21px" />
                                </StatLabel>
                                <StatNumber>
                                    <Skeleton isLoaded={!!data} height="36px" />
                                </StatNumber>
                            </Stat>
                        </BasicCard>
                    ))}
            </SimpleGrid>
            <BasicCard>
                <Stack direction="column" w="100%">
                    <Flex
                        justifyContent="space-between"
                        w="100%"
                        ref={infoRef}
                        mb={3}
                    >
                        <Box>
                            <InputGroup>
                                <InputLeftElement>
                                    <Icon as={IoSearchOutline} />
                                </InputLeftElement>
                                <Input
                                    value={searchValue}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                    placeholder="Search for personnel..."
                                />
                            </InputGroup>
                        </Box>
                        <Box ml={2}>
                            <Select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                {types.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                        </Box>
                    </Flex>
                    <Skeleton isLoaded={!!data} height={!data ? "50vh" : "auto"}>
                        {data && (
                            <Box w="100%">
                                <Collapse animateOpacity unmountOnExit
                                    in={
                                        data &&
                                        (type === "All" ||
                                            type === "In camp" ||
                                            type === "Out of camp")
                                    }
                                     
                                >
                                    <AllCard
                                        sortedByPlatoon={data.sortedByPlatoon}
                                        type={type}
                                    />
                                </Collapse>
                                {/* <Collapse animateOpacity unmountOnExit
                                in={data && type === "In camp"}
                                animateOpacity
                            >
                                <AllCard
                                    sortedByPlatoon={data.inCampSortedByPlatoon}
                                />
                            </Collapse> */}

                                <Collapse animateOpacity unmountOnExit in={type === "Off"}>
                                    <OffCard
                                        offSortedByPlatoonThenID={
                                            data.offSortedByPlatoonThenID
                                        }
                                    />
                                </Collapse>
                                <Collapse animateOpacity unmountOnExit in={type === "Leave"}>
                                    <LeaveCard
                                        leaveSortedByPlatoonThenID={
                                            data.leaveSortedByPlatoonThenID
                                        }
                                    />
                                </Collapse>
                                <Collapse animateOpacity unmountOnExit in={type === "AttC"}>
                                    <AttcCard
                                        attcSortedByPlatoonThenID={
                                            data.attcSortedByPlatoonThenID
                                        }
                                    />
                                </Collapse>
                                <Collapse animateOpacity unmountOnExit in={type === "Course"}>
                                    <CourseCard
                                        courseSortedByPlatoonThenID={
                                            data.courseSortedByPlatoonThenID
                                        }
                                    />
                                </Collapse>
                                <Collapse animateOpacity unmountOnExit in={type === "MA"}>
                                    <MaCard
                                        maSortedByPlatoonThenID={
                                            data.maSortedByPlatoonThenID
                                        }
                                    />
                                </Collapse>
                                <Collapse animateOpacity unmountOnExit in={type === "Others"}>
                                    <OthersCard
                                        othersSortedByPlatoonThenID={
                                            data.othersSortedByPlatoonThenID
                                        }
                                    />
                                </Collapse>
                                <Collapse animateOpacity unmountOnExit in={type === "Status"}>
                                    <StatusCard
                                        statusesSortedByPlatoonThenID={
                                            data.statusesSortedByPlatoonThenID
                                        }
                                    />
                                </Collapse>
                            </Box>
                        )}
                    </Skeleton>
                </Stack>
            </BasicCard>
        </Stack>
    );
};
OverviewPage.requireAuth = true;
export default OverviewPage;
