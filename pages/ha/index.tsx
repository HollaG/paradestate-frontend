import {
    Collapse,
    SimpleGrid,
    Box,
    Stack,
    Center,
    Badge,
    Flex,
    Tag,
    TagLabel,
    Divider,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Accordion,
    Text,
    Link,
    Heading,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@chakra-ui/react";
import { differenceInBusinessDays, differenceInDays, format } from "date-fns";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { NextProtectedPage } from "../../lib/auth";
import { isYearTwo } from "../../lib/custom";
import fetcher, { sendPOST } from "../../lib/fetcher";
import { Personnel } from "../../types/database";

import Assignments from "../../config/assignments.json";
import CustomLoadingBar from "../../components/Skeleton/LoadingBar";
const PersonAccordionItem: React.FC<{
    person: Personnel;
    selectedDate: Date;
    search: string;
}> = ({ person, selectedDate, search }) => {
    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    return (
        <Collapse in={isVisible} animateOpacity>
            <Stack direction="row" my={3}>
                <Center>
                    <Tag
                        colorScheme="teal"
                        width="30px"
                        textAlign="center"
                        justifyContent="center"
                    >
                        {/* Yr.{" "} */}
                        {isYearTwo(person.svc_status, new Date(person.ord))
                            ? 2
                            : 1}
                    </Tag>
                </Center>

                <Box>
                    {/* <Flex align="center"> */}
                    <Stack direction="row">
                        <Center>
                            <Badge colorScheme="purple">{person.pes}</Badge>
                        </Center>
                        <Text fontWeight="semibold">
                            <Link
                                isExternal
                                // href={{
                                //     pathName: `/personnel/manage/${person.personnel_ID}`,
                                //     query: { view: "ha" },
                                // }}
                                href={`/personnel/manage/${person.personnel_ID}?view=ha`}
                            >
                                {person.rank} {person.name}
                            </Link>
                        </Text>
                    </Stack>

                    <Flex align="center">
                        <Stack direction="row" my={1}>
                            {person.ha_active ? (
                                <>
                                    {/* <Tag
                                        size="sm"
                                        variant="subtle"
                                        colorScheme="green"
                                    >
                                        <TagLabel>
                                            {" "}
                                            Heat Acclimatised (Yr{" "}
                                            {isYearTwo(
                                                person.svc_status,
                                                new Date(person.ord)
                                            )
                                                ? 2
                                                : 1}
                                            ){" "}
                                        </TagLabel>
                                    </Tag> */}
                                    <Tag
                                        size="sm"
                                        variant="subtle"
                                        colorScheme={
                                            differenceInBusinessDays(
                                                new Date(person.ha_end_date),
                                                new Date()
                                            ) > 3
                                                ? "green"
                                                : "yellow"
                                        }
                                    >
                                        <TagLabel>
                                            {differenceInBusinessDays(
                                                new Date(person.ha_end_date),
                                                new Date()
                                            )}{" "}
                                            days left (
                                            {format(
                                                new Date(person.ha_end_date) ||
                                                    new Date(),
                                                Assignments.dateformat
                                            )}
                                            )
                                        </TagLabel>
                                    </Tag>
                                </>
                            ) : (
                                <>
                                    {/* <Tag
                                        size="sm"
                                        variant="subtle"
                                        colorScheme="red"
                                    >
                                        <TagLabel>
                                            {" "}
                                            Not Acclimatised (Yr{" "}
                                            {isYearTwo(
                                                person.svc_status,
                                                new Date(person.ord)
                                            )
                                                ? 2
                                                : 1}
                                            ){" "}
                                        </TagLabel>
                                    </Tag> */}
                                    <Tag
                                        size="sm"
                                        variant="subtle"
                                        colorScheme="red"
                                    >
                                        <TagLabel>
                                            {differenceInBusinessDays(
                                                new Date(),
                                                new Date(person.ha_end_date)
                                            )}{" "}
                                            days ago (
                                            {format(
                                                new Date(person.ha_end_date) ||
                                                    new Date(),
                                                Assignments.dateformat
                                            )}
                                            )
                                        </TagLabel>
                                    </Tag>
                                </>
                            )}
                        </Stack>
                    </Flex>
                </Box>
            </Stack>
            <Divider />
        </Collapse>
    );
};
const PlatoonAccordianItem: React.FC<{
    personnel: Personnel[];
    platoon: string;
    selectedDate: Date;
    totalNumber: number;
    // search: string;
}> = ({
    personnel,
    platoon,
    selectedDate,
    totalNumber,
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
                            {platoon} ({personnel.length}/{totalNumber})
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

const HAPage: NextProtectedPage = () => {
    const { data, error } = useSWR<{
        selectedDate: Date;
        totals: {
            [key: string]: number;
        };
        expiredByPlatoon: {
            [key: string]: Personnel[];
        };
        expiringByPlatoon: {
            [key: string]: Personnel[];
        };
        activeByPlatoon: {
            [key: string]: Personnel[];
        };
        numbers: {
            expired: number;
            expiring: number;
            active: number;
        };
    }>("/api/ha", fetcher);

    const { data: session } = useSession();

    const selectedDate = data?.selectedDate
        ? new Date(data?.selectedDate)
        : new Date();

    console.log({ data });
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

    // -----

    const defaultActiveIndex = useMemo(
        () => [
            Object.keys(data?.activeByPlatoon || {})
                .sort()
                .indexOf(session?.user.platoon || ""),
        ],
        [data, session]
    );
    const defaultExpiringIndex = useMemo(
        () => [
            Object.keys(data?.expiringByPlatoon || {})
                .sort()
                .indexOf(session?.user.platoon || ""),
        ],
        [data, session]
    );
    const defaultExpiredIndex = useMemo(
        () => [
            Object.keys(data?.expiredByPlatoon || {})
                .sort()
                .indexOf(session?.user.platoon || ""),
        ],
        [data, session]
    );

    const [indexActive, setIndexActive] = useState(defaultActiveIndex); // todo - set this to the user platoon
    const handleAccordionActive = (index: number[]) => {
        setIndexActive(index);
    };

    const [indexExpiring, setIndexExpiring] = useState(defaultExpiringIndex); // todo - set this to the user platoon
    const handleAccordionExpiring = (index: number[]) => {
        setIndexExpiring(index);
    };

    const [indexExpired, setIndexExpired] = useState(defaultExpiredIndex); // todo - set this to the user platoon
    const handleAccordionExpired = (index: number[]) => {
        setIndexExpired(index);
    };

    // -----

    if (data)
        return (
            <Stack direction="column" spacing={6}>
                <Box>
                    <Center>
                        <Heading>
                            {format(new Date(), Assignments.datewithnameformat)}
                        </Heading>
                    </Center>
                    <Center>
                        <Text
                            textAlign="center"
                            fontSize="sm"
                            fontWeight="light"
                        >
                            Note: Time to/from Expiry Date is calculated in
                            Working Days.
                        </Text>
                    </Center>
                </Box>
                {/* <Accordion
                    // defaultIndex={[0]}
                    allowMultiple
                    allowToggle
                    index={index}
                    onChange={(e) => handleAccordion(e as number[])}
                >
                    {Object.keys(data.sortedByPlatoon).map((platoon, index) => (
                        <PlatoonAccordianItem
                            selectedDate={selectedDate}
                            key={index}
                            personnel={data.sortedByPlatoon[platoon]}
                            platoon={platoon}
                            acclimatisedNumber={
                                data.acclimatisedNumbers[platoon]
                            }
                            // search={search}
                        />
                    ))}
                </Accordion> */}
                <Tabs variant="soft-rounded" align="center">
                    <TabList>
                        <Tab
                            _selected={{
                                bg: "green.400",
                                color: "white",
                            }}
                            // bg="green.100"

                            color={
                                data.numbers.active ? "green.400" : "gray.400"
                            }
                            cursor={
                                data.numbers.active ? "pointer" : "not-allowed"
                            }
                            isDisabled={!data.numbers.active}
                        >
                            Active ({data.numbers.active})
                        </Tab>
                        <Tab
                            _selected={{
                                bg: "yellow.400",
                                color: "white",
                            }}
                            // bg="yellow.100"
                            color={
                                data.numbers.expiring
                                    ? "yellow.400"
                                    : "gray.400"
                            }
                            cursor={
                                data.numbers.expiring
                                    ? "pointer"
                                    : "not-allowed"
                            }
                            isDisabled={!data.numbers.expiring}
                        >
                            Expiring ({data.numbers.expiring})
                        </Tab>
                        <Tab
                            _selected={{
                                bg: "red.400",
                                color: "white",
                            }}
                            // bg="red.100"
                            color={
                                data.numbers.expired ? "red.400" : "gray.400"
                            }
                            cursor={
                                data.numbers.expired ? "pointer" : "not-allowed"
                            }
                            isDisabled={!data.numbers.expired}
                        >
                            Expired ({data.numbers.expired})
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel px={1}>
                            <Accordion
                                // defaultIndex={[0]}
                                allowMultiple
                                allowToggle
                                index={indexActive}
                                onChange={(e) =>
                                    handleAccordionActive(e as number[])
                                }
                            >
                                {Object.keys(data.activeByPlatoon)
                                    .sort()
                                    .map((platoon, index) => (
                                        <PlatoonAccordianItem
                                            selectedDate={selectedDate}
                                            key={index}
                                            personnel={
                                                data.activeByPlatoon[platoon]
                                            }
                                            platoon={platoon}
                                            totalNumber={data.totals[platoon]}
                                            // search={search}
                                        />
                                    ))}
                            </Accordion>
                        </TabPanel>
                        <TabPanel px={1}>
                            <Accordion
                                // defaultIndex={[0]}
                                allowMultiple
                                allowToggle
                                index={indexExpiring}
                                onChange={(e) =>
                                    handleAccordionExpiring(e as number[])
                                }
                            >
                                {Object.keys(data.expiringByPlatoon)
                                    .sort()
                                    .map((platoon, index) => (
                                        <PlatoonAccordianItem
                                            selectedDate={selectedDate}
                                            key={index}
                                            personnel={
                                                data.expiringByPlatoon[platoon]
                                            }
                                            platoon={platoon}
                                            totalNumber={data.totals[platoon]}
                                            // search={search}
                                        />
                                    ))}
                            </Accordion>
                        </TabPanel>
                        <TabPanel px={1}>
                            <Accordion
                                // defaultIndex={[0]}
                                allowMultiple
                                allowToggle
                                index={indexExpired}
                                onChange={(e) =>
                                    handleAccordionExpired(e as number[])
                                }
                            >
                                {Object.keys(data.expiredByPlatoon)
                                    .sort()
                                    .map((platoon, index) => (
                                        <PlatoonAccordianItem
                                            selectedDate={selectedDate}
                                            key={index}
                                            personnel={
                                                data.expiredByPlatoon[platoon]
                                            }
                                            platoon={platoon}
                                            totalNumber={data.totals[platoon]}
                                            // search={search}
                                        />
                                    ))}
                            </Accordion>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Stack>
        );
    else return <CustomLoadingBar/>;
};

HAPage.requireAuth = true;

export default HAPage;
