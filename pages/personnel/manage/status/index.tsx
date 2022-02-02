import { NextProtectedPage } from "../../../../lib/auth";
import Layout from "../../../../components/Sidebar";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { ExtendedPersonnel, Personnel } from "../../../../types/database";
import executeQuery from "../../../../lib/db";
import StatusHeading from "../../../../components/Personnel/Status/Heading";
import { format, parse } from "date-fns";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Center,
    Checkbox,
    Collapse,
    Divider,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightElement,
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
    Text,
} from "@chakra-ui/react";
import { Session } from "inspector";
import { ExtendedStatus, Status } from "../../../../types/types";
import useSWR from "swr";
import fetcher, { sendPOST } from "../../../../lib/fetcher";
import Assignments from "../../../../config/assignments.json";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { GroupBase, OptionBase, Select } from "chakra-react-select";
import { StatusData } from "../../../api/personnel/manage/status";
import events from "events";
import { FaChevronDown } from "react-icons/fa";
import { useEffect, useState } from "react";

import CustomStatusDateRangePicker from "../../../../components/Dates/CustomStatusDateRangePicker";
import SearchInput from "../../../../components/Personnel/Status/SearchInput";
import useSWRImmutable from "swr/immutable";
import StatusInputs from "../../../../components/Personnel/Status/StatusInputs";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { statusActions } from "../../../../store/status-slice";

export interface StatusOption extends OptionBase {
    label: string;
    value: string;
}

const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    selectedDate: Date;
    statusesById: { [key: string]: ExtendedStatus[] };
    search: string;
}> = ({ person, selectedDate, statusesById, search }) => {
    const { register } = useFormContext();

    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    let tags;
    if (!statusesById[person.personnel_ID]) {
        tags = (
            <Tag size="sm" variant="subtle" colorScheme="green">
                {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}
                <TagLabel> No active status </TagLabel>
            </Tag>
        );
    } else if (statusesById[person.personnel_ID].length > 1) {
        tags = (
            <>
                <Tag size="sm" variant="subtle" colorScheme="red">
                    {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}
                    <TagLabel>
                        {" "}
                        {statusesById[person.personnel_ID][0].status_name}
                    </TagLabel>
                </Tag>
                <Tag size="sm" variant="subtle" colorScheme="red">
                    {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}
                    <TagLabel>
                        {" "}
                        + {statusesById[person.personnel_ID].length - 1} more...
                    </TagLabel>
                </Tag>
            </>
        );
    } else {
        tags = (
            <Tag size="sm" variant="subtle" colorScheme="red">
                {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}
                <TagLabel>
                    {" "}
                    {statusesById[person.personnel_ID][0].status_name}
                </TagLabel>
            </Tag>
        );
    }

    const [isChecked, setIsChecked] = useState(false);

    return (
        <Collapse in={isVisible} animateOpacity>
            {/* <SimpleGrid columns={{ sm: 1, lg: 2 }} my={3} spacing="6px"> */}
            <Flex my={3} w="100%">
                {/* <Box
                    flexGrow={1}
                    onClick={() => setIsChecked((prevState) => !prevState)}
                    cursor="pointer"
                >
         
                    <Stack direction="row">
                        <Center>
                            <Badge colorScheme="purple">{person.pes}</Badge>
                        </Center>
                        <Text fontWeight="semibold">
                            {person.rank} {person.name}
                        </Text>
                    </Stack>
                   
                    <Flex align="center">
                      
                        <Stack direction="row" my={1} wrap="wrap">
                            {tags}
                        </Stack>
                    </Flex>
                </Box> */}
                {/* <Spacer /> */}
                <Flex
                    alignItems="center"
                    m={{ lg: "unset", base: "auto" }}
                    w="100%"
                >
                    {/* <Checkbox
                        colorScheme="teal"
                        size="lg"
                        isChecked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                    /> */}
                    <Checkbox
                        colorScheme="teal"
                        size="md"
                        // isChecked={isChecked}
                        // onChange={(e) => setIsChecked(e.target.checked)}
                        flexDirection="row-reverse"
                        w="100%"
                        className="checkbox-reversed"
                        {...register(`status-personnel-${person.personnel_ID}`)}
                    >
                        <Box
                            // flexGrow={1}
                            // onClick={() =>
                            //     setIsChecked((prevState) => !prevState)
                            // }
                            cursor="pointer"
                        >
                            {/* <Flex align="center"> */}
                            <Stack direction="row">
                                <Center>
                                    <Badge colorScheme="purple">
                                        {person.pes}
                                    </Badge>
                                </Center>
                                <Text fontWeight="semibold">
                                    {person.rank} {person.name}
                                </Text>
                            </Stack>
                            {/* </Flex> */}
                            <Flex align="center">
                                {/* <Icon as={icon} mr={1} color={textColor} /> */}
                                {/* <Text textColor={textColor}> {person.location}</Text> */}
                                <Stack direction="row" my={1} wrap="wrap">
                                    {tags}
                                </Stack>
                            </Flex>
                        </Box>
                    </Checkbox>
                </Flex>
            </Flex>
            {/* </SimpleGrid> */}
            <Divider />
        </Collapse>
    );
};

const PlatoonAccordionItem: React.FC<{
    personnel: ExtendedPersonnel[];
    statusesById: { [key: string]: ExtendedStatus[] };
    platoon: string;
    selectedDate: Date;
    search: string;
}> = ({ personnel, platoon, selectedDate, statusesById, search }) => {
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
                    <PersonAccordionItem
                        selectedDate={selectedDate}
                        key={index}
                        person={person}
                        statusesById={statusesById}
                        search={search}
                    />
                ))}
            </AccordionPanel>
        </AccordionItem>
    );
};

const Confirmed: React.FC<{
    isPerm: boolean;
    sortedByPlatoon: { [key: string]: any };
    statusDate: [string, string];
    statuses: StatusOption[];
}> = ({ isPerm, sortedByPlatoon, statusDate, statuses }) => {
    const [secondsLeft, setSecondsLeft] = useState(10);
    const router = useRouter();
    useEffect(() => {
        if (secondsLeft <= 0) {
            // router.push("/personnel/manage/status");
            return;
        }
        const timeout = setTimeout(() => {
            setSecondsLeft((prevSecs) => prevSecs - 1);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [secondsLeft, setSecondsLeft, router]);
    return (
        <>
            <StatusHeading step={1}>
                <Heading> Statuses added </Heading>
                <Link href="/" passHref>
                    <Button
                        colorScheme="teal"
                        size="xs"
                        ml={2}
                        onClick={() => {}}
                    >
                        Back to home ({secondsLeft}s)
                    </Button>
                </Link>
            </StatusHeading>
            <Box textAlign="center">
                <Text>Successfully added</Text>

                {statuses.map((status) => (
                    <Tag size="sm" variant="subtle" colorScheme="red">
                        <TagLabel>{status.label}</TagLabel>
                    </Tag>
                ))}

                <Text> to the below personnel for </Text>

                <Text>
                    {" "}
                    {statusDate
                        .map((date) =>
                            format(
                                parse(
                                    date,
                                    Assignments.mysqldateformat,
                                    new Date()
                                ),
                                "eee d LLL yyyy" // TODO
                            )
                        )
                        .join(" to ")}
                </Text>
            </Box>
            <Accordion
                defaultIndex={Object.keys(sortedByPlatoon).map(
                    (_, index) => index
                )}
                allowMultiple
                allowToggle
            >
                {Object.keys(sortedByPlatoon).map((platoon, index1) => (
                    <AccordionItem key={index1}>
                        <Text>
                            <AccordionButton
                                _expanded={{
                                    bg: "gray.200",
                                }}
                            >
                                <Box flex={1} textAlign="left">
                                    {platoon} ({sortedByPlatoon[platoon].length}
                                    )
                                </Box>
                            </AccordionButton>
                        </Text>
                        <AccordionPanel
                            borderColor="gray.200"
                            borderWidth={2}
                            pb={4}
                        >
                            {sortedByPlatoon[platoon].map(
                                (person: Personnel, index2: number) => (
                                    <Box key={index2}>
                                        <Text fontWeight="semibold">
                                            {person.rank} {person.name}
                                        </Text>

                                        <Text>{person.platoon}</Text>
                                    </Box>
                                )
                            )}
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    );
};

const StatusManager: NextProtectedPage<{
    // selectedDate: Date;
    // session: Session;
}> = ({}) => {
    const { data: session } = useSession();
    let selectedDate = new Date();
    let formatted = format(selectedDate, Assignments.mysqldateformat);
    const { data, error } = useSWRImmutable<StatusData>(
        `/api/personnel/manage/status?date=${formatted}`,
        fetcher
    );

    const methods = useForm({ shouldUnregister: true });

    console.log({ data });
    console.log("rerendered");
    const [search, setSearch] = useState("");
    console.log(search);

    const defaultIndex = [0];
    const [index, setIndex] = useState(defaultIndex); // todo - set this to the user platoon
    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };

    
    useEffect(() => {
        console.log("Helloooo");
        if (search.length && data?.sortedByPlatoon) {
            // do stuff
            // Open all the tabs
            setIndex(
                Object.keys(data.sortedByPlatoon).map((_, index) => index)
            );
        } else {
            setIndex(defaultIndex);
        }
    }, [search, data?.sortedByPlatoon]);

    const dispatch = useDispatch();

    
    const router = useRouter()
    const onSubmit = async (data: { [key: string]: any }) => {
        console.log("submitted data", { data });
        const responseData = await sendPOST(
            "/api/personnel/manage/status",
            data
        );
        console.log({ responseData }, "--------------------------------");
        if (responseData.success) {
            // setSuccess(true);
            // setResponseData(responseData.data);
            dispatch(statusActions.updateData(responseData.data));
            router.push("/personnel/manage/status/confirm")
        }
    };

    const Content = (
        <>
            <StatusHeading step={0}>
                <Heading>{format(selectedDate, "eee d LLL yyyy")}</Heading>
                <Button
                    colorScheme="teal"
                    size="xs"
                    ml={2}
                    // onClick={() => clearSelection()}
                >
                    Clear
                </Button>
            </StatusHeading>
            {!data && <>Loading data...</>}
            {data && (
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <StatusInputs
                            data={data}
                            selectedDate={selectedDate}
                            setSearch={setSearch}
                        />
                        <Accordion
                            defaultIndex={[0]}
                            allowMultiple
                            allowToggle
                            index={index}
                            onChange={(e) => handleAccordion(e as number[])}
                        >
                            {Object.keys(data.sortedByPlatoon).map(
                                (platoon, index) => (
                                    <PlatoonAccordionItem
                                        selectedDate={selectedDate}
                                        key={index}
                                        personnel={
                                            data.sortedByPlatoon[platoon]
                                        }
                                        platoon={platoon}
                                        statusesById={data.statusesById}
                                        search={search}
                                    />
                                )
                            )}
                        </Accordion>
                        <Center mt={3}>
                            <Button type="submit"> Submit </Button>
                        </Center>
                    </form>
                </FormProvider>
            )}
        </>
    );
    return <Layout content={Content} session={session}></Layout>;
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
//     try {
//         const query = `SELECT status_tracker.*, status_list.*, personnel.personnel_ID, personnel.name, personnel.pes, personnel.platoon FROM status_tracker LEFT JOIN status_list ON status_tracker.status_ID = status_list.status_ID LEFT JOIN personnel ON personnel.personnel_ID = status_tracker.personnel_ID WHERE unit = ? AND company = ? AND DATE(ord) >= DATE(?) AND DATE(status_tracker.start) <= DATE(?) AND DATE(status_tracker.end) >= DATE(?)`;
//         const values = [
//             session.user.unit,
//             session.user.company,
//             selectedDate,
//             selectedDate,
//             selectedDate,
//         ];

//         const statusQuery = `SELECT status_ID, status_name FROM status_list`

//         const personnel: ExtendedPersonnel[] = await executeQuery({
//             query,
//             values,
//         });
//         const statusList: Status[] = await executeQuery({
//             query: statusQuery,
//         })
//         console.log({ personnel });
//         // Group by platoon
//         // TODO: type this better
//         const groupedByPlatoon = personnel.reduce<any>((r, a) => {
//             r[a.platoon as any] = [...(r[a.platoon as any] || []), a];
//             return r;
//         }, {});

//         console.log({ groupedByPlatoon });
//         return {
//             props: {
//                 session,
//                 // personnel,
//                 groupedByPlatoon,
//                 selectedDate,
//                 statusList
//             },
//         };
//     } catch (e) {
//         console.log(e);
//     }
// };

StatusManager.requireAuth = true;

export default StatusManager;
