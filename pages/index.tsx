import type { GetServerSidePropsContext, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import NextLink from "next/link";

import executeQuery from "../lib/db";
import Layout from "../components/Sidebar";

import { queryBuilder } from "mysql-query-placeholders";
import { addDays, format } from "date-fns";

import Assignments from "../config/assignments.json";
import { ExtendedPersonnel } from "../types/database";

import {
    Text,
    Wrap,
    WrapItem,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Flex,
    ButtonGroup,
    Button,
    Center,
    Menu,
    MenuButton,
    MenuList,
    Divider,
    MenuItemOption,
    MenuOptionGroup,
    Collapse,
    SimpleGrid,
    Link,
    Icon,
    Container,
    Heading,
    theme,
    Badge,
    Stack,
    Tag,
    TagLabel,
    TagLeftIcon,
    TagRightIcon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react";

import { FaChevronDown } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";

import {
    AddAttC,
    AddCourse,
    AddLeave,
    AddMA,
    AddOff,
    AddOthers,
} from "../components/Dashboard/AddEvent";
import { FormProvider, useForm } from "react-hook-form";
import {
    IoCheckmarkDoneCircleOutline,
    IoAlertCircleOutline,
    IoCheckmarkDoneOutline,
    IoOpenOutline,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { dashboardActions } from "../store/dashboard-slice";
import { useRouter } from "next/router";
import { NextProtectedPage } from "../lib/auth";
import { RootState } from "../types/types";
import CustomStepper from "../components/Dashboard/CustomStepper";
import DashboardHeading from "../components/Dashboard/Heading";
import {
    AddedAttCOrCourse,
    AddedLeaveOrOff,
    AddedMA,
    AddedOthers,
} from "../components/Dashboard/AddedEvent";
import { capitalizeFirstLetter, onClickUrl } from "../lib/custom";
import useSWRImmutable from "swr/immutable";
import fetcher from "../lib/fetcher";
import SearchInput from "../components/SearchInput";

const DefaultLink: React.FC<{
    url: string;
    type:
        | "ma"
        | "off"
        | "leave"
        | "attc"
        | "course"
        | "others"
        | "extras"
        | "incamp";
    person: ExtendedPersonnel;
}> = ({ url, type, person }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    let modalContents;
    switch (type) {
        case "leave": {
            let data = {
                reason: person.leave_reason as string,
                date: [person.leave_start, person.leave_end] as [
                    string,
                    string
                ],
                "start-time": person.leave_start_time as "AM" | "PM",
                "end-time": person.leave_end_time as "AM" | "PM",
                days: 0,
            };
            modalContents = <AddedLeaveOrOff data={data} />;
            break;
        }
        case "off": {
            let data = {
                reason: person.off_reason as string,
                date: [person.off_start, person.off_end] as [string, string],
                "start-time": person.off_start_time as "AM" | "PM",
                "end-time": person.off_end_time as "AM" | "PM",
                days: 0,
            };
            modalContents = <AddedLeaveOrOff data={data} />;
            break;
        }
        case "attc": {
            let data = {
                reason: person.attc_name as string,
                date: [person.attc_start, person.attc_end] as [string, string],
            };
            modalContents = <AddedAttCOrCourse data={data} />;
            break;
        }
        case "course": {
            let data = {
                name: person.course_name as string,
                date: [person.course_start, person.course_end] as [
                    string,
                    string
                ],
            };
            modalContents = <AddedAttCOrCourse data={data} />;
            break;
        }
        case "ma": {
            let data = {
                name: person.ma_name as string,
                location: person.ma_location as string,
                incamp: Boolean(person.ma_incamp),
                "date-time-formatted": `${format(
                    new Date(person.ma_date),
                    Assignments.dateformat
                )} ${person.ma_time}`,
            };
            modalContents = <AddedMA data={data} />;
            break;
        }
        case "others": {
            let data = {
                name: person.others_name as string,
                incamp: Boolean(person.others_incamp),
                date: [person.others_start, person.others_end] as [
                    string,
                    string
                ],
            };
            modalContents = <AddedOthers data={data} />;
            break;
        }
    }
    const router = useRouter();
    return (
        <>
            {/* <NextLink href={url} passHref> */}
            {/* <Badge colorScheme="red">On {type}</Badge> */}

            {/* <Link> */}
            <Tag
                size="sm"
                variant="subtle"
                colorScheme="red"
                onClick={onOpen}
                sx={{ cursor: "pointer" }}
            >
                {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}

                <TagLabel>
                    On {type === "ma" ? "medical appointment" : type}
                </TagLabel>
                <TagRightIcon as={IoOpenOutline} />
            </Tag>
            {/* </Link> */}
            {/* </NextLink> */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{capitalizeFirstLetter(type)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            {" "}
                            {person.rank} {person.name}{" "}
                        </Text>
                        <Text> {person.platoon} </Text>
                        {modalContents}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="purple"
                            mr={3}
                            onClick={onClickUrl(url)}
                        >
                            Edit {type}
                        </Button>

                        <Button mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    selectedDate: Date;
    search: string;
}> = ({ person, selectedDate, search }) => {
    console.log("Person accordion item rerender");
    const textColor = person.location === "In camp" ? "green.500" : "red.500";
    const dashboardData = useSelector(
        (state: RootState) => state.dashboard.data
    );
    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    const icon =
        person.location === "In camp"
            ? IoCheckmarkDoneCircleOutline
            : IoAlertCircleOutline;
    const defaultState = useMemo(
        () => ({
            off:
                // defaultData.off[person.personnel_ID] ||
                person.off_row_ID ? true : false,
            leave:
                // defaultData.leave[person.personnel_ID] ||
                person.leave_row_ID ? true : false,
            attc:
                // defaultData.attc[person.personnel_ID] ||
                person.attc_row_ID ? true : false,
            course:
                // defaultData.course[person.personnel_ID] ||
                person.course_row_ID ? true : false,
            ma:
                // defaultData.ma[person.personnel_ID] ||
                person.ma_row_ID ? true : false,
            others:
                // defaultData.others[person.personnel_ID] ||
                person.others_row_ID ? true : false,
            // This property is not currently in use
            extras:
                // defaultData.course[person.personnel_ID] ||
                // defaultData.ma[person.personnel_ID] ||
                // defaultData.others[person.personnel_ID] ||
                person.course_row_ID || person.ma_row_ID || person.others_row_ID
                    ? true
                    : false,
            incamp: person.location === "In camp" ? true : false,
        }),
        [person]
    );

    const [buttonStates, setButtonStates] = useState(defaultState);
    const incamp =
        person.location === "In camp" &&
        !buttonStates.off &&
        !buttonStates.leave &&
        !buttonStates.attc &&
        !buttonStates.course &&
        !buttonStates.ma &&
        !buttonStates.others;

    const defaultExtrasChecked: string[] = useMemo(() => {
        const temp = [];
        if (person.ma_row_ID) temp.push("ma");
        if (person.others_row_ID) temp.push("others");
        if (person.course_row_ID) temp.push("course");
        return temp;
    }, [person]);

    // Override type checking TODO
    const [extrasChecked, setExtrasChecked] = useState<string[] | string>(
        defaultExtrasChecked
    );

    const handleExtras = (checked: string | string[]) => {
        setExtrasChecked(checked);

        // Handle setting the button states
        let tempArray: string[] = []; // Convert to array (if one option is selected, then it's a string, not an array)
        if (Array.isArray(checked)) {
            tempArray = checked;
        } else {
            tempArray = [checked];
        }

        setButtonStates((prevState) => ({
            ...prevState,
            course: tempArray.includes("course"),
            ma: tempArray.includes("ma"),
            others: tempArray.includes("others"),
            incamp: false,
            extras: tempArray.length > 0,
        }));
    };

    const toggleHandler = (
        type: "off" | "leave" | "attc" | "course" | "ma" | "others" | "incamp"
    ) => {
        switch (type) {
            case "off":
                setButtonStates((prevState) => ({
                    ...prevState,
                    off: !prevState.off,
                    incamp: false,
                }));
                break;
            case "leave":
                setButtonStates((prevState) => ({
                    ...prevState,
                    leave: !prevState.leave,
                    incamp: false,
                }));
                break;
            case "attc":
                setButtonStates((prevState) => ({
                    ...prevState,
                    attc: !prevState.attc,
                    incamp: false,
                }));
                break;

            case "incamp":
                if (buttonStates.incamp) return; // Prevent deselection, only allow user to select this option

                // When user sets incamp to true, deselect all other options
                // Pls note that the user can only click incamp to true if the person is already in-camp, i.e. has location set as 'In camp'
                setButtonStates({
                    off: false,
                    leave: false,
                    attc: false,
                    course: false,
                    ma: false,
                    others: false,
                    extras: false,
                    incamp: true,
                });
                break;
            default:
                break;
        }
    };

    // Handle setting the values for saved inputs from redux store
    useEffect(() => {
        setButtonStates((prevState) => ({
            // Only set the button states if dashboardData.[whatever] exists
            off: defaultState.off || dashboardData.off[person.personnel_ID],
            // ? true : prevState.off,

            leave:
                defaultState.leave || dashboardData.leave[person.personnel_ID],
            // ? true
            // : prevState.leave,

            attc: defaultState.attc || dashboardData.attc[person.personnel_ID],
            // ? true
            // : prevState.attc,

            course:
                defaultState.course ||
                dashboardData.course[person.personnel_ID],
            // ? true
            // : prevState.course,

            ma: defaultState.ma || dashboardData.ma[person.personnel_ID],
            // ? true : prevState.ma,

            others:
                defaultState.others ||
                dashboardData.others[person.personnel_ID],
            // ? true
            // : prevState.others,

            // This property is not currently in use
            extras:
                defaultState.extras ||
                dashboardData.course[person.personnel_ID] ||
                dashboardData.ma[person.personnel_ID] ||
                dashboardData.others[person.personnel_ID],
            incamp: prevState.incamp,
        }));
        // reset the extrasChecked state to the intial value

        const temp = [];
        if (dashboardData.ma[person.personnel_ID]) temp.push("ma");
        if (dashboardData.others[person.personnel_ID]) temp.push("others");
        if (dashboardData.course[person.personnel_ID]) temp.push("course");
        setExtrasChecked([...new Set([...defaultExtrasChecked, ...temp])]);
    }, [dashboardData, person, defaultState, defaultExtrasChecked]);

    // Function to clear all selectins
    // const clearThis = () => {
    //     setButtonStates(defaultState);
    // }

    const events: (
        | "off"
        | "leave"
        | "attc"
        | "course"
        | "ma"
        | "others"
        | "extras"
        | "incamp"
    )[] = ["off", "leave", "attc", "course", "ma", "others"];

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
                            {person.rank} {person.name}
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
                            {events.map((event, index) =>
                                defaultState[event] ? (
                                    <DefaultLink
                                        key={index}
                                        url={`/personnel/manage/${event}/${
                                            person.personnel_ID
                                        }/#${person[`${event}_row_ID`]}`}
                                        type={event}
                                        person={person}
                                    />
                                ) : null
                            )}{" "}
                        </Stack>
                    </Flex>
                </Box>
                {/* <Spacer /> */}

                <Flex alignItems="center" m={{ lg: "unset", base: "auto" }}>
                    <ButtonGroup isAttached size="xs" ml={{ lg: "auto" }}>
                        <Button
                            variant={buttonStates.off ? "solid" : "outline"}
                            onClick={() => toggleHandler("off")}
                            disabled={!!person.off_row_ID}
                        >
                            Off
                        </Button>
                        <Button
                            variant={buttonStates.leave ? "solid" : "outline"}
                            onClick={() => toggleHandler("leave")}
                            disabled={!!person.leave_row_ID}
                        >
                            Leave
                        </Button>
                        <Button
                            variant={buttonStates.attc ? "solid" : "outline"}
                            onClick={() => toggleHandler("attc")}
                            disabled={!!person.attc_row_ID}
                        >
                            AttC
                        </Button>
                        <Menu closeOnSelect={true}>
                            <MenuButton
                                as={Button}
                                rightIcon={<FaChevronDown />}
                                variant={
                                    extrasChecked.length > 0
                                        ? "solid"
                                        : "outline"
                                }
                            >
                                Extras
                            </MenuButton>
                            <MenuList minWidth="240px">
                                <MenuOptionGroup
                                    value={extrasChecked}
                                    onChange={handleExtras}
                                    type="checkbox"
                                >
                                    <MenuItemOption
                                        value="course"
                                        isDisabled={!!person.course_row_ID}
                                    >
                                        Course
                                    </MenuItemOption>
                                    <MenuItemOption
                                        value="ma"
                                        isDisabled={!!person.ma_row_ID}
                                    >
                                        MA
                                    </MenuItemOption>
                                    <MenuItemOption
                                        value="others"
                                        isDisabled={!!person.others_row_ID}
                                    >
                                        Others
                                    </MenuItemOption>
                                </MenuOptionGroup>
                            </MenuList>
                        </Menu>
                        <Button
                            variant={incamp ? "solid" : "outline"}
                            colorScheme="green"
                            onClick={() => toggleHandler("incamp")}
                            disabled={
                                person.location !== "In camp" ? true : false
                            }
                        >
                            In camp
                        </Button>
                    </ButtonGroup>
                </Flex>
            </SimpleGrid>

            {/* Render if user is on an event */}
            {/* TODO - instead of checking all the events, we check each individual event on the user  */}

            {/* only render the below if the user is not already on event */}
            {!defaultState.off && (
                <Collapse in={buttonStates.off} animateOpacity unmountOnExit>
                    <AddOff
                        personnel_ID={person.personnel_ID}
                        data={dashboardData.off[person.personnel_ID]}
                        defaultDate={[selectedDate, selectedDate]}
                    />
                </Collapse>
            )}
            {!defaultState.leave && (
                <Collapse in={buttonStates.leave} animateOpacity unmountOnExit>
                    <AddLeave
                        personnel_ID={person.personnel_ID}
                        data={dashboardData.leave[person.personnel_ID]}
                        defaultDate={[selectedDate, selectedDate]}
                    />
                </Collapse>
            )}
            {!defaultState.attc && (
                <Collapse in={buttonStates.attc} animateOpacity unmountOnExit>
                    <AddAttC
                        personnel_ID={person.personnel_ID}
                        data={dashboardData.attc[person.personnel_ID]}
                        defaultDate={[selectedDate, selectedDate]}
                    />
                </Collapse>
            )}

            {!defaultState.course && (
                <Collapse in={buttonStates.course} animateOpacity unmountOnExit>
                    <AddCourse
                        personnel_ID={person.personnel_ID}
                        data={dashboardData.course[person.personnel_ID]}
                        defaultDate={[selectedDate, selectedDate]}
                    />
                </Collapse>
            )}
            {!defaultState.ma && (
                <Collapse in={buttonStates.ma} animateOpacity unmountOnExit>
                    <AddMA
                        personnel_ID={person.personnel_ID}
                        data={dashboardData.ma[person.personnel_ID]}
                        defaultDate={selectedDate}
                    />
                </Collapse>
            )}
            {!defaultState.others && (
                <Collapse in={buttonStates.others} animateOpacity unmountOnExit>
                    <AddOthers
                        personnel_ID={person.personnel_ID}
                        data={dashboardData.others[person.personnel_ID]}
                        defaultDate={[selectedDate, selectedDate]}
                    />
                </Collapse>
            )}

            <Divider />
        </Collapse>
    );
};
const PlatoonAccordianItem: React.FC<{
    personnel: ExtendedPersonnel[];
    platoon: string;
    selectedDate: Date;
    search: string;
}> = ({ personnel, platoon, selectedDate, search }) => {
    const { data: session } = useSession();
    const [rendered, setRendered] = useState(platoon === session?.user.platoon);
    // don't render the accordion panel by default, only render when use rclicks
    // This allows the page to be more performant as there is less stuff to hydrate
    // Render the accordion panel which corresponds to the user (will render if platoon === personnel[0].platoon)
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
                                search={search}
                            />
                        ))}
                </AccordionPanel>
            </>
        </AccordionItem>
    );
};

const Dashboard: NextProtectedPage = () => {
    console.log("main page rerendering");

    const { data, error } = useSWRImmutable<{
        sortedByPlatoon: { [key: string]: ExtendedPersonnel[] };
        selectedDate: string;
    }>("/api/dashboard", fetcher);

    // const { data: session } = useSession();
    const methods = useForm({ shouldUnregister: true });

    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const defaultIndex = useMemo(() => [0], []);
    const [index, setIndex] = useState(defaultIndex); // todo - set this to the user platoon
    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (search.length && data?.sortedByPlatoon) {
            // do stuff
            // Open all the tabs
            setIndex(
                Object.keys(data.sortedByPlatoon).map((_, index) => index)
            );
        } else {
            setIndex(defaultIndex);
        }
    }, [search, data?.sortedByPlatoon, defaultIndex]);

    const selectedDate = data?.selectedDate
        ? new Date(data?.selectedDate)
        : new Date();
    const {
        register,
        handleSubmit,
        getValues,
        watch,
        formState: { errors },
    } = methods;

    const onSubmit = (data: { [key: string]: any }) => {
        if (!Object.keys(data).length) return alert("No data was entered");
        setIsSubmitting(true);
        // dispatch(dashboardActions.updateForm(data));

        fetch("/api/dashboard/confirm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data }),
        })
            .then((res) => res.json())
            .then((responseData) => {
                dispatch(dashboardActions.updateData(responseData));
                router.push("/confirm");
            });
    };

    const clearSelection = () => {
        dispatch(dashboardActions.clearData());
    };

    return (
        <Stack direction="column">
            <DashboardHeading step={0}>
                <Heading>{format(selectedDate, "eee d LLL yyyy")}</Heading>
                <Button
                    colorScheme="teal"
                    size="xs"
                    ml={2}
                    onClick={() => clearSelection()}
                >
                    Clear
                </Button>
            </DashboardHeading>
            <SearchInput setSearch={setSearch} />
            {!data && <>Loading data...</>}
            {data && (
                <Accordion
                    defaultIndex={[0]}
                    allowMultiple
                    allowToggle
                    index={index}
                    onChange={(e) => handleAccordion(e as number[])}
                >
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            {Object.keys(data.sortedByPlatoon).map(
                                (platoon, index) => (
                                    <PlatoonAccordianItem
                                        selectedDate={selectedDate}
                                        key={index}
                                        personnel={
                                            data.sortedByPlatoon[platoon]
                                        }
                                        platoon={platoon}
                                        search={search}
                                    />
                                )
                            )}
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
                </Accordion>
            )}
        </Stack>
    );
};

// export const getServerSideProps = async (
//     context: GetServerSidePropsContext
// ) => {
//     const session = await getSession(context);

//     if (!session || !session.user)
//         return {
//             redirect: {
//                 destination: "/login",
//                 permanent: false,
//             },
//         };

//     let selectedDate = new Date();

// };

Dashboard.requireAuth = true;

export default Dashboard;
