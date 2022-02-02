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
import { RootState } from "../../../../types/types";
import { statusActions } from "../../../../store/status-slice";

import Layout from "../../../../components/Sidebar";

const Confirmed: NextProtectedPage = () => {
    const dispatch = useDispatch();
    const data = useSelector((state: RootState) => state.status);
    const { isPerm, sortedByPlatoon, statusDate, statuses } = data;
    const [secondsLeft, setSecondsLeft] = useState(10);
    const router = useRouter();
    useEffect(() => {
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
    }, [secondsLeft, setSecondsLeft, router]);
    return (
        <Layout
            content={
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
                                            {platoon} (
                                            {sortedByPlatoon[platoon].length})
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
            }
        />
    );
};
Confirmed.requireAuth = true;
export default Confirmed;
