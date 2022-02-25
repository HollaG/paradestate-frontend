import {
    Avatar,
    Box,
    Button,
    Center,
    Collapse,
    Divider,
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
    Tag,
    Text,
} from "@chakra-ui/react";

import { ChangeEvent, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import useSWR from "swr";
import BasicCard from "../../components/Card/BasicCard";
import HistoryChart from "../../components/Info/Overview/Analytics/HistoryChart";

import PersonTemplate from "../../components/Info/Overview/Person";
import { NextProtectedPage } from "../../lib/auth";
import fetcher from "../../lib/fetcher";
import { ExtendedPersonnel } from "../../types/database";
const types = ["Off", "Leave", "AttC", "Course", "Others", "MA"];
const TrendsPage: NextProtectedPage = () => {
    const { data, error } = useSWR<{
        topData: {
            offData: ExtendedPersonnel[];
            leaveData: ExtendedPersonnel[];
            attcData: ExtendedPersonnel[];
            courseData: ExtendedPersonnel[];
            maData: ExtendedPersonnel[];
            othersData: ExtendedPersonnel[];
        };
    }>("/api/info/trends", fetcher);
    console.log(data);

    const [type, setType] = useState("Off");

    const infoRef = useRef<HTMLDivElement>(null);
    const setTypeWithScroll = (type: typeof types[number]) => {
        // TODO implement better scrolling lol
        infoRef?.current?.scrollIntoView({
            behavior: "smooth",
        });
        setType(type);
    };

    const [searchValue, setSearchValue] = useState("");
    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
        // if (type !== "All") setType("All");
    };
    return (
        <Stack direction="column" spacing={6}>
            <Box>
                <Center>
                    <Heading> Analytics </Heading>
                </Center>
            </Box>
            <BasicCard>
                <HistoryChart/>
            </BasicCard>
            <SimpleGrid
                columns={{
                    base: 1,
                    sm: 2,
                    lg: 3,
                }}
                spacing={6}
            >
                <BasicCard>
                    <Stat>
                        <StatLabel> Off (top taker) </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.topData?.offData?.[0].count} days
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Off")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                <Text width="fit-content">
                                    {" "}
                                    {data?.topData?.offData?.[0].rank}{" "}
                                    {data?.topData?.offData?.[0].name}
                                </Text>
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Leave (top taker) </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.topData?.leaveData?.[0].count} days
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Leave")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                <Text width="fit-content">
                                    {" "}
                                    {data?.topData?.leaveData?.[0].rank}{" "}
                                    {data?.topData?.leaveData?.[0].name}
                                </Text>
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> AttC (top taker) </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.topData?.attcData?.[0].count} days
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("AttC")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                <Text width="fit-content">
                                    {" "}
                                    {data?.topData?.attcData?.[0].rank}{" "}
                                    {data?.topData?.attcData?.[0].name}
                                </Text>
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Course (top taker) </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.topData?.courseData?.[0].count} days
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Course")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                <Text width="fit-content">
                                    {" "}
                                    {data?.topData?.courseData?.[0].rank}{" "}
                                    {data?.topData?.courseData?.[0].name}
                                </Text>
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> MA (top taker) </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.topData?.maData?.[0].count}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("MA")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                <Text width="fit-content">
                                    {" "}
                                    {data?.topData?.maData?.[0].rank}{" "}
                                    {data?.topData?.maData?.[0].name}
                                </Text>
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
                <BasicCard>
                    <Stat>
                        <StatLabel> Others (top taker) </StatLabel>
                        <StatNumber>
                            <Skeleton
                                isLoaded={!!data}
                                height="36px"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                {data?.topData?.othersData?.[0].count}
                                <Button
                                    size="xs"
                                    colorScheme="teal"
                                    onClick={() => setTypeWithScroll("Others")}
                                >
                                    View
                                </Button>
                            </Skeleton>
                        </StatNumber>
                        <StatHelpText>
                            <Skeleton isLoaded={!!data} height="21px">
                                <Text width="fit-content">
                                    {" "}
                                    {data?.topData?.othersData?.[0].rank}{" "}
                                    {data?.topData?.othersData?.[0].name}
                                </Text>
                            </Skeleton>
                        </StatHelpText>
                    </Stat>
                </BasicCard>
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
                                    onChange={handleSearch}
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
                    <Skeleton
                        isLoaded={!!data}
                        height={!data ? "50vh" : "auto"}
                    >
                        {data && (
                            <Box w="100%">
                                <Collapse
                                    animateOpacity
                                    unmountOnExit
                                    in={type === "Off"}
                                >
                                    {data.topData.offData && (
                                        <Stack
                                            direction="column"
                                            spacing={3}
                                            divider={<Divider />}
                                        >
                                            {data.topData.offData.map(
                                                (person, index) =>
                                                    (!searchValue.length ||
                                                        person.name.includes(
                                                            searchValue
                                                                .trim()
                                                                .toUpperCase()
                                                        )) ? (
                                                        <Stack
                                                            direction="row"
                                                            key={index}
                                                            align="center"
                                                        >
                                                            <Tag
                                                                colorScheme="teal"
                                                                width="40px"
                                                                textAlign="center"
                                                                justifyContent="center"
                                                            >
                                                                {person.count}
                                                            </Tag>
                                                            <PersonTemplate
                                                                person={person}
                                                            />
                                                        </Stack>
                                                    ) : null
                                            )}
                                        </Stack>
                                    )}
                                </Collapse>
                                <Collapse
                                    animateOpacity
                                    unmountOnExit
                                    in={type === "Leave"}
                                >
                                    {data.topData.leaveData && (
                                        <Stack
                                            direction="column"
                                            spacing={3}
                                            divider={<Divider />}
                                        >
                                            {data.topData.leaveData.map(
                                                (person, index) =>
                                                    (!searchValue.length ||
                                                        person.name.includes(
                                                            searchValue
                                                                .trim()
                                                                .toUpperCase()
                                                        )) ? (
                                                        <Stack
                                                            direction="row"
                                                            key={index}
                                                            align="center"
                                                        >
                                                            <Tag
                                                                colorScheme="teal"
                                                                width="40px"
                                                                textAlign="center"
                                                                justifyContent="center"
                                                            >
                                                                {person.count}
                                                            </Tag>
                                                            <PersonTemplate
                                                                person={person}
                                                            />
                                                        </Stack>
                                                    ) : null
                                            )}
                                        </Stack>
                                    )}
                                </Collapse>
                                <Collapse
                                    animateOpacity
                                    unmountOnExit
                                    in={type === "AttC"}
                                >
                                    {data.topData.attcData && (
                                        <Stack
                                            direction="column"
                                            spacing={3}
                                            divider={<Divider />}
                                        >
                                            {data.topData.attcData.map(
                                                (person, index) =>
                                                    (!searchValue.length ||
                                                        person.name.includes(
                                                            searchValue
                                                                .trim()
                                                                .toUpperCase()
                                                        )) ? (
                                                        <Stack
                                                            direction="row"
                                                            key={index}
                                                            align="center"
                                                        >
                                                            <Tag
                                                                colorScheme="teal"
                                                                width="40px"
                                                                textAlign="center"
                                                                justifyContent="center"
                                                            >
                                                                {person.count}
                                                            </Tag>
                                                            <PersonTemplate
                                                                person={person}
                                                            />
                                                        </Stack>
                                                    ) : null
                                            )}
                                        </Stack>
                                    )}
                                </Collapse>
                                <Collapse
                                    animateOpacity
                                    unmountOnExit
                                    in={type === "Course"}
                                >
                                    {data.topData.courseData && (
                                        <Stack
                                            direction="column"
                                            spacing={3}
                                            divider={<Divider />}
                                        >
                                            {data.topData.courseData.map(
                                                (person, index) =>
                                                    (!searchValue.length ||
                                                        person.name.includes(
                                                            searchValue
                                                                .trim()
                                                                .toUpperCase()
                                                        )) ? (
                                                        <Stack
                                                            direction="row"
                                                            key={index}
                                                            align="center"
                                                        >
                                                            <Tag
                                                                colorScheme="teal"
                                                                width="40px"
                                                                textAlign="center"
                                                                justifyContent="center"
                                                            >
                                                                {person.count}
                                                            </Tag>
                                                            <PersonTemplate
                                                                person={person}
                                                            />
                                                        </Stack>
                                                    ) : null
                                            )}
                                        </Stack>
                                    )}
                                </Collapse>
                                <Collapse
                                    animateOpacity
                                    unmountOnExit
                                    in={type === "MA"}
                                >
                                    {data.topData.maData && (
                                        <Stack
                                            direction="column"
                                            spacing={3}
                                            divider={<Divider />}
                                        >
                                            {data.topData.maData.map(
                                                (person, index) =>
                                                    (!searchValue.length ||
                                                        person.name.includes(
                                                            searchValue
                                                                .trim()
                                                                .toUpperCase()
                                                        )) ? (
                                                        <Stack
                                                            direction="row"
                                                            key={index}
                                                            align="center"
                                                        >
                                                            <Tag
                                                                colorScheme="teal"
                                                                width="40px"
                                                                textAlign="center"
                                                                justifyContent="center"
                                                            >
                                                                {person.count}
                                                            </Tag>
                                                            <PersonTemplate
                                                                person={person}
                                                            />
                                                        </Stack>
                                                    ) : null
                                            )}
                                        </Stack>
                                    )}
                                </Collapse>
                                <Collapse
                                    animateOpacity
                                    unmountOnExit
                                    in={type === "Others"}
                                >
                                    {data.topData.othersData && (
                                        <Stack
                                            direction="column"
                                            spacing={3}
                                            divider={<Divider />}
                                        >
                                            {data.topData.othersData.map(
                                                (person, index) =>
                                                    (!searchValue.length ||
                                                        person.name.includes(
                                                            searchValue
                                                                .trim()
                                                                .toUpperCase()
                                                        )) ? (
                                                        <Stack
                                                            direction="row"
                                                            key={index}
                                                            align="center"
                                                        >
                                                            <Tag
                                                                colorScheme="teal"
                                                                width="40px"
                                                                textAlign="center"
                                                                justifyContent="center"
                                                            >
                                                                {person.count}
                                                            </Tag>
                                                            <PersonTemplate
                                                                person={person}
                                                            />
                                                        </Stack>
                                                    ) : null
                                            )}
                                        </Stack>
                                    )}
                                </Collapse>
                            </Box>
                        )}
                    </Skeleton>
                </Stack>
            </BasicCard>
        </Stack>
    );
};

TrendsPage.requireAuth = true
export default TrendsPage;
