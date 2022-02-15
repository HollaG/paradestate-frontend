// TODO - simplify the code by splitting the repetitive parts into functions
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Avatar,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Center,
    Checkbox,
    Collapse,
    Divider,
    Flex,
    Grid,
    GridItem,
    Heading,
    Select,
    SimpleGrid,
    Stack,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Tag,
    TagLabel,
    Text,
    useToast,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { RefObject, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { NextProtectedPage } from "../../../lib/auth";
import fetcher, { sendDELETE, sendPOST } from "../../../lib/fetcher";
import { Personnel } from "../../../types/database";
import Assignments from "../../../config/assignments.json";
import { format } from "date-fns";
import {
    calculateMonthsToOrFrom,
    capitalizeFirstLetter,
    convertToAMPM,
} from "../../../lib/custom";
import CustomCalendar from "../../../components/Calendar/CustomCalendar";
import { Event } from "react-big-calendar";
import {
    Data,
    EventData,
    ExtendedStatus,
    GenericEvent,
    MAEvent,
    OffOrLeaveEvent,
    OtherEvent,
} from "../../../types/types";
import {
    AddedAttCOrCourse,
    AddedLeaveOrOff,
    AddedMA,
    AddedOthers,
} from "../../../components/Dashboard/AddedEvent";
import StatusEntry from "../../../components/Personnel/Status/StatusEntry";
import ClickedContainerWrapper from "../../../components/Common/ClickedContainerWrapper";
import {
    ConfirmAttC,
    ConfirmCourse,
    ConfirmLeave,
    ConfirmMA,
    ConfirmOff,
    ConfirmOthers,
} from "../../../components/Dashboard/ConfirmEvent";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import CustomStatusDateRangePicker from "../../../components/Dates/CustomStatusDateRangePicker";

const types = [
    "All",
    "Off",
    "Leave",
    "AttC",
    "Course",
    "Others",
    "MA",
    "Status",
];

export interface PersonnelPageData {
    person: Personnel;
    eventData: {
        offs: {
            offsExpired: OffOrLeaveEvent[];
            offsActive: OffOrLeaveEvent[];
            offsUpcoming: OffOrLeaveEvent[];
        };
        leaves: {
            leavesExpired: OffOrLeaveEvent[];
            leavesActive: OffOrLeaveEvent[];
            leavesUpcoming: OffOrLeaveEvent[];
        };
        attcs: {
            attcsExpired: GenericEvent[];
            attcsActive: GenericEvent[];
            attcsUpcoming: GenericEvent[];
        };
        mas: {
            masUpcoming: MAEvent[];
            masActive: MAEvent[];
            masExpired: MAEvent[];
        };
        courses: {
            coursesExpired: GenericEvent[];
            coursesActive: GenericEvent[];
            coursesUpcoming: GenericEvent[];
        };
        others: {
            othersExpired: OtherEvent[];
            othersActive: OtherEvent[];
            othersUpcoming: OtherEvent[];
        };
        statuses: {
            statusesActive: ExtendedStatus[];
            statusesInactive: ExtendedStatus[];
            statusesDuplicates: ExtendedStatus[];
        };
    };
    calendarData: Event[];
    locationArr: (keyof Data)[];
    onStatus: boolean;
}

const DeleteDialog:React.FC<{
    isOpen: boolean,
    setIsOpen : React.Dispatch<React.SetStateAction<boolean>>
    confirmDelete: () => void
}> = ({isOpen, setIsOpen, confirmDelete}) => {
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const closeHandler = () => {
        confirmDelete()
        setIsOpen(false)
    }
    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete entry
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={closeHandler} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

const Editing: React.FC<{
    type: string;
    row_ID: string;
    data: any;
    personnel_ID: string;
    show: boolean;
}> = ({ type, row_ID, data, personnel_ID, show }) => {
    const { register, watch } = useFormContext();

    if (type === "leave" || type === "off") {
        return (
            <Collapse in={show} unmountOnExit>
                <Box>
                    {type === "off" ? (
                        <ConfirmOff
                            data={data}
                            personnel_ID={Number(personnel_ID)}
                            row_ID={row_ID}
                        />
                    ) : (
                        <ConfirmLeave
                            data={data}
                            personnel_ID={Number(personnel_ID)}
                            row_ID={row_ID}
                        />
                    )}
                </Box>
                <Center>
                    <Button type="submit" size="sm" colorScheme="teal">
                        Submit
                    </Button>
                </Center>
            </Collapse>
        );
    } else if (type === "attc" || type === "course") {
        return (
            <Collapse in={show} unmountOnExit>
                <Box>
                    {type === "attc" ? (
                        <ConfirmAttC
                            data={data}
                            personnel_ID={Number(personnel_ID)}
                            row_ID={row_ID}
                        />
                    ) : (
                        <ConfirmCourse
                            data={data}
                            personnel_ID={Number(personnel_ID)}
                            row_ID={row_ID}
                        />
                    )}
                </Box>
                <Center>
                    <Button type="submit" size="sm" colorScheme="teal">
                        Submit
                    </Button>
                </Center>
            </Collapse>
        );
    } else if (type === "ma") {
        return (
            <Collapse in={show} unmountOnExit>
                <Box>
                    <ConfirmMA
                        data={data}
                        personnel_ID={Number(personnel_ID)}
                        row_ID={row_ID}
                    />
                </Box>
                <Center>
                    <Button type="submit" size="sm" colorScheme="teal">
                        Submit
                    </Button>
                </Center>
            </Collapse>
        );
    } else if (type === "others") {
        return (
            <Collapse in={show} unmountOnExit>
                <Box>
                    <ConfirmOthers
                        data={data}
                        personnel_ID={Number(personnel_ID)}
                        row_ID={row_ID}
                    />
                </Box>
                <Center>
                    <Button type="submit" size="sm" colorScheme="teal">
                        Submit
                    </Button>
                </Center>
            </Collapse>
        );
    } else if (type === "status") {
        const dates: [Date, Date] = [new Date(data.start), new Date(data.end)];
        const watchCheckbox = watch(`${row_ID}-status-perm`, true);
        return (
            <Collapse in={show} unmountOnExit>
                <Box p={2}>
                    {/* <StatusInputs
                        selectedDate={
                            statusGroup.date.map(
                                (dateStr) => new Date(dateStr)
                            ) as [Date, Date]
                        }
                        formattedStatusList={statuses}
                        personnel_ID={person.personnel_ID}
                        num={Number(num)}
                        key={index}
                        defaultStatuses={statusGroup.selected}
                        defaultPerm={statusGroup.perm}
                    /> */}
                    <Checkbox
                        size="sm"
                        flexGrow={1}
                        // isChecked={perm}
                        // onChange={(e) => setPerm(e.target.checked)}
                        defaultChecked={data.type === "perm"}
                        {...register(`${row_ID}-status-perm`)}
                        colorScheme="teal"
                    >
                        Perm
                    </Checkbox>
                    <Collapse unmountOnExit in={!watchCheckbox}>
                        <CustomStatusDateRangePicker
                            startLeftAdorn="Start"
                            startPlaceholder="Status start date"
                            endLeftAdorn="End"
                            endPlaceholder="Status end date"
                            defaultValues={
                                data.type !== "perm" ? dates : undefined
                            }
                            personnel_ID={Number(personnel_ID)}
                            row_ID={row_ID}
                        />
                    </Collapse>
                </Box>
                <Center>
                    <Button type="submit" size="sm" colorScheme="teal">
                        Submit
                    </Button>
                </Center>
            </Collapse>
        );
    }
    return <> </>;
};

const PersonnelPage: NextProtectedPage = () => {
    const router = useRouter();
    const [type, setType] = useState<typeof types[number]>("All");
    const personnel_ID = router.query.p_ID;
    const { data, error, mutate } = useSWR<PersonnelPageData>(
        `/api/personnel/manage/${personnel_ID}`,
        fetcher
    );
    console.log({ data });

    const [clickedType, setClickedType] = useState(null);
    const [clickedID, setClickedID] = useState(null);
    const [refresher, setRefresher] = useState(false);
    const eventOnClick = React.useCallback(
        (event: any) => {
            // router.push(`${router.asPath}#${event.type}-${event.id}`);
            setClickedType(event.type ?? "status");
            setClickedID(event.id ?? null);
            setRefresher((prev) => !prev);
        },
        [setClickedType, setClickedID, setRefresher]
    );
    const scrollRef = useRef<HTMLDivElement>(null);
    console.log({ clickedType, clickedID });
    useEffect(() => {
        if (scrollRef && scrollRef.current) {
            window.scrollTo({
                top:
                    scrollRef.current.offsetTop -
                    (window.innerHeight - scrollRef.current.offsetHeight) / 2,
                left: 0,
                behavior: "smooth",
            });
        }
    }, [scrollRef, refresher]);

    const methods = useForm({ shouldUnregister: true });
    const [editingID, setEditingID] = useState<string>();
    const toast = useToast();
    const editHandler = async (data: any) => {
        console.log("Submitted data:", { data });
        const responseData = await sendPOST(
            `/api/personnel/manage/${personnel_ID}`,
            {
                type: editingID?.split("-")[0],
                data,
            }
        );
        if (responseData.success) {
            toast({
                title: "Success",
                description: "Successfully edited",
                status: "success",
            });
            setEditingID(undefined);
            mutate();
            methods.reset();
        } else {
            toast({
                title: "Error",
                description: responseData.error?.message,
                status: "error",
            });
        }
    };

    const [deleteType, setDeleteType] = useState("")
    const [deleteID, setDeleteID] = useState("")
    const deleteHandler = (type: string, id: string) => {
        setIsOpen(true);
        setDeleteType(type);
        setDeleteID(id);

    }
    const [isOpen, setIsOpen] = React.useState(false);
    const confirmDelete = async () => {
        console.log("Deleting...")

        const responseData = await sendDELETE(`/api/personnel/manage/${personnel_ID}`, {
            type: deleteType, id: deleteID
        })
        
        if (responseData.success) { 
            toast({
                title: "Success",
                description: "Successfully deleted",
                status: "success",
            });
            mutate();
        } else { 
            toast({
                title: "Error",
                description: responseData.error?.message,
                status: "error",
            });
        }

    }

    return (
        <>
            <DeleteDialog isOpen={isOpen} setIsOpen={setIsOpen} confirmDelete={confirmDelete} />
            {router && data && data.person ? (
                <Stack direction="column">
                    <Grid
                        templateColumns={{
                            base: "repeat(1, 1fr)",
                            lg: "repeat(6, 1fr)",
                        }}
                        templateRows={{
                            base: "repeat(2, 1fr)",
                            lg: "repeat(1, 1fr)",
                        }}
                        gap={{
                            base: 0,
                            lg: 4,
                        }}
                    >
                        <GridItem minW="180px">
                            <Center>
                                <Avatar
                                    src="/user.png"
                                    size="2xl"
                                    name={data.person.name}
                                    bgColor="teal"
                                    color="gray.300"
                                />
                            </Center>
                        </GridItem>
                        <GridItem
                            colSpan={5}
                            mt={2}
                            display="flex"
                            justifyContent={{ base: "center", lg: "unset" }}
                        >
                            <Box>
                                {/* <Stack direction="row" alignItems="center">
                                     <Box>
                                        <Badge
                                            colorScheme="purple"
                                            fontSize={{ base: "lg", lg: "2xl" }}
                                        >
                                            {data.person.pes}
                                        </Badge>
                                    </Box> 
                                    <Heading size="2xl" textAlign="center">
                                        {data.person.rank} {data.person.name}
                                    </Heading>
                                </Stack> */}
                                <Box
                                    // columns={{ base: 1, lg: 2 }}
                                    // spacing={2}
                                    // re
                                    display={{ base: "block", lg: "flex" }}
                                    flexDirection="row-reverse"
                                >
                                    <Flex
                                        gridRow={{ base: 1, lg: "unset" }}
                                        alignItems="center"
                                        justifyContent={{
                                            base: "center",
                                            lg: "unset",
                                        }}
                                        wrap="wrap"
                                    >
                                        {/* <Badge
                                            colorScheme="purple"
                                            // fontSize={{ base: "lg", lg: "2xl" }}
                                        >
                                            {data.onStatus
                                                ? "On status"
                                                : "No active status"}
                                        </Badge> */}
                                        {data.locationArr.length ? (
                                            data.locationArr.map(
                                                (location, index) => (
                                                    <Tag
                                                        colorScheme="red"
                                                        key={index}
                                                        mr={1}
                                                    >
                                                        <TagLabel>
                                                            On{" "}
                                                            {capitalizeFirstLetter(
                                                                location
                                                            )}
                                                        </TagLabel>
                                                    </Tag>
                                                )
                                            )
                                        ) : (
                                            <Tag colorScheme="green" mr={1}>
                                                <TagLabel>In camp</TagLabel>
                                            </Tag>
                                        )}
                                        <Tag
                                            colorScheme={
                                                data.onStatus ? "red" : "green"
                                            }
                                        >
                                            <TagLabel>
                                                {data.onStatus
                                                    ? "On status"
                                                    : "No active status"}
                                            </TagLabel>
                                        </Tag>
                                    </Flex>
                                    <Heading
                                        size="2xl"
                                        textAlign="center"
                                        mr={{ base: 0, lg: 2 }}
                                    >
                                        {data.person.rank} {data.person.name}
                                    </Heading>
                                </Box>
                                <Flex
                                    justifyContent={{
                                        base: "center",
                                        lg: "unset",
                                    }}
                                >
                                    {/* <Tag
                                        variant="solid"
                                        colorScheme="teal"
                                        size="lg"
                                        mt={2}
                                    >
                                        <TagLabel>
                                            {" "}
                                            {data.person.platoon}
                                        </TagLabel>
                                    </Tag> */}
                                    <Text
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        textAlign="center"
                                    >
                                        {data.person.unit} {data.person.company}{" "}
                                        {data.person.platoon}
                                    </Text>
                                </Flex>
                            </Box>
                        </GridItem>
                        <GridItem>
                            <SimpleGrid
                                columns={{ base: 2, lg: 1 }}
                                spacing={2}
                            >
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Service status </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.svc_status}
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> PES </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.pes}
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText>
                            {" "}
                            When this person was posted into the company{" "}
                        </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Post-in </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {" "}
                                            {format(
                                                new Date(data.person.post_in),
                                                Assignments.dateformat
                                            )}
                                        </Badge>
                                    </StatNumber>
                                    <StatHelpText>
                                        {calculateMonthsToOrFrom([
                                            new Date(data.person.post_in),
                                            new Date(),
                                        ])}
                                    </StatHelpText>
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> ORD </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {format(
                                                new Date(data.person.ord),
                                                Assignments.dateformat
                                            )}
                                        </Badge>
                                    </StatNumber>
                                    <StatHelpText>
                                        {calculateMonthsToOrFrom([
                                            new Date(data.person.ord),
                                            new Date(),
                                        ])}
                                    </StatHelpText>
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Leaves taken </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.leave_balance} days
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText> </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Offs taken </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.off_balance} days
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText> </StatHelpText> */}
                                </Stat>
                                <Stat
                                    textAlign={{ base: "center", lg: "unset" }}
                                >
                                    <StatLabel> Personnel ID</StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.person.personnel_ID}
                                        </Badge>
                                    </StatNumber>
                                    {/* <StatHelpText>
                            {" "}
                            For internal reference only{" "}
                        </StatHelpText> */}
                                </Stat>
                            </SimpleGrid>
                        </GridItem>
                        <GridItem colSpan={5} mt={2}>
                            <CustomCalendar
                                data={data}
                                onClick={eventOnClick}
                            />
                        </GridItem>
                        <GridItem>
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
                        </GridItem>
                        <GridItem colSpan={5}>
                            <FormProvider {...methods}>
                                <form
                                    onSubmit={methods.handleSubmit(editHandler)}
                                >
                                    <Stack direction="column">
                                        <Collapse
                                            in={
                                                type === "Off" || type === "All"
                                            }
                                        >
                                            <Stack direction="column">
                                                <Heading> Offs </Heading>
                                                <Stack direction="column">
                                                    {(
                                                        [
                                                            {
                                                                label: "Active",
                                                                key: "offsActive",
                                                            },
                                                            {
                                                                label: "Upcoming",
                                                                key: "offsUpcoming",
                                                            },
                                                            {
                                                                label: "Expired",
                                                                key: "offsExpired",
                                                            },
                                                        ] as {
                                                            label: string;
                                                            key: keyof typeof data.eventData.offs;
                                                        }[]
                                                    ).map((pair, index) => (
                                                        <Box key={index}>
                                                            <Text
                                                                fontSize="lg"
                                                                fontWeight="bold"
                                                            >
                                                                {pair.label} (
                                                                {
                                                                    data
                                                                        .eventData
                                                                        .offs[
                                                                        pair.key
                                                                    ].length
                                                                }
                                                                )
                                                            </Text>
                                                            <Stack
                                                                direction="column"
                                                                divider={
                                                                    <Divider />
                                                                }
                                                            >
                                                                {data.eventData.offs[
                                                                    pair.key
                                                                ].map(
                                                                    (
                                                                        off,
                                                                        index
                                                                    ) => (
                                                                        <ClickedContainerWrapper
                                                                            key={
                                                                                index
                                                                            }
                                                                            condition={
                                                                                clickedType ===
                                                                                    "off" &&
                                                                                clickedID ===
                                                                                    off.row_ID
                                                                            }
                                                                            scrollId={`off-${off.row_ID}`}
                                                                            ref={
                                                                                scrollRef
                                                                            }
                                                                        >
                                                                            <Flex
                                                                                justifyContent="space-between"
                                                                                alignItems="center"
                                                                            >
                                                                                <AddedLeaveOrOff
                                                                                    data={{
                                                                                        "end-time":
                                                                                            off.end_time,
                                                                                        "start-time":
                                                                                            off.start_time,
                                                                                        date: [
                                                                                            off.start.toString(),
                                                                                            off.end.toString(),
                                                                                        ],
                                                                                        reason: off.reason,
                                                                                    }}
                                                                                />
                                                                                <ButtonGroup
                                                                                    size="sm"
                                                                                    isAttached
                                                                                >
                                                                                    <Button colorScheme="red" onClick={() => deleteHandler("off", off.row_ID)}>
                                                                                        Delete
                                                                                    </Button>
                                                                                    <Button
                                                                                        colorScheme="teal"
                                                                                        onClick={() =>
                                                                                            setEditingID(
                                                                                                (
                                                                                                    prevState
                                                                                                ) =>
                                                                                                    prevState ===
                                                                                                    `off-${off.row_ID}`
                                                                                                        ? ""
                                                                                                        : `off-${off.row_ID}`
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Edit
                                                                                    </Button>
                                                                                </ButtonGroup>
                                                                            </Flex>
                                                                            <Editing
                                                                                type="off"
                                                                                row_ID={
                                                                                    off.row_ID
                                                                                }
                                                                                personnel_ID={
                                                                                    off.personnel_ID
                                                                                }
                                                                                data={{
                                                                                    "end-time":
                                                                                        off.end_time,
                                                                                    "start-time":
                                                                                        off.start_time,
                                                                                    date: [
                                                                                        off.start.toString(),
                                                                                        off.end.toString(),
                                                                                    ],
                                                                                    reason: off.reason,
                                                                                }}
                                                                                show={
                                                                                    editingID ===
                                                                                    `off-${off.row_ID}`
                                                                                }
                                                                            />
                                                                        </ClickedContainerWrapper>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        </Collapse>
                                        <Collapse
                                            in={
                                                type === "Leave" ||
                                                type === "All"
                                            }
                                        >
                                            <Stack direction="column">
                                                <Heading> Leaves </Heading>
                                                <Stack direction="column">
                                                    {(
                                                        [
                                                            {
                                                                label: "Active",
                                                                key: "leavesActive",
                                                            },
                                                            {
                                                                label: "Upcoming",
                                                                key: "leavesUpcoming",
                                                            },
                                                            {
                                                                label: "Expired",
                                                                key: "leavesExpired",
                                                            },
                                                        ] as {
                                                            label: string;
                                                            key: keyof typeof data.eventData.leaves;
                                                        }[]
                                                    ).map((pair, index) => (
                                                        <Box key={index}>
                                                            <Text
                                                                fontSize="lg"
                                                                fontWeight="bold"
                                                            >
                                                                {pair.label} (
                                                                {
                                                                    data
                                                                        .eventData
                                                                        .leaves[
                                                                        pair.key
                                                                    ].length
                                                                }
                                                                )
                                                            </Text>
                                                            <Stack
                                                                direction="column"
                                                                divider={
                                                                    <Divider />
                                                                }
                                                            >
                                                                {data.eventData.leaves[
                                                                    pair.key
                                                                ].map(
                                                                    (
                                                                        leave,
                                                                        index
                                                                    ) => (
                                                                        <ClickedContainerWrapper
                                                                            key={
                                                                                index
                                                                            }
                                                                            condition={
                                                                                clickedType ===
                                                                                    "leave" &&
                                                                                clickedID ===
                                                                                    leave.row_ID
                                                                            }
                                                                            scrollId={`leave-${leave.row_ID}`}
                                                                            ref={
                                                                                scrollRef
                                                                            }
                                                                        >
                                                                            <Flex
                                                                                justifyContent="space-between"
                                                                                alignItems="center"
                                                                            >
                                                                                <AddedLeaveOrOff
                                                                                    data={{
                                                                                        "end-time":
                                                                                            leave.end_time,
                                                                                        "start-time":
                                                                                            leave.start_time,
                                                                                        date: [
                                                                                            leave.start.toString(),
                                                                                            leave.end.toString(),
                                                                                        ],
                                                                                        reason: leave.reason,
                                                                                    }}
                                                                                />
                                                                                <ButtonGroup
                                                                                    size="sm"
                                                                                    isAttached
                                                                                >
                                                                                    <Button colorScheme="red" onClick={() => deleteHandler("leave", leave.row_ID)}>
                                                                                        Delete
                                                                                    </Button>
                                                                                    <Button
                                                                                        colorScheme="teal"
                                                                                        onClick={() =>
                                                                                            setEditingID(
                                                                                                (
                                                                                                    prevState
                                                                                                ) =>
                                                                                                    prevState ===
                                                                                                    `leave-${leave.row_ID}`
                                                                                                        ? ""
                                                                                                        : `leave-${leave.row_ID}`
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Edit
                                                                                    </Button>
                                                                                </ButtonGroup>
                                                                            </Flex>
                                                                            <Editing
                                                                                type="leave"
                                                                                row_ID={
                                                                                    leave.row_ID
                                                                                }
                                                                                personnel_ID={
                                                                                    leave.personnel_ID
                                                                                }
                                                                                data={{
                                                                                    "end-time":
                                                                                        leave.end_time,
                                                                                    "start-time":
                                                                                        leave.start_time,
                                                                                    date: [
                                                                                        leave.start.toString(),
                                                                                        leave.end.toString(),
                                                                                    ],
                                                                                    reason: leave.reason,
                                                                                }}
                                                                                show={
                                                                                    editingID ===
                                                                                    `leave-${leave.row_ID}`
                                                                                }
                                                                            />
                                                                        </ClickedContainerWrapper>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        </Collapse>
                                        <Collapse
                                            in={
                                                type === "AttC" ||
                                                type === "All"
                                            }
                                        >
                                            <Stack direction="column">
                                                <Heading> AttCs </Heading>
                                                {(
                                                    [
                                                        {
                                                            label: "Active",
                                                            key: "attcsActive",
                                                        },
                                                        {
                                                            label: "Upcoming",
                                                            key: "attcsUpcoming",
                                                        },
                                                        {
                                                            label: "Expired",
                                                            key: "attcsExpired",
                                                        },
                                                    ] as {
                                                        label: string;
                                                        key: keyof typeof data.eventData.attcs;
                                                    }[]
                                                ).map((pair, index) => (
                                                    <Box key={index}>
                                                        <Text
                                                            fontSize="lg"
                                                            fontWeight="bold"
                                                        >
                                                            {pair.label} (
                                                            {
                                                                data.eventData
                                                                    .attcs[
                                                                    pair.key
                                                                ].length
                                                            }
                                                            )
                                                        </Text>
                                                        <Stack
                                                            direction="column"
                                                            divider={
                                                                <Divider />
                                                            }
                                                        >
                                                            {data.eventData.attcs[
                                                                pair.key
                                                            ].map(
                                                                (
                                                                    attc,
                                                                    index
                                                                ) => (
                                                                    <ClickedContainerWrapper
                                                                        key={
                                                                            index
                                                                        }
                                                                        condition={
                                                                            clickedType ===
                                                                                "attc" &&
                                                                            clickedID ===
                                                                                attc.row_ID
                                                                        }
                                                                        scrollId={`attc-${attc.row_ID}`}
                                                                        ref={
                                                                            scrollRef
                                                                        }
                                                                    >
                                                                        <Flex
                                                                            justifyContent="space-between"
                                                                            alignItems="center"
                                                                        >
                                                                            <AddedAttCOrCourse
                                                                                data={{
                                                                                    date: [
                                                                                        attc.start.toString(),
                                                                                        attc.end.toString(),
                                                                                    ],
                                                                                    reason: attc.attc_name,
                                                                                }}
                                                                            />
                                                                            <ButtonGroup
                                                                                size="sm"
                                                                                isAttached
                                                                            >
                                                                                <Button colorScheme="red" onClick={() => deleteHandler("attc", attc.row_ID)}>
                                                                                    Delete
                                                                                </Button>
                                                                                <Button
                                                                                    colorScheme="teal"
                                                                                    onClick={() =>
                                                                                        setEditingID(
                                                                                            (
                                                                                                prevState
                                                                                            ) =>
                                                                                                prevState ===
                                                                                                `attc-${attc.row_ID}`
                                                                                                    ? ""
                                                                                                    : `attc-${attc.row_ID}`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            </ButtonGroup>
                                                                        </Flex>
                                                                        <Editing
                                                                            type="attc"
                                                                            row_ID={
                                                                                attc.row_ID
                                                                            }
                                                                            personnel_ID={
                                                                                attc.personnel_ID
                                                                            }
                                                                            data={{
                                                                                date: [
                                                                                    attc.start.toString(),
                                                                                    attc.end.toString(),
                                                                                ],
                                                                                reason: attc.attc_name,
                                                                            }}
                                                                            show={
                                                                                editingID ===
                                                                                `attc-${attc.row_ID}`
                                                                            }
                                                                        />
                                                                    </ClickedContainerWrapper>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Collapse>
                                        <Collapse
                                            in={
                                                type === "Course" ||
                                                type === "All"
                                            }
                                        >
                                            <Stack direction="column">
                                                <Heading> Courses </Heading>
                                                {(
                                                    [
                                                        {
                                                            label: "Active",
                                                            key: "coursesActive",
                                                        },
                                                        {
                                                            label: "Upcoming",
                                                            key: "coursesUpcoming",
                                                        },
                                                        {
                                                            label: "Expired",
                                                            key: "coursesExpired",
                                                        },
                                                    ] as {
                                                        label: string;
                                                        key: keyof typeof data.eventData.courses;
                                                    }[]
                                                ).map((pair, index) => (
                                                    <Box key={index}>
                                                        <Text
                                                            fontSize="lg"
                                                            fontWeight="bold"
                                                        >
                                                            {pair.label} (
                                                            {
                                                                data.eventData
                                                                    .courses[
                                                                    pair.key
                                                                ].length
                                                            }
                                                            )
                                                        </Text>
                                                        <Stack
                                                            direction="column"
                                                            divider={
                                                                <Divider />
                                                            }
                                                        >
                                                            {data.eventData.courses[
                                                                pair.key
                                                            ].map(
                                                                (
                                                                    course,
                                                                    index
                                                                ) => (
                                                                    <ClickedContainerWrapper
                                                                        key={
                                                                            index
                                                                        }
                                                                        condition={
                                                                            clickedType ===
                                                                                "course" &&
                                                                            clickedID ===
                                                                                course.row_ID
                                                                        }
                                                                        scrollId={`course-${course.row_ID}`}
                                                                        ref={
                                                                            scrollRef
                                                                        }
                                                                    >
                                                                        <Flex
                                                                            justifyContent="space-between"
                                                                            alignItems="center"
                                                                        >
                                                                            <AddedAttCOrCourse
                                                                                data={{
                                                                                    date: [
                                                                                        course.start.toString(),
                                                                                        course.end.toString(),
                                                                                    ],
                                                                                    name: course.course_name,
                                                                                }}
                                                                            />
                                                                            <ButtonGroup
                                                                                size="sm"
                                                                                isAttached
                                                                            >
                                                                                <Button colorScheme="red" onClick={() => deleteHandler("course", course.row_ID)}>
                                                                                    Delete
                                                                                </Button>
                                                                                <Button
                                                                                    colorScheme="teal"
                                                                                    onClick={() =>
                                                                                        setEditingID(
                                                                                            (
                                                                                                prevState
                                                                                            ) =>
                                                                                                prevState ===
                                                                                                `course-${course.row_ID}`
                                                                                                    ? ""
                                                                                                    : `course-${course.row_ID}`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            </ButtonGroup>
                                                                        </Flex>
                                                                        <Editing
                                                                            type="course"
                                                                            row_ID={
                                                                                course.row_ID
                                                                            }
                                                                            personnel_ID={
                                                                                course.personnel_ID
                                                                            }
                                                                            data={{
                                                                                date: [
                                                                                    course.start.toString(),
                                                                                    course.end.toString(),
                                                                                ],
                                                                                name: course.course_name,
                                                                            }}
                                                                            show={
                                                                                editingID ===
                                                                                `course-${course.row_ID}`
                                                                            }
                                                                        />
                                                                    </ClickedContainerWrapper>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Collapse>
                                        <Collapse
                                            in={type === "MA" || type === "All"}
                                        >
                                            <Stack direction="column">
                                                <Heading>
                                                    {" "}
                                                    Medical Appointments{" "}
                                                </Heading>
                                                {(
                                                    [
                                                        {
                                                            label: "Active",
                                                            key: "masActive",
                                                        },
                                                        {
                                                            label: "Upcoming",
                                                            key: "masUpcoming",
                                                        },
                                                        {
                                                            label: "Expired",
                                                            key: "masExpired",
                                                        },
                                                    ] as {
                                                        label: string;
                                                        key: keyof typeof data.eventData.mas;
                                                    }[]
                                                ).map((pair, index) => (
                                                    <Box key={index}>
                                                        <Text
                                                            fontSize="lg"
                                                            fontWeight="bold"
                                                        >
                                                            {pair.label} (
                                                            {
                                                                data.eventData
                                                                    .mas[
                                                                    pair.key
                                                                ].length
                                                            }
                                                            )
                                                        </Text>
                                                        <Stack
                                                            direction="column"
                                                            divider={
                                                                <Divider />
                                                            }
                                                        >
                                                            {data.eventData.mas[
                                                                pair.key
                                                            ].map(
                                                                (ma, index) => (
                                                                    <ClickedContainerWrapper
                                                                        key={
                                                                            index
                                                                        }
                                                                        condition={
                                                                            clickedType ===
                                                                                "ma" &&
                                                                            clickedID ===
                                                                                ma.row_ID
                                                                        }
                                                                        scrollId={`ma-${ma.row_ID}`}
                                                                        ref={
                                                                            scrollRef
                                                                        }
                                                                    >
                                                                        <Flex
                                                                            justifyContent="space-between"
                                                                            alignItems="center"
                                                                        >
                                                                            <AddedMA
                                                                                data={{
                                                                                    name: ma.ma_name,
                                                                                    location:
                                                                                        ma.location,
                                                                                    incamp: ma.in_camp,
                                                                                    "date-time-formatted": `${format(
                                                                                        new Date(
                                                                                            ma.date
                                                                                        ),
                                                                                        Assignments.dateformat
                                                                                    )} ${convertToAMPM(
                                                                                        ma.time
                                                                                    )}`,
                                                                                }}
                                                                            />
                                                                            <ButtonGroup
                                                                                size="sm"
                                                                                isAttached
                                                                            >
                                                                                <Button colorScheme="red" onClick={() => deleteHandler("ma", ma.row_ID)}>
                                                                                    Delete
                                                                                </Button>
                                                                                <Button
                                                                                    colorScheme="teal"
                                                                                    onClick={() =>
                                                                                        setEditingID(
                                                                                            (
                                                                                                prevState
                                                                                            ) =>
                                                                                                prevState ===
                                                                                                `ma-${ma.row_ID}`
                                                                                                    ? ""
                                                                                                    : `ma-${ma.row_ID}`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            </ButtonGroup>
                                                                        </Flex>
                                                                        <Editing
                                                                            type="ma"
                                                                            row_ID={
                                                                                ma.row_ID
                                                                            }
                                                                            personnel_ID={
                                                                                ma.personnel_ID
                                                                            }
                                                                            data={{
                                                                                name: ma.ma_name,
                                                                                location:
                                                                                    ma.location,
                                                                                incamp: ma.in_camp,
                                                                                "date-time-formatted": `${format(
                                                                                    new Date(
                                                                                        ma.date
                                                                                    ),
                                                                                    Assignments.dateformat
                                                                                )} ${convertToAMPM(
                                                                                    ma.time
                                                                                )}`,
                                                                            }}
                                                                            show={
                                                                                editingID ===
                                                                                `ma-${ma.row_ID}`
                                                                            }
                                                                        />
                                                                    </ClickedContainerWrapper>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Collapse>
                                        <Collapse
                                            in={
                                                type === "Others" ||
                                                type === "All"
                                            }
                                        >
                                            <Stack direction="column">
                                                <Heading> Others </Heading>
                                                {(
                                                    [
                                                        {
                                                            label: "Active",
                                                            key: "othersActive",
                                                        },
                                                        {
                                                            label: "Upcoming",
                                                            key: "othersUpcoming",
                                                        },
                                                        {
                                                            label: "Expired",
                                                            key: "othersExpired",
                                                        },
                                                    ] as {
                                                        label: string;
                                                        key: keyof typeof data.eventData.others;
                                                    }[]
                                                ).map((pair, index) => (
                                                    <Box key={index}>
                                                        <Text
                                                            fontSize="lg"
                                                            fontWeight="bold"
                                                        >
                                                            {pair.label} (
                                                            {
                                                                data.eventData
                                                                    .others[
                                                                    pair.key
                                                                ].length
                                                            }
                                                            )
                                                        </Text>
                                                        <Stack
                                                            direction="column"
                                                            divider={
                                                                <Divider />
                                                            }
                                                        >
                                                            {data.eventData.others[
                                                                pair.key
                                                            ].map(
                                                                (
                                                                    other,
                                                                    index
                                                                ) => (
                                                                    <ClickedContainerWrapper
                                                                        key={
                                                                            index
                                                                        }
                                                                        condition={
                                                                            clickedType ===
                                                                                "others" &&
                                                                            clickedID ===
                                                                                other.row_ID
                                                                        }
                                                                        scrollId={`others-${other.row_ID}`}
                                                                        ref={
                                                                            scrollRef
                                                                        }
                                                                    >
                                                                        <Flex
                                                                            justifyContent="space-between"
                                                                            alignItems="center"
                                                                        >
                                                                            <AddedOthers
                                                                                data={{
                                                                                    date: [
                                                                                        other.start.toString(),
                                                                                        other.end.toString(),
                                                                                    ],
                                                                                    name: other.others_name,
                                                                                    incamp: other.in_camp,
                                                                                }}
                                                                            />
                                                                            <ButtonGroup
                                                                                size="sm"
                                                                                isAttached
                                                                            >
                                                                                <Button colorScheme="red" onClick={() => deleteHandler("others", other.row_ID)}>
                                                                                    Delete
                                                                                </Button>
                                                                                <Button
                                                                                    colorScheme="teal"
                                                                                    onClick={() =>
                                                                                        setEditingID(
                                                                                            (
                                                                                                prevState
                                                                                            ) =>
                                                                                                prevState ===
                                                                                                `others-${other.row_ID}`
                                                                                                    ? ""
                                                                                                    : `others-${other.row_ID}`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            </ButtonGroup>
                                                                        </Flex>
                                                                        <Editing
                                                                            type="others"
                                                                            row_ID={
                                                                                other.row_ID
                                                                            }
                                                                            personnel_ID={
                                                                                other.personnel_ID
                                                                            }
                                                                            data={{
                                                                                date: [
                                                                                    other.start.toString(),
                                                                                    other.end.toString(),
                                                                                ],
                                                                                name: other.others_name,
                                                                                incamp: other.in_camp,
                                                                            }}
                                                                            show={
                                                                                editingID ===
                                                                                `others-${other.row_ID}`
                                                                            }
                                                                        />
                                                                    </ClickedContainerWrapper>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Collapse>
                                        <Collapse
                                            in={
                                                type === "Status" ||
                                                type === "All"
                                            }
                                        >
                                            <Stack direction="column">
                                                <Heading> Statuses </Heading>
                                                {(
                                                    [
                                                        {
                                                            label: "Active",
                                                            key: "statusesActive",
                                                        },
                                                        {
                                                            label: "Inactive",
                                                            key: "statusesInactive",
                                                        },
                                                        {
                                                            label: "Duplicates",
                                                            key: "statusesDuplicates",
                                                        },
                                                    ] as {
                                                        label: string;
                                                        key: keyof typeof data.eventData.statuses;
                                                    }[]
                                                ).map((pair, index) => (
                                                    <Box key={index}>
                                                        <Text
                                                            fontSize="lg"
                                                            fontWeight="bold"
                                                        >
                                                            {pair.label} (
                                                            {
                                                                data.eventData
                                                                    .statuses[
                                                                    pair.key
                                                                ].length
                                                            }
                                                            )
                                                        </Text>
                                                        <Stack
                                                            direction="column"
                                                            divider={
                                                                <Divider />
                                                            }
                                                        >
                                                            {data.eventData.statuses[
                                                                pair.key
                                                            ].map(
                                                                (
                                                                    status,
                                                                    index
                                                                ) => (
                                                                    // <StatusEntry
                                                                    //     key={
                                                                    //         index
                                                                    //     }
                                                                    //     status={
                                                                    //         status
                                                                    //     }
                                                                    // />
                                                                    <Box
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <Flex
                                                                            justifyContent="space-between"
                                                                            alignItems="center"
                                                                        >
                                                                            <StatusEntry
                                                                                key={
                                                                                    index
                                                                                }
                                                                                status={
                                                                                    status
                                                                                }
                                                                            />
                                                                            <ButtonGroup
                                                                                size="sm"
                                                                                isAttached
                                                                            >
                                                                                <Button colorScheme="red" onClick={() => deleteHandler("status", status.row_ID)}>
                                                                                    Delete
                                                                                </Button>
                                                                                <Button
                                                                                    colorScheme="teal"
                                                                                    onClick={() =>
                                                                                        setEditingID(
                                                                                            (
                                                                                                prevState
                                                                                            ) =>
                                                                                                prevState ===
                                                                                                `status-${status.row_ID}`
                                                                                                    ? ""
                                                                                                    : `status-${status.row_ID}`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            </ButtonGroup>
                                                                        </Flex>
                                                                        <Editing
                                                                            type="status"
                                                                            row_ID={
                                                                                status.row_ID
                                                                            }
                                                                            personnel_ID={status.personnel_ID.toString()}
                                                                            data={
                                                                                status
                                                                            }
                                                                            show={
                                                                                editingID ===
                                                                                `status-${status.row_ID}`
                                                                            }
                                                                        />
                                                                    </Box>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Collapse>
                                    </Stack>
                                </form>
                            </FormProvider>
                        </GridItem>
                    </Grid>
                </Stack>
            ) : (
                <> Loading data... </>
            )}
        </>
    );
};

PersonnelPage.requireAuth = true;
export default React.memo(PersonnelPage);
