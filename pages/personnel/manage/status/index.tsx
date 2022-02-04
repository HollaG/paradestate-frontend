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
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Stack,
    Tag,
    TagLabel,
    TagRightIcon,
    Text,
    useDisclosure,
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
import { useEffect, useMemo, useState } from "react";

import CustomStatusDateRangePicker from "../../../../components/Dates/CustomStatusDateRangePicker";
import SearchInput from "../../../../components/Personnel/Status/SearchInput";
import useSWRImmutable from "swr/immutable";
import StatusInputs from "../../../../components/Personnel/Status/StatusInputs";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import statusSlice, { statusActions } from "../../../../store/status-slice";
import StatusEntry from "../../../../components/Personnel/Status/StatusEntry";
import { IoOpenOutline } from "react-icons/io5";
import React from "react";

export interface StatusOption extends OptionBase {
    label: string;
    value: string;
}

const StatusModal: React.FC<{
    statuses: ExtendedStatus[];
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}> = ({ statuses, isOpen, onOpen, onClose }) => {
    // console.log({ statuses }, "----------------------------------");
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Status</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {statuses.map((status, index) => (
                        <Box key={index} my={3}>
                            <StatusEntry status={status} />
                            <Divider />
                        </Box>
                    ))}
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme="purple"
                        mr={3}
                        // onClick={onClickUrl(url)}
                    >
                        Edit statuses
                    </Button>

                    <Button mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    selectedDate: Date;
    statusesById: { [key: string]: ExtendedStatus[] };
    search: string;
}> = ({ person, selectedDate, statusesById, search }) => {
    // console.log("Person accordion item rerendering");
    const { register } = useFormContext();

    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    const { isOpen, onOpen, onClose } = useDisclosure();
    const modalOpenHandler = (
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>
    ) => {
        // TODO
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        onOpen();
    };
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
                <Tag
                    size="sm"
                    variant="subtle"
                    colorScheme="red"
                    onClick={modalOpenHandler}
                >
                    {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}
                    <TagLabel>
                        {" "}
                        {statusesById[person.personnel_ID][0].status_name}
                    </TagLabel>
                </Tag>
                <Tag
                    size="sm"
                    variant="subtle"
                    colorScheme="red"
                    onClick={modalOpenHandler}
                >
                    {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}
                    <TagLabel>
                        {" "}
                        + {statusesById[person.personnel_ID].length - 1} more...
                    </TagLabel>
                    <TagRightIcon as={IoOpenOutline} />
                </Tag>
            </>
        );
    } else {
        tags = (
            <Tag
                size="sm"
                variant="subtle"
                colorScheme="red"
                onClick={modalOpenHandler}
            >
                <TagLabel>
                    {statusesById[person.personnel_ID][0].status_name}
                </TagLabel>
                <TagRightIcon as={IoOpenOutline} />
            </Tag>
        );
    }

    const [isChecked, setIsChecked] = useState(false);

    return (
        <>
            <Collapse in={isVisible} animateOpacity>
                <Flex my={3} w="100%">
                    <Flex
                        alignItems="center"
                        m={{ lg: "unset", base: "auto" }}
                        w="100%"
                    >
                        <Checkbox
                            colorScheme="teal"
                            size="md"
                            // isChecked={isChecked}
                            // onChange={(e) => setIsChecked(e.target.checked)}
                            // flexDirection="row-reverse"
                            w="100%"
                            className="checkbox-custom"
                            {...register(
                                `status-personnel-${person.personnel_ID}`
                            )}
                        >
                            <Box cursor="pointer">
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

                                <Flex align="center">
                                    <Stack direction="row" my={1} wrap="wrap">
                                        {tags}
                                    </Stack>
                                </Flex>
                            </Box>
                        </Checkbox>
                    </Flex>
                </Flex>

                <Divider />
            </Collapse>
            {!!statusesById[person.personnel_ID] && (
                <StatusModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onOpen={onOpen}
                    statuses={statusesById[person.personnel_ID]}
                />
            )}
        </>
    );
};
const MemoizedPersonAccordionItem = React.memo(PersonAccordionItem);

const PlatoonAccordionItem: React.FC<{
    personnel: ExtendedPersonnel[];
    statusesById: { [key: string]: ExtendedStatus[] };
    platoon: string;
    selectedDate: Date;
    search: string;
}> = ({ personnel, platoon, selectedDate, statusesById, search }) => {
    // console.log("Platoon accordion item rerendering");
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
                    <MemoizedPersonAccordionItem
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
const MemoizedPlatoonAccordionItem = React.memo(PlatoonAccordionItem)

const StatusManager: NextProtectedPage<{
    // selectedDate: Date;
    // session: Session;
}> = ({}) => {
    // console.log("Rerendering statusmanager page");
    const { data: session } = useSession();
    let selectedDate = new Date();
    let formatted = format(selectedDate, Assignments.mysqldateformat);
    const { data, error } = useSWR<StatusData>(
        `/api/personnel/manage/status?date=${formatted}`,
        fetcher,
        
    );   
    const methods = useForm({ shouldUnregister: true });

    // console.log({ data });
    // console.log("rerendered");
    const [search, setSearch] = useState("");


    const defaultIndex = useMemo(() => [0], []);
    const [index, setIndex] = useState(defaultIndex); // todo - set this to the user platoon
    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };

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

    const dispatch = useDispatch();

    const router = useRouter();
    const onSubmit = async (data: { [key: string]: any }) => {

        const responseData = await sendPOST(
            "/api/personnel/manage/status/confirm",
            data
        );

        if (responseData.success) {
            // setSuccess(true);
            // setResponseData(responseData.data);
            dispatch(statusActions.updateData(responseData.data));
            router.push("/personnel/manage/status/confirm");
        } else { 
            alert(responseData.error)
        }
    };

    const Content = (
        <Stack direction="column">
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
                                    <MemoizedPlatoonAccordionItem
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
        </Stack>
    );
    return Content;
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
