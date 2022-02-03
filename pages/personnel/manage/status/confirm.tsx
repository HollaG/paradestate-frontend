import {
    Text,
    Heading,
    Button,
    Box,
    Tag,
    TagLabel,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Stack,
    Center,
    Wrap,
    WrapItem,
    Flex,
    Icon,
    IconButton,
    Divider,
    Collapse,
    TagCloseButton,
} from "@chakra-ui/react";
import { format, parse } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { StatusOption } from ".";
import StatusHeading from "../../../../components/Personnel/Status/Heading";
import { NextProtectedPage } from "../../../../lib/auth";
import { Personnel } from "../../../../types/database";
import Assignments from "../../../../config/assignments.json";
import { useDispatch, useSelector } from "react-redux";
import { RootState, StatusState } from "../../../../types/types";
import { statusActions } from "../../../../store/status-slice";

import Layout from "../../../../components/Sidebar";

import { IoTrash } from "react-icons/io5";
import { sendPOST } from "../../../../lib/fetcher";

const PersonAccordionItem: React.FC<{
    person: Personnel;
    confirmed: boolean;
}> = ({ person, confirmed }) => {
    const dispatch = useDispatch();
    const deleteEntry = (personnel_ID: number) => {
        // setIsOpen(false);
        // setTimeout(() => {
        //     dispatch(statusActions.deleteEntry(personnel_ID));
        // }, 500);
        dispatch(statusActions.deleteEntry(personnel_ID));
    };

    // const [isOpen, setIsOpen] = useState(true);

    return (
        // <Collapse in={isOpen} animateOpacity> // TODO make animateion
        <>
            <Flex alignItems="center" my={3}>
                <Box flexGrow="1">
                    <Text fontWeight="semibold">
                        {person.rank} {person.name}
                    </Text>

                    <Text>{person.platoon}</Text>
                </Box>
                {!confirmed && (
                    <IconButton
                        colorScheme="red"
                        fontSize="20px"
                        icon={<Icon as={IoTrash} />}
                        aria-label="Delete entry"
                        onClick={() => deleteEntry(person.personnel_ID)}
                    />
                )}
            </Flex>
            <Divider />
        </>
        // </Collapse>
    );
};

const AccordionWrapper: React.FC<{
    sortedByPlatoon: { [key: string]: Personnel[] };
    confirmed?: boolean;
}> = ({ sortedByPlatoon, confirmed = false }) => (
    <Accordion
        defaultIndex={Object.keys(sortedByPlatoon).map((_, index) => index)}
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
                            {platoon} ({sortedByPlatoon[platoon].length})
                        </Box>
                    </AccordionButton>
                </Text>
                <AccordionPanel borderColor="gray.200" borderWidth={2} pb={4}>
                    {sortedByPlatoon[platoon].map(
                        (person: Personnel, index2: number) => (
                            <PersonAccordionItem
                            key={index2}
                                person={person}
                                confirmed={confirmed}
                            />
                        )
                    )}
                </AccordionPanel>
            </AccordionItem>
        ))}
    </Accordion>
);

const Confirmed: NextProtectedPage = () => {
    const dispatch = useDispatch();
    const data = useSelector((state: RootState) => state.status);
    const { isPerm, sortedByPlatoon, statusDate, statuses } = data;
    const [secondsLeft, setSecondsLeft] = useState(10);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    useEffect(() => {
        if (!success) return;
        if (secondsLeft <= 0) {
            // Todo - make the in-between page too
            // dispatch(statusActions.clearData());
            router.push("/personnel/manage/status");
            return;
        }
        const timeout = setTimeout(() => {
            setSecondsLeft((prevSecs) => prevSecs - 1);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [success, secondsLeft, setSecondsLeft, router]);

    if (
        !success &&
        (!Object.keys(data.sortedByPlatoon).length || !data.statuses.length)
    )
        // only push if success is false (when success is true, we clear the state, but we don't want to immediately redirect)
        router.push("/personnel/manage/status");

    const deleteSelectedStatusHandler = (value: string) => {
        dispatch(statusActions.deleteSelectedStatus(value));
    };

    const [confirmedStatusData, setConfirmedStatusData] =
        useState<StatusState>();
    const submit = async () => {
        const responseData = await sendPOST(
            "/api/personnel/manage/status/submit",
            data
        );
        console.log({ responseData });
        if (responseData.success) {
            setConfirmedStatusData(responseData.data);
            setSuccess(true);
            dispatch(statusActions.clearData());
        } else { 
            alert(responseData.error)
        }
    };

    const Confirmed = !!confirmedStatusData ? (
        <Stack direction="column">
            <StatusHeading step={2}>
                <Heading> Statuses added </Heading>
                <Link href="/" passHref>
                    <Button
                        colorScheme="teal"
                        size="xs"
                        ml={2}
                        onClick={() => {}}
                    >
                        Home ({secondsLeft}s)
                    </Button>
                </Link>
            </StatusHeading>
            <Box textAlign="center">
                <Center>
                    {confirmedStatusData.isPerm ? (
                        <Text fontWeight="semibold"> Permanent status </Text>
                    ) : (
                        <>
                            <Text fontWeight="semibold">
                                {confirmedStatusData.statusDate[0]}{" "}
                            </Text>
                            <Text mx={2}> to </Text>
                            <Text fontWeight="semibold">
                                {confirmedStatusData.statusDate[1]}{" "}
                            </Text>
                        </>
                    )}
                </Center>
                <Center>
                    <Wrap mt={2}>
                        {confirmedStatusData.statuses.map((status, index) => (
                            <WrapItem key={index}>
                                <Tag
                                    size="sm"
                                    variant="subtle"
                                    colorScheme="red"
                                >
                                    <TagLabel>{status.label}</TagLabel>
                                </Tag>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Center>
            </Box>
            <AccordionWrapper
                sortedByPlatoon={confirmedStatusData.sortedByPlatoon}
                confirmed={true}
            />
        </Stack>
    ) : (
        <></>
    );
    const Verify = !confirmedStatusData ? (
        <Stack direction="column">
            <StatusHeading step={1}>
                <Heading> Confirm </Heading>
                <Link href="/" passHref>
                    <Button
                        colorScheme="teal"
                        size="xs"
                        ml={2}
                        onClick={() => {}}
                    >
                        Clear
                    </Button>
                </Link>
            </StatusHeading>
            <Box textAlign="center">
                <Center>
                    {isPerm ? (
                        <Text fontWeight="semibold"> Permanent status </Text>
                    ) : (
                        <>
                            <Text fontWeight="semibold">{statusDate && statusDate[0]} </Text>
                            <Text mx={2}> to </Text>
                            <Text fontWeight="semibold">{statusDate && statusDate[1]} </Text>
                        </>
                    )}
                </Center>
                <Center>
                    <Wrap mt={2}>
                        {statuses.map((status, index) => (
                            <WrapItem key={index}>
                                <Tag
                                    size="sm"
                                    variant="subtle"
                                    colorScheme="red"
                                >
                                    <TagLabel>{status.label}</TagLabel>
                                    <TagCloseButton
                                        onClick={() =>
                                            deleteSelectedStatusHandler(
                                                status.value
                                            )
                                        }
                                    />
                                </Tag>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Center>
            </Box>
            <AccordionWrapper sortedByPlatoon={sortedByPlatoon} />
            <Center>
                <Button onClick={() => submit()}> Submit </Button>
            </Center>
        </Stack>
    ) : <></>;

    return confirmedStatusData ? Confirmed : Verify;
};
Confirmed.requireAuth = true;
export default Confirmed;
