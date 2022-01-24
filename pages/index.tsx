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
} from "@chakra-ui/react";

const PersonAccordianItem: React.FC<{ person: ExtendedPersonnel }> = ({
    person,
}) => {
    const textColor = person.location === "In camp" ? "green.500" : "red.500";
    return (
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
                    <Button variant="outline"> Off </Button>
                    <Button variant="outline"> Leave </Button>
                    <Button variant="outline"> AttC</Button>
                    {/* <Menu>
                        {({ isOpen }) => (
                            <>
                                <MenuButton
                                    isActive={isOpen}
                                    as={Button}
                                    rightIcon={<ChevronDownIcon />}
                                >
                                    {isOpen ? "Close" : "Open"}
                                </MenuButton>
                                <MenuList>
                                    <MenuItem>Download</MenuItem>
                                    <MenuItem
                                        onClick={() => alert("Kagebunshin")}
                                    >
                                        Create a Copy
                                    </MenuItem>
                                </MenuList>
                            </>
                        )}
                    </Menu> */}
                    <Button variant="outline"> Extras </Button>
                    <Button variant="outline"> In camp</Button>
                </ButtonGroup>
            </Center>
        </Flex>
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
