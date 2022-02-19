import {
    Accordion,
    Text,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Center,
    Heading,
    Stack,
    Divider,
    Button,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";
import { useState } from "react";
import useSWR from "swr";
import { NextProtectedPage } from "../../lib/auth";
import fetcher from "../../lib/fetcher";
import { AuditLogInterface, AuditResponse } from "../api/audit-log";
import Assignments from "../../config/assignments.json";
const AuditLogEntry: React.FC<{ entry: AuditLogInterface }> = ({ entry }) => {
    return (
        <Stack direction="column" spacing={0}>
            <Text fontWeight="semibold">
                {entry.username} executed: {entry.operation.toUpperCase()}{" "}
                {entry.type.toUpperCase()} #{entry.personnel_ID}
            </Text>
            <Text> {entry.email} </Text>
            <Text fontWeight="light">
                Created{" "}
                {format(new Date(entry.date), Assignments.datetimeformat)} Log #
                {entry.audit_ID}
            </Text>
        </Stack>
    );
};

const AuditLogGroup: React.FC<{ group: AuditLogInterface[] }> = ({ group }) => {
    return (
        <Stack direction="column" spacing={0}>
            <Text fontWeight="semibold">
                {group[0].username} executed {group.length} operations
            </Text>
            <Text> {group[0].email} </Text>
            <Text fontWeight="light">
                Created{" "}
                {format(new Date(group[0].date), Assignments.datetimeformat)}{" "}
                Group #{group[0].group_ID}
            </Text>
            <Stack p={2} direction="column" divider={<Divider />}>
                {group.map((entry) => (
                    // <AuditLogEntry key={entry.audit_ID} entry={entry} />
                    <Stack direction="column" spacing={0}>
                        <Text fontWeight="semibold">
                            {entry.username} executed:{" "}
                            {entry.operation.toUpperCase()}{" "}
                            {entry.type.toUpperCase()} #{entry.personnel_ID}
                        </Text>
                        <Text fontWeight="light">Log #{entry.audit_ID}</Text>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
};

const GroupAccordionItem: React.FC<{
    // search: string;
    date: string;
    groups: { [key: string]: any[] };
}> = ({
    // search,
    date,
    groups,
}) => {
    return (
        <AccordionItem>
            <Text>
                <AccordionButton _expanded={{ bg: "gray.200" }}>
                    <Box flex={1} textAlign="left">
                        {date} ({Object.keys(groups).length})
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
            </Text>
            <AccordionPanel borderColor="gray.200" borderWidth={2} pb={4}>
                <Stack direction="column" divider={<Divider />}>
                    {Object.keys(groups)
                        .reverse()
                        .map((group_ID, index) => {
                            if (groups[group_ID].length === 1) {
                                // This is a single entry
                                return (
                                    <AuditLogEntry
                                        key={index}
                                        entry={groups[group_ID][0]}
                                    />
                                );
                            } else {
                                // is a group entry
                                return (
                                    <AuditLogGroup
                                        key={index}
                                        group={groups[group_ID]}
                                    />
                                );
                            }
                        })}
                </Stack>
                {/* {personnel.map((person, index) => (
                        <MemoizedPersonAccordionItem
                            selectedDate={selectedDate}
                            key={index}
                            person={person}
                            statusesById={statusesById}
                            search={search}
                            formattedStatusList={formattedStatusList}
                        />
                        <></>
                    ))} */}
            </AccordionPanel>
        </AccordionItem>
    );
};
const MemoizedGroupAccordionItem = React.memo(GroupAccordionItem);

const AuditLogPage: NextProtectedPage = () => {
    const [entries, setEntries] = useState(30);

    const { data, error } = useSWR<AuditResponse>(
        `/api/audit-log?limit=${entries}`,
        fetcher
    );
    console.log(data);
    return (
        <Stack direction="column">
            <Center>
                <Stack direction="row" align="center">
                    <Heading> Audit log </Heading>
                    <Button size="xs" colorScheme="teal" onClick={() => setEntries(prev => prev+30)}> Load more </Button>
                </Stack>
            </Center>
            {!data && <>Loading data...</>}
            {data && (
                <Accordion
                    defaultIndex={[0]}
                    allowMultiple
                    allowToggle
                    // index={index}
                    // onChange={(e) => handleAccordion(e as number[])}
                >
                    {!!data &&
                        Object.keys(data).map((date, index) => (
                            <MemoizedGroupAccordionItem
                                key={index}
                                date={date}
                                groups={data[date]}

                                // search={search}
                            />
                        ))}
                </Accordion>
            )}
        </Stack>
    );
};
AuditLogPage.requireAuth = true;
export default AuditLogPage;
