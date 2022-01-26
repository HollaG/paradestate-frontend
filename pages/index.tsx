import type { GetServerSidePropsContext, NextPage } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import executeQuery from "../lib/db";
import Layout from "../components/Sidebar";

import { queryBuilder } from "mysql-query-placeholders";
import { addDays, format } from "date-fns";

import Assignments from "../config/assignments.json";
import { ExtendedPersonnel } from "../types/database";
import { serialize } from "superjson";
import {
    Container,
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
    Spacer,
    Center,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Divider,
    MenuDivider,
    MenuItemOption,
    MenuOptionGroup,
} from "@chakra-ui/react";

import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
const PersonAccordianItem: React.FC<{ person: ExtendedPersonnel }> = ({
    person,
}) => {
    const textColor = person.location === "In camp" ? "green.500" : "red.500";
    const disabledStates = person.location.split(",");

    const [buttonStates, setButtonStates] = useState({
        off: person.off_row_ID ? true : false,
        leave: person.leave_row_ID ? true : false,
        attc: person.attc_row_ID ? true : false,
        course: person.course_row_ID ? true : false,
        ma: person.ma_row_ID ? true : false,
        others: person.others_row_ID ? true : false,
        extras:
            person.course_row_ID || person.ma_row_ID || person.others_row_ID
                ? true
                : false,
        incamp: person.location === "In camp" ? true : false,
    });

    const defaultExtrasChecked:string[] = []
    if (person.ma_row_ID) defaultExtrasChecked.push("ma")
    if (person.others_row_ID) defaultExtrasChecked.push("others")
    if (person.course_row_ID) defaultExtrasChecked.push("course")


    // Override type checking TODO
    const [extrasChecked, setExtrasChecked] = useState<string[]|string>(defaultExtrasChecked)


    const toggleHandler = (
        type: "off" | "leave" | "attc" | "course" | "ma" | "others" | "incamp"
    ) => {
        if (type !== "incamp")
            setButtonStates((prevState) => ({
                // When user selects another location, de-select the in-camp button because they can't be in camp if they are elsewhere
                ...prevState,
                incamp: false,
            }));
        switch (type) {
            case "off":
                setButtonStates((prevState) => ({
                    ...prevState,
                    off: !prevState.off,
                }));
                break;
            case "leave":
                setButtonStates((prevState) => ({
                    ...prevState,
                    leave: !prevState.leave,
                }));
                break;
            case "attc":
                setButtonStates((prevState) => ({
                    ...prevState,
                    attc: !prevState.attc,
                }));
                break;
            case "course":
                setButtonStates((prevState) => ({
                    ...prevState,
                    course: !prevState.course,
                }));
                break;
            case "ma":
                setButtonStates((prevState) => ({
                    ...prevState,
                    ma: !prevState.ma,
                }));
                break;
            case "others":
                setButtonStates((prevState) => ({
                    ...prevState,
                    others: !prevState.others,
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

    return (
        <>
            <Flex wrap="wrap" my={3}>
                <Box>
                    <Text fontWeight="semibold">
                        ({person.pes}) {person.rank} {person.name}
                    </Text>
                    <Text textColor={textColor}>{person.location}</Text>
                </Box>
                <Spacer />
                <Center>
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
                                    buttonStates.extras ? "solid" : "outline"
                                }
                                colorScheme="teal"
                            >
                                Extras
                            </MenuButton>
                            <MenuList minWidth="240px">
                                
                                <MenuOptionGroup
                                    value={extrasChecked}
                                    onChange={setExtrasChecked}
                                    type="checkbox"
                                >
                                    <MenuItemOption value="course" >
                                        Course
                                    </MenuItemOption>
                                    <MenuItemOption value="ma">
                                        MA
                                    </MenuItemOption>
                                    <MenuItemOption value="others">
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
            </Flex>
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

const OldDashboard: NextPage<{
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
    if (!data) return <></>;
    const {
        sortedByPlatoon,
        personnelTally,
        personnelNotInCamp,
        selectedDate,
    } = data;
    console.log("IN react app frontend", { data });
    return (
        <Layout
            content={
                <Box>
                    <Wrap>
                        <WrapItem>
                            <Text fontSize="2xl">
                                {" "}
                                Set status for: {selectedDate}
                            </Text>
                        </WrapItem>
                    </Wrap>
                    <Accordion defaultIndex={[0]} allowMultiple allowToggle>
                        {Object.keys(sortedByPlatoon).map((platoon, index) => (
                            <PlatoonAccordianItem
                                key={index}
                                personnel={sortedByPlatoon[platoon]}
                                platoon={platoon}
                            />
                        ))}
                    </Accordion>
                </Box>
            }
        ></Layout>
    );
};

const Dashboard: NextPage = () => {
    return <Layout
    content={
        <h1> Hello world </h1>
    }
></Layout>
}

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const session = await getSession(context);
    if (!session) return { props: {} };
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

        const personnelTally: {
            total: number;
            incamp: number;
            [key: string]: any;
        } = { total: 0, incamp: 0 };

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

            // set up object key
            personnelTally[x.platoon]
                ? personnelTally[x.platoon]
                : (personnelTally[x.platoon] = {});

            // Add one to total
            personnelTally[x.platoon]["total"]
                ? (personnelTally[x.platoon]["total"] =
                      personnelTally[x.platoon]["total"] + 1)
                : (personnelTally[x.platoon]["total"] = 1);
            personnelTally["total"] = personnelTally["total"] + 1;
            if (!strArr.length) {
                // add one to current if in camp
                personnelTally[x.platoon]["incamp"]
                    ? (personnelTally[x.platoon]["incamp"] =
                          personnelTally[x.platoon]["incamp"] + 1)
                    : (personnelTally[x.platoon]["incamp"] = 1);
                personnelTally["incamp"] = personnelTally["incamp"] + 1;
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

        const personnelNotInCamp: {
            personnel_ID: number;
            type: "off" | "leave" | "ma" | "attc" | "course" | "others";
        }[] = [];
        edited.forEach((person) => {
            let type: "off" | "leave" | "ma" | "attc" | "course" | "others" =
                "off";
            if (person.leave_row_ID) type = "leave";

            if (person.ma_row_ID) type = "ma";

            if (person.attc_row_ID) type = "attc";

            if (person.course_row_ID) type = "course";

            if (person.others_row_ID) type = "others";

            personnelNotInCamp.push({
                personnel_ID: person.personnel_ID,
                type,
            });
        });

        const data = {
            sortedByPlatoon,
            personnelTally,
            personnelNotInCamp,
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
