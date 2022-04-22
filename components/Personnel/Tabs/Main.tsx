import { Stack, Collapse, Heading, Box, Divider, Flex, ButtonGroup, Button, Text, Select, Center, Checkbox } from "@chakra-ui/react";

import { format } from "date-fns";
import Assignments from '../../../config/assignments.json'
import { UseFormReturn, FieldValues, FormProvider, useFormContext } from "react-hook-form";
import { convertToAMPM } from "../../../lib/custom";
import { PersonnelPageData } from "../../../pages/personnel/manage/[p_ID]";
import CustomCalendar from "../../Calendar/CustomCalendar";
import ClickedContainerWrapper from "../../Common/ClickedContainerWrapper";
import { AddedLeaveOrOff, AddedAttCOrCourse, AddedMA, AddedOthers } from "../../Dashboard/AddedEvent";
import { ConfirmOff, ConfirmLeave, ConfirmAttC, ConfirmCourse, ConfirmMA, ConfirmOthers } from "../../Dashboard/ConfirmEvent";
import CustomStatusDateRangePicker from "../../Dates/CustomStatusDateRangePicker";
import StatusEntry from "../Status/StatusEntry";
import React from "react";
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
const Main: React.FC<{
    data: PersonnelPageData;
    eventOnClick: (event: any) => void;
    type: string;
    setType: React.Dispatch<React.SetStateAction<string>>;
    methods: UseFormReturn<FieldValues, any>;
    editHandler: (data: any) => Promise<void>;
    scrollRef: React.RefObject<HTMLDivElement>;
    clickedType: string | undefined;
    clickedID: any;
    deleteHandler: (type: string, id: string) => void;
    editingID: string | undefined;
    setEditingID: React.Dispatch<React.SetStateAction<string | undefined>>;
}> = ({
    data,
    eventOnClick,
    type,
    setType,
    methods,
    editHandler,
    scrollRef,
    clickedID,
    clickedType,
    deleteHandler,
    setEditingID,
    editingID,
}) => {
    return (
        <Stack>
            {" "}
            {/* <GridItem colSpan={5} mt={2}> */}
            <CustomCalendar data={data} onClick={eventOnClick} />
            {/* </GridItem> */}
            {/* <GridItem> */}
            <Select value={type} onChange={(e) => setType(e.target.value)}>
                {types.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </Select>
            {/* </GridItem> */}
            {/* <GridItem colSpan={5}> */}
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(editHandler)}>
                    <Stack direction="column">
                        <Collapse in={type === "Off" || type === "All"}>
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
                                                    data.eventData.offs[
                                                        pair.key
                                                    ].length
                                                }
                                                )
                                            </Text>
                                            <Stack
                                                direction="column"
                                                divider={<Divider />}
                                            >
                                                {data.eventData.offs[
                                                    pair.key
                                                ].map((off, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "off" &&
                                                            clickedID ===
                                                                off.row_ID
                                                        }
                                                        scrollId={`off-${off.row_ID}`}
                                                        ref={scrollRef}
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
                                                                p={2}
                                                            >
                                                                <Button
                                                                    colorScheme="red"
                                                                    onClick={() =>
                                                                        deleteHandler(
                                                                            "off",
                                                                            off.row_ID
                                                                        )
                                                                    }
                                                                >
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
                                                            row_ID={off.row_ID}
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
                                                ))}
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Stack>
                        </Collapse>
                        <Collapse in={type === "Leave" || type === "All"}>
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
                                                    data.eventData.leaves[
                                                        pair.key
                                                    ].length
                                                }
                                                )
                                            </Text>
                                            <Stack
                                                direction="column"
                                                divider={<Divider />}
                                            >
                                                {data.eventData.leaves[
                                                    pair.key
                                                ].map((leave, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "leave" &&
                                                            clickedID ===
                                                                leave.row_ID
                                                        }
                                                        scrollId={`leave-${leave.row_ID}`}
                                                        ref={scrollRef}
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
                                                                p={2}
                                                            >
                                                                <Button
                                                                    colorScheme="red"
                                                                    onClick={() =>
                                                                        deleteHandler(
                                                                            "leave",
                                                                            leave.row_ID
                                                                        )
                                                                    }
                                                                >
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
                                                ))}
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Stack>
                        </Collapse>
                        <Collapse in={type === "AttC" || type === "All"}>
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
                                        <Text fontSize="lg" fontWeight="bold">
                                            {pair.label} (
                                            {
                                                data.eventData.attcs[pair.key]
                                                    .length
                                            }
                                            )
                                        </Text>
                                        <Stack
                                            direction="column"
                                            divider={<Divider />}
                                        >
                                            {data.eventData.attcs[pair.key].map(
                                                (attc, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "attc" &&
                                                            clickedID ===
                                                                attc.row_ID
                                                        }
                                                        scrollId={`attc-${attc.row_ID}`}
                                                        ref={scrollRef}
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
                                                                p={2}
                                                            >
                                                                <Button
                                                                    colorScheme="red"
                                                                    onClick={() =>
                                                                        deleteHandler(
                                                                            "attc",
                                                                            attc.row_ID
                                                                        )
                                                                    }
                                                                >
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
                                                            row_ID={attc.row_ID}
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
                        <Collapse in={type === "Course" || type === "All"}>
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
                                        <Text fontSize="lg" fontWeight="bold">
                                            {pair.label} (
                                            {
                                                data.eventData.courses[pair.key]
                                                    .length
                                            }
                                            )
                                        </Text>
                                        <Stack
                                            direction="column"
                                            divider={<Divider />}
                                        >
                                            {data.eventData.courses[
                                                pair.key
                                            ].map((course, index) => (
                                                <ClickedContainerWrapper
                                                    key={index}
                                                    condition={
                                                        clickedType ===
                                                            "course" &&
                                                        clickedID ===
                                                            course.row_ID
                                                    }
                                                    scrollId={`course-${course.row_ID}`}
                                                    ref={scrollRef}
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
                                                            p={2}
                                                        >
                                                            <Button
                                                                colorScheme="red"
                                                                onClick={() =>
                                                                    deleteHandler(
                                                                        "course",
                                                                        course.row_ID
                                                                    )
                                                                }
                                                            >
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
                                                        row_ID={course.row_ID}
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
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Collapse>
                        <Collapse in={type === "MA" || type === "All"}>
                            <Stack direction="column">
                                <Heading> Medical Appointments </Heading>
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
                                        <Text fontSize="lg" fontWeight="bold">
                                            {pair.label} (
                                            {
                                                data.eventData.mas[pair.key]
                                                    .length
                                            }
                                            )
                                        </Text>
                                        <Stack
                                            direction="column"
                                            divider={<Divider />}
                                        >
                                            {data.eventData.mas[pair.key].map(
                                                (ma, index) => (
                                                    <ClickedContainerWrapper
                                                        key={index}
                                                        condition={
                                                            clickedType ===
                                                                "ma" &&
                                                            clickedID ===
                                                                ma.row_ID
                                                        }
                                                        scrollId={`ma-${ma.row_ID}`}
                                                        ref={scrollRef}
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
                                                                p={2}
                                                            >
                                                                <Button
                                                                    colorScheme="red"
                                                                    onClick={() =>
                                                                        deleteHandler(
                                                                            "ma",
                                                                            ma.row_ID
                                                                        )
                                                                    }
                                                                >
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
                                                            row_ID={ma.row_ID}
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
                        <Collapse in={type === "Others" || type === "All"}>
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
                                        <Text fontSize="lg" fontWeight="bold">
                                            {pair.label} (
                                            {
                                                data.eventData.others[pair.key]
                                                    .length
                                            }
                                            )
                                        </Text>
                                        <Stack
                                            direction="column"
                                            divider={<Divider />}
                                        >
                                            {data.eventData.others[
                                                pair.key
                                            ].map((other, index) => (
                                                <ClickedContainerWrapper
                                                    key={index}
                                                    condition={
                                                        clickedType ===
                                                            "others" &&
                                                        clickedID ===
                                                            other.row_ID
                                                    }
                                                    scrollId={`others-${other.row_ID}`}
                                                    ref={scrollRef}
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
                                                            p={2}
                                                        >
                                                            <Button
                                                                colorScheme="red"
                                                                onClick={() =>
                                                                    deleteHandler(
                                                                        "others",
                                                                        other.row_ID
                                                                    )
                                                                }
                                                            >
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
                                                        row_ID={other.row_ID}
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
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Collapse>
                        <Collapse in={type === "Status" || type === "All"}>
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
                                        <Text fontSize="lg" fontWeight="bold">
                                            {pair.label} (
                                            {
                                                data.eventData.statuses[
                                                    pair.key
                                                ].length
                                            }
                                            )
                                        </Text>
                                        <Stack
                                            direction="column"
                                            divider={<Divider />}
                                        >
                                            {data.eventData.statuses[
                                                pair.key
                                            ].map((status, index) => (
                                                // <StatusEntry
                                                //     key={
                                                //         index
                                                //     }
                                                //     status={
                                                //         status
                                                //     }
                                                // />
                                                <ClickedContainerWrapper
                                                    key={index}
                                                    condition={
                                                        clickedType ===
                                                            "status" &&
                                                        clickedID ===
                                                            status.row_ID
                                                    }
                                                    scrollId={`status-${status.row_ID}`}
                                                    ref={scrollRef}
                                                >
                                                    <Flex
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                    >
                                                        <StatusEntry
                                                            status={status}
                                                        />
                                                        <ButtonGroup
                                                            size="sm"
                                                            isAttached
                                                            p={2}
                                                        >
                                                            <Button
                                                                colorScheme="red"
                                                                onClick={() =>
                                                                    deleteHandler(
                                                                        "status",
                                                                        status.row_ID
                                                                    )
                                                                }
                                                            >
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
                                                        row_ID={status.row_ID}
                                                        personnel_ID={status.personnel_ID.toString()}
                                                        data={status}
                                                        show={
                                                            editingID ===
                                                            `status-${status.row_ID}`
                                                        }
                                                    />
                                                </ClickedContainerWrapper>
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Collapse>
                    </Stack>
                </form>
            </FormProvider>
            {/* </GridItem> */}
        </Stack>
    );
};

export default React.memo(Main)