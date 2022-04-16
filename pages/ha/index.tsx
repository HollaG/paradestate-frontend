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
    ButtonGroup,
    Collapse,
    Divider,
    Flex,
    Link,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    SimpleGrid,
    Stack,
    Tag,
    TagLabel,
    Skeleton,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { FaChevronDown } from "react-icons/fa";
import {
    IoCheckmarkDoneCircleOutline,
    IoAlertCircleOutline,
} from "react-icons/io5";
import { useSelector } from "react-redux";
import useSWR from "swr";
import { DefaultLink } from "..";
import BasicCard from "../../components/Card/BasicCard";
import {
    AddOff,
    AddLeave,
    AddAttC,
    AddCourse,
    AddMA,
    AddOthers,
} from "../../components/Dashboard/AddEvent";
import HAStepper from "../../components/HA/HAStepper";
import { NextProtectedPage } from "../../lib/auth";
import fetcher from "../../lib/fetcher";
import { ExtendedPersonnel } from "../../types/database";
import { RootState } from "../../types/types";
const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    selectedDate: Date;
    search: string;
}> = ({ person, selectedDate, search }) => {
    console.log("Person accordion item rerender");

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
const HAHomePage: NextProtectedPage = () => {
    const { data, error } = useSWR<{
        sortedByPlatoon: { [key: string]: ExtendedPersonnel[] };
        selectedDate: string;
    }>("/api/ha", fetcher);
    const { data: session } = useSession();
    console.log(data, error);
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
    useEffect(() => {
        // if (search.length && data?.sortedByPlatoon) {
        //     // do stuff
        //     // Open all the tabs
        //     setIndex(
        //         Object.keys(data.sortedByPlatoon).map((_, index) => index)
        //     );
        // } else {
        setIndex(defaultIndex);
        // }
    }, [data?.sortedByPlatoon, defaultIndex]);
    return (
        <>
            

            {data && (
                <Stack direction="column">
                    
                    <SimpleGrid columns={2} spacing={6}>
                        <BasicCard>
                            <Stat>
                                <StatLabel> Next PT on 16/4/2022</StatLabel>
                                <StatNumber>
                                    <Skeleton
                                        isLoaded={!!data}
                                        height="36px"
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        3KM run
                                        <Button
                                            size="xs"
                                            colorScheme="teal"
                                            onClick={() => {}}
                                        >
                                            {" "}
                                            View{" "}
                                        </Button>
                                    </Skeleton>
                                </StatNumber>
                                <StatHelpText>
                                    <Skeleton
                                        isLoaded={!!data}
                                        height="21px"
                                    ></Skeleton>
                                </StatHelpText>
                            </Stat>
                        </BasicCard>
                    </SimpleGrid>
                    <Accordion
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
                    </Accordion>
                </Stack>
            )}
        </>
    );
};

HAHomePage.requireAuth = true;

export default HAHomePage;
