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
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
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
import { NextProtectedPage } from "../../../../lib/auth";
import fetcher, { sendDELETE, sendPOST } from "../../../../lib/fetcher";
import { Personnel } from "../../../../types/database";
import Assignments from "../../../../config/assignments.json";
import { format } from "date-fns";
import {
    calculateMonthsToOrFrom,
    capitalizeFirstLetter,
    convertToAMPM,
} from "../../../../lib/custom";
import CustomCalendar from "../../../../components/Calendar/CustomCalendar";
import { Event } from "react-big-calendar";
import {
    Data,
    EventData,
    ExtendedStatus,
    GenericEvent,
    MAEvent,
    OffOrLeaveEvent,
    OtherEvent,
} from "../../../../types/types";
import {
    AddedAttCOrCourse,
    AddedLeaveOrOff,
    AddedMA,
    AddedOthers,
} from "../../../../components/Dashboard/AddedEvent";
import StatusEntry from "../../../../components/Personnel/Status/StatusEntry";
import ClickedContainerWrapper from "../../../../components/Common/ClickedContainerWrapper";
import {
    ConfirmAttC,
    ConfirmCourse,
    ConfirmLeave,
    ConfirmMA,
    ConfirmOff,
    ConfirmOthers,
} from "../../../../components/Dashboard/ConfirmEvent";
import {
    FieldValues,
    FormProvider,
    useForm,
    useFormContext,
    UseFormReturn,
} from "react-hook-form";
import CustomStatusDateRangePicker from "../../../../components/Dates/CustomStatusDateRangePicker";
import DeleteDialog from "../../../../components/Dialogs/DeleteDialog";
import Main from "../../../../components/Personnel/Tabs/Main";
import HA from "../../../../components/Personnel/Tabs/HA";
import CustomLoadingBar from "../../../../components/Skeleton/LoadingBar";

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
    isSecondYear: boolean;
    secondYearDate: string;
}

const PersonnelPage: NextProtectedPage = () => {
    const router = useRouter();
    const [type, setType] = useState<typeof types[number]>("All");
    const personnel_ID = router.query.p_ID;
    const { goto, id } = router.query;
    const { data, error, mutate } = useSWR<PersonnelPageData>(
        `/api/personnel/manage/${personnel_ID}`,
        fetcher
    );
   
    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const editUser = () =>
        router.push(`/personnel/manage/${personnel_ID}/edit`);
    const deleteUser = async () => {
        const responseData = await sendDELETE(
            `/api/personnel/manage/${personnel_ID}`,
            {
                type: "personnel",
            }
        );
        if (responseData.success) {
            toast({
                title: "Success",
                description: "Successfully deleted",
                status: "success",
            });
            router.push("/personnel/manage");
        } else {
            toast({
                title: "Error",
                description: "Successfully deleted",
                status: "success",
            });
        }
    };

    const [clickedType, setClickedType] = useState<string>();
    const [clickedID, setClickedID] = useState<any>();
    const [refresher, setRefresher] = useState(false);

    useEffect(() => {
        console.log({ goto, id });
        if (goto && id && !Number.isNaN(Number(id))) {
            setClickedID(Number(id));
            setClickedType(goto.toString());

            setTimeout(() => setRefresher((prev) => !prev), 500);
        }
    }, [goto, id]);

    const eventOnClick = React.useCallback(
        (event: any) => {
            // router.push(`${router.asPath}#${event.type}-${event.id}`);
            setType("All");
            setTimeout(() => {
                setClickedType(event.type ?? "status");
                setClickedID(event.id ?? null);
                setRefresher((prev) => !prev);
            }, 100);
        },
        [setClickedType, setClickedID, setRefresher, setType]
    );
    const scrollRef = useRef<HTMLDivElement>(null);
    const toastMissingId = "missing";
    useEffect(() => {
        if (scrollRef && scrollRef.current) {
            window.scrollTo({
                top:
                    scrollRef.current.offsetTop -
                    (window.innerHeight - scrollRef.current.offsetHeight) / 2,
                left: 0,
                behavior: "smooth",
            });
        } else if (goto && id) {
            // toast({
            //     id: toastMissingId,
            //     title: "Error",
            //     description: `Invalid ${goto} ID ${id}! Has it been deleted? Check the audit log.`,
            //     status: "error",
            // })
        }
    }, [scrollRef, refresher, goto, id]);

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

    const [deleteType, setDeleteType] = useState("");
    const [deleteID, setDeleteID] = useState("");
    const deleteHandler = (type: string, id: string) => {
        setIsOpen(true);
        setDeleteType(type);
        setDeleteID(id);
    };
    const [isOpen, setIsOpen] = React.useState(false);
    const confirmDelete = async () => {
        console.log("Deleting...");

        const responseData = await sendDELETE(
            `/api/personnel/manage/${personnel_ID}`,
            {
                type: deleteType,
                id: deleteID,
            }
        );

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
    };

    const [tabIndex, setTabIndex] = React.useState<number>(0);
    const tabs = ["main", 'ha']

    const handleTabsChange = (index: number) => {
        // setTabIndex(index);
        router.push({
            pathname: router.pathname,
            query: {
                view: tabs[index],
                p_ID: personnel_ID
            }
        })
    };


    useEffect(() => {
        if (tabs.includes(router?.query?.view?.toString() || "")) {
            setTabIndex(tabs.indexOf(router?.query?.view?.toString() || "main"));
        }
    }, [router.query.view, setTabIndex]);

    return (
        <>
            <DeleteDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                confirmDelete={confirmDelete}
            />
            <DeleteDialog
                isOpen={isDeleteUserOpen}
                setIsOpen={setIsDeleteUserOpen}
                confirmDelete={deleteUser}
                type="user"
            />
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
                                {" "}
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
                                    <StatLabel> Second year soldier </StatLabel>
                                    <StatNumber>
                                        <Badge
                                            fontSize="lg"
                                            colorScheme="purple"
                                        >
                                            {data.isSecondYear ? "YES" : "NO"}
                                        </Badge>
                                    </StatNumber>
                                    <StatHelpText>
                                        on {format(
                                            new Date(data.secondYearDate),
                                            Assignments.dateformat
                                        )}
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
                                <Center>
                                    <Button
                                        colorScheme="teal"
                                        size="sm"
                                        onClick={editUser}
                                        maxW={180}
                                        w="100%"
                                    >
                                        Edit
                                    </Button>
                                </Center>
                                <Center>
                                    <Button
                                        colorScheme="red"
                                        size="sm"
                                        maxW={180}
                                        w="100%"
                                        onClick={() =>
                                            setIsDeleteUserOpen(true)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </Center>
                            </SimpleGrid>
                        </GridItem>
                        <GridItem colSpan={5} mt={2}>
                            <Tabs
                                index={tabIndex}
                                onChange={handleTabsChange}
                                variant="soft-rounded"
                                align="center"
                                colorScheme="teal"
                            >
                                <TabList>
                                    <Tab>Main</Tab>
                                    <Tab>Heat Acclim</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel px={0}>
                                        <Box textAlign="initial">
                                            <Main
                                                clickedID={clickedID}
                                                data={data}
                                                clickedType={clickedType}
                                                deleteHandler={deleteHandler}
                                                editHandler={editHandler}
                                                editingID={editingID}
                                                setEditingID={setEditingID}
                                                eventOnClick={eventOnClick}
                                                methods={methods}
                                                scrollRef={scrollRef}
                                                setType={setType}
                                                type={type}
                                            />
                                        </Box>
                                    </TabPanel>
                                    <TabPanel px={0}>
                                        <HA />
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </GridItem>
                    </Grid>
                </Stack>
            ) : (
                <CustomLoadingBar/>
            )}
        </>
    );
};

PersonnelPage.requireAuth = true;
export default React.memo(PersonnelPage);
