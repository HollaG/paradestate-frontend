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
import SearchInput from "../../../../components/SearchInput";
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
}> = React.memo(({ statuses, isOpen, onOpen, onClose }) => {
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
});
StatusModal.displayName = "StatusModal";

const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    selectedDate: [Date, Date];
    statusesById: { [key: string]: ExtendedStatus[] };
    search: string;
    formattedStatusList: StatusOption[];
}> = ({ person, selectedDate, statusesById, search, formattedStatusList }) => {
    console.log("Person accordion item rerendering");
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

    const [isAdding, setIsAdding] = useState(false);
    const [numInputs, setNumInputs] = useState(1);
    const changeNumInputHandler = (type: "add" | "remove") => {
        if (type === "add") {
            setNumInputs((prev) => prev + 1);
        } else {
            setNumInputs((prev) => {
                if (prev === 1) return 1;
                return prev - 1;
            });
        }
    };
    return (
        <>
            <Collapse in={isVisible} animateOpacity>
                <SimpleGrid
                    columns={{ sm: 1, lg: 2 }}
                    spacing="6px"
                    my={3}
                    w="100%"
                >
                    <Flex
                        alignItems="center"
                        // m={{ lg: "unset", base: "auto" }}
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
                    </Flex>
                    <Flex alignItems="center" m={{ lg: "unset", base: "auto" }}>
                        {/* <ButtonGroup isAttached size="xs" ml={{ lg: "auto" }}> */}
                        {/* <Button
                                variant='solid'
                                // onClick={() => toggleHandler("off")}
                                // disabled={!!person.off_row_ID}
                            >
                                No status
                            </Button> */}
                        <Button
                            variant={isAdding ? "solid" : "outline"}
                            size="xs"
                            ml={{ lg: "auto" }}
                            onClick={() => setIsAdding((prev) => !prev)}
                            // disabled={!!person.leave_row_ID}
                        >
                            Add status
                        </Button>
                        {/* </ButtonGroup> */}
                    </Flex>
                </SimpleGrid>
                <Box p={2}>
                    <Collapse in={isAdding} animateOpacity unmountOnExit>
                        {[...Array.from(Array(numInputs).keys())].map(
                            (num, index) => (
                                <StatusInputs
                                    formattedStatusList={formattedStatusList}
                                    selectedDate={selectedDate}
                                    personnel_ID={person.personnel_ID}
                                    num={num}
                                    key={index}
                                />
                            )
                        )}
                        <Center mb={2}>
                            <Button
                                size="sm"
                                onClick={() => changeNumInputHandler("add")}
                            >
                                Add more
                            </Button>
                            {numInputs !== 1 && (
                                <Button
                                    ml={2}
                                    size="sm"
                                    onClick={() =>
                                        changeNumInputHandler("remove")
                                    }
                                >
                                    Remove last
                                </Button>
                            )}
                        </Center>
                    </Collapse>
                </Box>
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
    selectedDate: [Date, Date];
    search: string;
    formattedStatusList: StatusOption[];
}> = ({
    personnel,
    platoon,
    selectedDate,
    statusesById,
    search,
    formattedStatusList,
}) => {
    const { data: session } = useSession();
    const [rendered, setRendered] = useState(platoon === session?.user.platoon);
    // don't render the accordion panel by default, only render when use rclicks
    // This allows the page to be more performant as there is less stuff to hydrate
    // Render the accordion panel which corresponds to the user (will render if platoon === personnel[0].platoon)

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
                {rendered && personnel.map((person, index) => (
                    <MemoizedPersonAccordionItem
                        selectedDate={selectedDate}
                        key={index}
                        person={person}
                        statusesById={statusesById}
                        search={search}
                        formattedStatusList={formattedStatusList}
                    />
                ))}
            </AccordionPanel>
        </AccordionItem>
    );
};
const MemoizedPlatoonAccordionItem = React.memo(PlatoonAccordionItem);

const StatusManager: NextProtectedPage<{
    // selectedDate: Date;
    // session: Session;
}> = React.memo(({}) => {
    // console.log("Rerendering statusmanager page");
    const { data: session } = useSession();
    let selectedDate = new Date();
    let dates: [Date, Date] = [selectedDate, selectedDate];
    let formatted = format(selectedDate, Assignments.mysqldateformat);
    const { data, error } = useSWR<StatusData>(
        `/api/personnel/manage/status?date=${formatted}`,
        fetcher
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
        console.log({ data });
        const responseData = await sendPOST(
            "/api/personnel/manage/status/confirm",
            data
        );
        console.log({ responseData });

        if (responseData.success) {
            // setSuccess(true);
            // setResponseData(responseData.data);
            dispatch(statusActions.updateData(responseData.data));
            router.push("/personnel/manage/status/confirm");
        } else {
            alert(responseData.error);
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
            <SearchInput setSearch={setSearch} />
            {!data && <>Loading data...</>}
            {data && (
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        {/* <StatusInputs
                            data={data}
                            selectedDate={selectedDate}
                            // setSearch={setSearch}
                        /> */}
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
                                        selectedDate={dates}
                                        key={index}
                                        personnel={
                                            data.sortedByPlatoon[platoon]
                                        }
                                        platoon={platoon}
                                        statusesById={data.statusesById}
                                        search={search}
                                        formattedStatusList={
                                            data.formattedStatusList
                                        }
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
});
StatusManager.displayName = "StatusManager";

StatusManager.requireAuth = true;

export default StatusManager;
