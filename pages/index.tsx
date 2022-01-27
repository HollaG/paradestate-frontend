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
} from "@chakra-ui/react";

import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

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
} from "react-icons/io5";

const DefaultLink: React.FC<{ url: string; type: string }> = ({
    url,
    type,
}) => {
    return (
        <NextLink href={url} passHref>
            <Link color="teal.500">
                Click here to edit the currently active {type}
            </Link>
        </NextLink>
    );
};

const PersonAccordianItem: React.FC<{
    person: ExtendedPersonnel;
}> = ({ person }) => {
    const textColor = person.location === "In camp" ? "green.500" : "red.500";
    const icon =
        person.location === "In camp"
            ? IoCheckmarkDoneCircleOutline
            : IoAlertCircleOutline;
    const defaultState = {
        off: person.off_row_ID ? true : false,
        leave: person.leave_row_ID ? true : false,
        attc: person.attc_row_ID ? true : false,
        course: person.course_row_ID ? true : false,
        ma: person.ma_row_ID ? true : false,
        others: person.others_row_ID ? true : false,
        // This property is not currently in use
        extras:
            person.course_row_ID || person.ma_row_ID || person.others_row_ID
                ? true
                : false,
        incamp: person.location === "In camp" ? true : false,
    };

    const [buttonStates, setButtonStates] = useState(defaultState);

    const defaultExtrasChecked: string[] = [];
    if (person.ma_row_ID) defaultExtrasChecked.push("ma");
    if (person.others_row_ID) defaultExtrasChecked.push("others");
    if (person.course_row_ID) defaultExtrasChecked.push("course");

    // Override type checking TODO
    const [extrasChecked, setExtrasChecked] = useState<string[] | string>(
        defaultExtrasChecked
    );

    const handleExtras = (checked: string | string[]) => {
        setExtrasChecked(checked);
        console.log({ checked });

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
        <>
            <SimpleGrid columns={{ sm: 1, lg: 2 }} my={3} spacing="6px">
                <Box>
                    <Text fontWeight="semibold">
                        ({person.pes}) {person.rank} {person.name}
                    </Text>
                    <Flex align="center">
                        <Icon as={icon} mr={1} color={textColor} />
                        <Text textColor={textColor}> {person.location}</Text>
                    </Flex>
                </Box>
                {/* <Spacer /> */}
                <Center m="auto">
                    <ButtonGroup isAttached size="xs">
                        <Button
                            variant={buttonStates.off ? "solid" : "outline"}
                            colorScheme="teal"
                            onClick={() => toggleHandler("off")}
                            disabled={!!person.off_row_ID}
                        >
                            Off
                        </Button>
                        <Button
                            variant={buttonStates.leave ? "solid" : "outline"}
                            colorScheme="teal"
                            onClick={() => toggleHandler("leave")}
                            disabled={!!person.leave_row_ID}
                        >
                            Leave
                        </Button>
                        <Button
                            variant={buttonStates.attc ? "solid" : "outline"}
                            colorScheme="teal"
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
                                colorScheme="teal"
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
                            variant={buttonStates.incamp ? "solid" : "outline"}
                            colorScheme="green"
                            onClick={() => toggleHandler("incamp")}
                            disabled={
                                person.location !== "In camp" ? true : false
                            }
                        >
                            In camp
                        </Button>
                    </ButtonGroup>
                </Center>
            </SimpleGrid>

            {/* Render if user is on an event */}
            {/* TODO - instead of checking all the events, we check each individual event on the user  */}

            {events.map((event, index) =>
                defaultState[event] ? (
                    <DefaultLink
                        key={index}
                        url={`/personnel/manage/${event}/${
                            person.personnel_ID
                        }/#${person[`${event}_row_ID`]}`}
                        type={event === "ma" ? "medical appointment" : event}
                    />
                ) : null
            )}

            {/* only render the below if the user is not already on event */}
            {!defaultState.off && (
                <Collapse in={buttonStates.off} animateOpacity unmountOnExit>
                    <AddOff
                        personnel_ID={person.personnel_ID}
                        enabled={buttonStates.off}
                    />
                </Collapse>
            )}
            {!defaultState.leave && (
                <Collapse in={buttonStates.leave} animateOpacity unmountOnExit>
                    <AddLeave
                        personnel_ID={person.personnel_ID}
                        enabled={buttonStates.leave}
                    />
                </Collapse>
            )}
            {!defaultState.attc && (
                <Collapse in={buttonStates.attc} animateOpacity unmountOnExit>
                    <AddAttC
                        personnel_ID={person.personnel_ID}
                        enabled={buttonStates.attc}
                    />
                </Collapse>
            )}

            {!defaultState.course && (
                <Collapse in={buttonStates.course} animateOpacity unmountOnExit>
                    <AddCourse
                        personnel_ID={person.personnel_ID}
                        enabled={buttonStates.course}
                    />
                </Collapse>
            )}
            {!defaultState.ma && (
                <Collapse in={buttonStates.ma} animateOpacity unmountOnExit>
                    <AddMA
                        personnel_ID={person.personnel_ID}
                        enabled={buttonStates.ma}
                    />
                </Collapse>
            )}
            {!defaultState.others && (
                <Collapse in={buttonStates.others} animateOpacity unmountOnExit>
                    <AddOthers
                        personnel_ID={person.personnel_ID}
                        enabled={buttonStates.others}
                    />
                </Collapse>
            )}

            <Divider />
        </>
    );
};
const PlatoonAccordianItem: React.FC<{
    personnel: ExtendedPersonnel[];
    platoon: string;
}> = ({ personnel, platoon }) => {
    return (
        <AccordionItem>
            <Text>
                <AccordionButton _expanded={{ bg: "gray.200" }}>
                    <Box flex={1} textAlign="left">
                        {platoon} ({personnel.length})
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
            </Text>
            <AccordionPanel borderColor="gray.200" borderWidth={2} pb={4}>
                {personnel.map((person, index) => (
                    <PersonAccordianItem key={index} person={person} />
                ))}
            </AccordionPanel>
        </AccordionItem>
    );
};

const Dashboard: NextPage<{
    data?: {
        sortedByPlatoon: { [key: string]: ExtendedPersonnel[] };
        personnelTally: {
            [key: string]: any;
            total: number;
            incamp: number;
        };
        personnelNotInCamp: {
            personnel_ID: number;
            type: "off" | "leave" | "ma" | "attc" | "course" | "others";
        }[];
        selectedDate: string;
    };
}> = ({ data }) => {
    const { data: session } = useSession();
    if (!data) return <h1> im here </h1>;
    const { sortedByPlatoon, selectedDate } = data;

    const methods = useForm({ shouldUnregister: true });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = methods;

    const onSubmit = (data: any) => console.log(data);
    return (
        <Layout
            content={
                <Box>
                    <Wrap>
                        <WrapItem>
                            <Text fontSize="2xl">
                                Set status for: {selectedDate}
                            </Text>
                        </WrapItem>
                    </Wrap>
                    <Accordion defaultIndex={[0]} allowMultiple allowToggle>
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)}>
                                {Object.keys(sortedByPlatoon).map(
                                    (platoon, index) => (
                                        <PlatoonAccordianItem
                                            key={index}
                                            personnel={sortedByPlatoon[platoon]}
                                            platoon={platoon}
                                        />
                                    )
                                )}
                                <Button type="submit"> submit </Button>
                            </form>
                        </FormProvider>
                    </Accordion>
                </Box>
            }
        ></Layout>
    );
};

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const session = await getSession(context);
    if (!session)
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    let currentDate = new Date();
    let formattedDate = format(currentDate, Assignments.mysqldateformat);

    if (format(currentDate, "aaa") === "pm")
        formattedDate = format(
            addDays(currentDate, 1),
            Assignments.mysqldateformat
        );

    const opts = {
        unit: session.user.unit,
        company: session.user.company,
        selDate: currentDate,
    };
    console.log(opts);
    try {
        const query = queryBuilder(
            "select * from personnel left join (SELECT personnel_ID, row_ID as status_row_ID FROM status_tracker WHERE type='perm' OR (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as a USING(personnel_ID) left join (SELECT personnel_ID, start as attc_start, end as attc_end, attc_name, row_ID as attc_row_ID FROM attc_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as b USING(personnel_ID) left join (SELECT personnel_ID, row_ID as course_row_ID FROM course_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as c USING(personnel_ID) left join (SELECT personnel_ID, start as leave_start, start_time as leave_start_time, end as leave_end, end_time as leave_end_time, reason as leave_reason, row_ID as leave_row_ID FROM leave_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as d USING(personnel_ID) left join (SELECT personnel_ID, start as off_start, start_time as off_start_time, end as off_end, end_time as off_end_time, reason as off_reason, row_ID as off_row_ID FROM off_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as e USING(personnel_ID) left join (SELECT personnel_ID, row_ID as others_row_ID FROM others_tracker WHERE (DATE(start) <= DATE(:selDate) AND DATE(END) >= DATE(:selDate)) group by personnel_ID) as f USING(personnel_ID) left join (SELECT personnel_ID, date as ma_date, time as ma_time, location as ma_location, ma_name, in_camp as ma_in_camp, row_ID as ma_row_ID FROM ma_tracker WHERE DATE(date) = DATE(:selDate) group by personnel_ID) as g USING(personnel_ID) LEFT JOIN ranks ON ranks.`rank` = personnel.`rank` WHERE unit = :unit AND company = :company AND DATE(ord) >= DATE(:selDate) AND DATE(post_in) <= DATE(:selDate) ORDER BY platoon ASC, ranks.rank_order DESC, personnel.name ASC",
            opts
        );
        // console.log(query);
        const personnel: ExtendedPersonnel[] = await executeQuery({
            query: query.sql,
            values: query.values,
        });

        const objectified = [...personnel];

        if (!objectified) return { props: {} };

        const edited = objectified.map((x) => {
            const strArr = [];
            if (x.attc_row_ID) strArr.push("On AttC");
            if (x.course_row_ID) strArr.push("On course");
            if (x.leave_row_ID) strArr.push("On leave");
            if (x.off_row_ID) strArr.push("On off");
            if (x.ma_row_ID) {
                if (x.ma_in_camp) {
                    strArr.push("On MA (In camp)");
                } else {
                    strArr.push("On MA");
                }
            }
            if (x.others_row_ID) {
                if (x.others_in_camp) {
                    strArr.push("Others (In camp)");
                } else {
                    strArr.push("Others");
                }
            }

            if (!strArr.length) {
                strArr.push("In camp");
            }

            const str = strArr.join(", ");
            x.location = str;
            return x;
        });
        const sortedByPlatoon: { [key: string]: ExtendedPersonnel } =
            edited.reduce((r: any, a) => {
                r[a.platoon] = [...(r[a.platoon] || []), a];
                return r;
            }, {});

        const data = {
            sortedByPlatoon,

            selectedDate: formattedDate,
        };

        return {
            props: {
                data,
            },
        };
    } catch (e) {
        console.log(e);
        return {
            props: { error: JSON.stringify(e) },
        };
    }
};

export default Dashboard;
