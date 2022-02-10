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
    Badge,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";

import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import CustomStepper from "../../../../components/Common/CustomStepper";

import { NextProtectedPage } from "../../../../lib/auth";
import { RootState } from "../../../../types/types";
import Assignments from "../../../../config/assignments.json";
import CustomControlledDatePicker from "../../../../components/Dates/CustomControlledDatePicker";
import {
    formatMySQLDateHelper,
    parseMySQLDateHelper,
} from "../../../../lib/custom";
import { useCallback, useEffect, useState } from "react";
import { BasicPersonnel } from "../../../../types/database";
import ErrorText from "../../../../components/Forms/ErrorText";
import fetcher, { sendPOST } from "../../../../lib/fetcher";
import { personnelActions } from "../../../../store/personnel-slice";
import CustomBigAlert from "../../../../components/Alert/CustomBigAlert";
import router, { useRouter } from "next/router";
import useSWR from "swr";
const steps = ["Select file", "Review details", "Success"];

const ReviewPage: NextProtectedPage = () => {
    const data = useSelector((state: RootState) => state.personnel.import);
    const { data: platoonData, error } = useSWR<{ platoons: string[] }>(
        "/api/personnel/manage/import",
        fetcher
    );
    const [addedPersonnel, setAddedPersonnel] = useState<BasicPersonnel[]>([]);
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false)

    const submit = async (data: any) => {
        setIsLoading(true)
       
        const responseData = await sendPOST(
            "/api/personnel/manage/import/submit",
            data.input
        );

        if (responseData.success) {
            setAddedPersonnel(responseData.data); // post in and ord are date strings not formatted yet
            dispatch(personnelActions.clearImport());
        } else {
            // Error!!!
            // TODO
       

            const errors: any[] = responseData.error.data;
            errors.forEach((error) => {
                setError(error.name, {
                    type: "manual",
                    message: error.message,
                })


                
            });
        }
        setIsLoading(false)
    };
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(30);
    const redirectToHome = useCallback(() => {
        router.push("/personnel/manage/import")
    }, []);
    useEffect(() => {
        if (secondsLeft <= 0) {
            redirectToHome();
        }
    }, [secondsLeft, redirectToHome]);
    useEffect(() => {
        if (!addedPersonnel.length) return;

        const interval = setInterval(
            () => setSecondsLeft((prev) => (!prev ? prev : prev - 1)),
            1000
        );
        return () => clearInterval(interval);
    }, [setSecondsLeft, addedPersonnel]);

    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (data && (data.excel || data.googleSheets)) {
            data.excel?.forEach((person, index) => {
                if (person.name.startsWith("error:")) {
                    setError(`input.${index}.name`, {
                        type: "manual",
                        message: person.name.replace("error:", ""),
                    });
                }
                if (person.ord.toString().startsWith("error:")) {
                    setError(`input.${index}.ord`, {
                        type: "manual",
                        message: person.ord.toString().replace("error:", ""),
                    });
                }
                if (person.pes.startsWith("error:")) {
                    setError(`input.${index}.pes`, {
                        type: "manual",
                        message: person.pes.replace("error:", ""),
                    });
                }
                if (person.rank.startsWith("error:")) {
                    setError(`input.${index}.rank`, {
                        type: "manual",
                        message: person.rank.replace("error:", ""),
                    });
                }
                if (person.platoon.startsWith("error:")) {
                    setError(`input.${index}.platoon`, {
                        type: "manual",
                        message: person.platoon.replace("error:", ""),
                    });
                }
                if (person.post_in.toString().startsWith("error:")) {
                    setError(`input.${index}.post_in`, {
                        type: "manual",
                        message: person.post_in
                            .toString()
                            .replace("error:", ""),
                    });
                }
                if (person.svc_status.startsWith("error:")) {
                    setError(`input.${index}.svc_status`, {
                        type: "manual",
                        message: person.svc_status.replace("error:", ""),
                    });
                }
            });
        } else { 
            router.push("/personnel/manage/import")
        }
    }, [data]);


    if (addedPersonnel.length) {
        return (
            <Stack direction="column" alignItems="center">
                <Heading> Success </Heading>

                <CustomStepper step={2} steps={steps} />

                <CustomBigAlert header="Personnel added!">
                    <>
                        {addedPersonnel.length} personnel have been added.                  
                        <Stack direction="row" justifyContent="center" mt={1}>
                            <Button
                                size="xs"
                                colorScheme="teal"
                                onClick={redirectToHome}
                            >
                                Back to adding ({secondsLeft}s)
                            </Button>
                        </Stack>
                    </>
                </CustomBigAlert>

                <Box overflowX="auto">
                    <Table variant="simple">
                        <TableCaption>
                            {/* Parsed from provided Excel file */}
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
                            {addedPersonnel.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td maxW="100px">{row.rank}</Td>
                                    <Td>{row.name}</Td>
                                    <Td maxW="90px">{row.pes}</Td>
                                    <Td maxW="130px">
                                        {formatMySQLDateHelper(
                                            row.post_in.toString()
                                        )}
                                    </Td>
                                    <Td maxW="130px">
                                        {formatMySQLDateHelper(
                                            row.ord.toString()
                                        )}
                                    </Td>
                                    <Td>{row.platoon}</Td>
                                    <Td maxW="100px">{row.svc_status}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Stack>
        );
    }

    

    return (
        <Stack direction="column" alignItems="center">
            <Heading> Review Personnel </Heading>

            <CustomStepper step={1} steps={steps} />
            <Center>
                <Text> Platoons currently added: </Text>
            </Center>

            <Wrap justify="center">
                {platoonData?.platoons?.map((platoon, index) => (
                    <WrapItem key={index}>
                        <Badge colorScheme="purple">{platoon}</Badge>
                    </WrapItem>
                ))}
            </Wrap>
            
            <form onSubmit={handleSubmit(submit)} style={{width: "100%"}}>
                {data && (
                    <Box overflowX="auto" >
                        <Table variant="simple" size="sm" minWidth="900px">
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
                                {data.excel?.map((row, index) => (
                                    <Tr key={index}>
                                        <Td pr={1}>{index + 1}</Td>
                                        <Td pr={1} maxW="100px">
                                            <Select
                                                placeholder="Select rank"
                                                defaultValue={row.rank}
                                                size="sm"
                                                {...register(
                                                    `input.${index}.rank`,
                                                    {
                                                        required:
                                                            "This field is required!",
                                                    }
                                                )}
                                            >
                                                {Object.keys(
                                                    Assignments.rank_army
                                                ).map((rank, index) => (
                                                    <option
                                                        value={rank}
                                                        key={index}
                                                    >
                                                        {rank}
                                                    </option>
                                                ))}
                                            </Select>
                                            {errors?.input?.[index]?.rank && (
                                                <ErrorText
                                                    text={
                                                        errors.input[index].rank
                                                            .message
                                                    }
                                                />
                                            )}
                                        </Td>
                                        <Td pr={1}>
                                            <Input
                                                defaultValue={row.name}
                                                size="sm"
                                                {...register(
                                                    `input.${index}.name`,
                                                    {
                                                        required:
                                                            "This field is required!",
                                                    }
                                                )}
                                            />
                                            {errors?.input?.[index]?.name && (
                                                <ErrorText
                                                    text={
                                                        errors.input[index].name
                                                            .message
                                                    }
                                                />
                                            )}
                                        </Td>
                                        <Td pr={1} maxW="90px">
                                            <Select
                                                placeholder="Select PES"
                                                defaultValue={row.pes}
                                                size="sm"
                                                {...register(
                                                    `input.${index}.pes`,
                                                    {
                                                        required:
                                                            "This field is required!",
                                                    }
                                                )}
                                            >
                                                {Assignments.pes.map(
                                                    (pes, index) => (
                                                        <option
                                                            value={pes}
                                                            key={index}
                                                        >
                                                            {pes}
                                                        </option>
                                                    )
                                                )}
                                            </Select>
                                            {errors?.input?.[index]?.pes && (
                                                <ErrorText
                                                    text={
                                                        errors.input[index].pes
                                                            .message
                                                    }
                                                />
                                            )}
                                        </Td>
                                        <Td pr={1} maxW="130px">
                                            {/* <Input
                                            defaultValue={row.post_in.toString()}
                                            size="sm"
                                        /> */}
                                            <CustomControlledDatePicker
                                                control={control}
                                                name={`input.${index}.post_in`}
                                                placeholder="Date when personnel joined the company"
                                                defaultValue={parseMySQLDateHelper(
                                                    row.post_in.toString()
                                                )}
                                                format={
                                                    Assignments.mysqldateformat
                                                }
                                            />
                                            {errors?.input?.[index]
                                                ?.post_in && (
                                                <ErrorText
                                                    text={
                                                        errors.input[index]
                                                            .post_in.message
                                                    }
                                                />
                                            )}
                                        </Td>
                                        <Td pr={1} maxW="130px">
                                            {/* <Input
                                            defaultValue={row.ord.toString()}
                                            size="sm"
                                        /> */}
                                            <CustomControlledDatePicker
                                                control={control}
                                                name={`input.${index}.ord`}
                                                placeholder="Operationally Ready Date"
                                                defaultValue={parseMySQLDateHelper(
                                                    row.ord.toString()
                                                )}
                                                format={
                                                    Assignments.mysqldateformat
                                                }
                                            />
                                            {errors?.input?.[index]?.ord && (
                                                <ErrorText
                                                    text={
                                                        errors.input[index].ord
                                                            .message
                                                    }
                                                />
                                            )}
                                        </Td>
                                        <Td pr={1}>
                                            <Input
                                                defaultValue={row.platoon}
                                                size="sm"
                                                {...register(
                                                    `input.${index}.platoon`,
                                                    {
                                                        required:
                                                            "This field is required!",
                                                    }
                                                )}
                                            />
                                            {errors?.input?.[index]
                                                ?.platoon && (
                                                <ErrorText
                                                    text={
                                                        errors.input[index]
                                                            .platoon.message
                                                    }
                                                />
                                            )}
                                        </Td>
                                        <Td pr={1} maxW="100px">
                                            <Select
                                                placeholder="Select svc. status"
                                                defaultValue={row.svc_status}
                                                size="sm"
                                                {...register(
                                                    `input.${index}.svc_status`,
                                                    {
                                                        required:
                                                            "This field is required!",
                                                    }
                                                )}
                                            >
                                                {Assignments.svc_status.map(
                                                    (svc_status, index) => (
                                                        <option
                                                            key={index}
                                                            value={svc_status}
                                                        >
                                                            {svc_status}
                                                        </option>
                                                    )
                                                )}
                                            </Select>
                                            {errors?.input?.[index]
                                                ?.svc_status && (
                                                <ErrorText
                                                    text={
                                                        errors?.input?.[index]
                                                            ?.svc_status.message
                                                    }
                                                />
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                )}
                <Center>
                    <Button colorScheme="teal" type="submit" isLoading={isLoading}>
                        Submit
                    </Button>
                </Center>
            </form>
        </Stack>
    );
};

ReviewPage.requireAuth = true;
export default ReviewPage;
