import {
    Stack,
    Center,
    Heading,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Box,
    Text,
    TableCaption,
    Button,
    Input,
    Select,
} from "@chakra-ui/react";

import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import CustomStepper from "../../../../components/Common/CustomStepper";

import { NextProtectedPage } from "../../../../lib/auth";
import { RootState } from "../../../../types/types";
import Assignments from "../../../../config/assignments.json";
const steps = ["Select file", "Review details", "Success"];

const ReviewPage: NextProtectedPage = () => {
    const data = useSelector((state: RootState) => state.personnel.import);
    const submit = () => {};

    const { control, register } = useForm();

    return (
        <Stack direction="column" alignItems="center">
            <Heading> Review Personnel </Heading>

            <CustomStepper step={1} steps={steps} />

            <Text>
                If any data is incorrect, please modify your Excel or Google
                Sheet, then re-import the data.
            </Text>

            {data && (
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <TableCaption>
                            Parsed from provided Excel file
                        </TableCaption>
                        <Thead>
                            <Tr>
                                <Th> # </Th>
                                {/* {Object.keys(data.excel[0]).map(
                                    (header, index) => (
                                        <Th key={index}> {header}</Th>
                                    )
                                )} */}
                                <Th> Rank </Th>
                                <Th> Name </Th>
                                <Th> PES </Th>
                                <Th> Post in </Th>
                                <Th> ORD </Th>
                                <Th> Platoon </Th>
                                <Th> Service status </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {data.excel.map((row, index) => (
                                <Tr key={index}>
                                    <Td pr={1}>{index + 1}</Td>
                                    <Td pr={1} maxW="100px">
                                        <Select
                                            placeholder="Select rank"
                                            defaultValue={row.rank}
                                            size="sm"
                                        >
                                            {Object.keys(
                                                Assignments.rank_army
                                            ).map((rank) => (
                                                <option value={rank}>
                                                    {rank}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>
                                    <Td pr={1}>
                                        <Input
                                            defaultValue={row.name}
                                            size="sm"
                                        />
                                    </Td>
                                    <Td pr={1} maxW="90px">
                                        <Select
                                            placeholder="Select PES"
                                            defaultValue={row.pes}
                                            size="sm"
                                        >
                                            {Assignments.pes.map((pes) => (
                                                <option value={pes}>
                                                    {pes}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>
                                    <Td pr={1} maxW="130px">
                                        <Input
                                            defaultValue={row.post_in.toString()}
                                            size="sm"
                                        />
                                    </Td>
                                    <Td pr={1} maxW="130px">
                                        <Input
                                            defaultValue={row.ord.toString()}
                                            size="sm"
                                        />
                                    </Td>
                                    <Td pr={1}>
                                        <Input
                                            defaultValue={row.platoon}
                                            size="sm"
                                        />
                                    </Td>
                                    <Td pr={1} maxW="100px">
                                        <Select
                                            placeholder="Select svc. status"
                                            defaultValue={row.svc_status}
                                            size="sm"
                                        >
                                            {Assignments.svc_status.map(
                                                (svc_status) => (
                                                    <option value={svc_status}>
                                                        {svc_status}
                                                    </option>
                                                )
                                            )}
                                        </Select>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
            <Button colorScheme="teal" onClick={submit}>
                {" "}
                Submit{" "}
            </Button>
        </Stack>
    );
};

ReviewPage.requireAuth = true;
export default ReviewPage;
