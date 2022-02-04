import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Layout from "../../components/Sidebar";
import {
    Box,
    Button,
    Center,
    Heading,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftAddon,
    InputLeftElement,
    InputRightAddon,
    InputRightElement,
    Select,
    SimpleGrid,
    Stack,
    Text,
    useClipboard,
    useToast,
    Wrap,
} from "@chakra-ui/react";
import { NextProtectedPage } from "../../lib/auth";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import fetcher from "../../lib/fetcher";
import CustomDatePicker from "../../components/Dates/CustomDatePicker";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import { addDays, format, subDays } from "date-fns";
import Assignments from "../../config/assignments.json";
import ParadeStateFormat from "../../formats/paradestate";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
const tempPlatoons = ["HQ", "PLATOON 1", "PLATOON 2", "COMPANY"];
const ParadeState: NextProtectedPage = () => {
    const { data: session } = useSession();
    // const { data, error } = useSWR(
    //     "/api/deliverables/parade-state/?date=2022-02-02&platoon=HQ",
    //     fetcher
    // );
    // Initial data

    const [date, setDate] = useState<Date>(new Date());
    const [platoon, setPlatoon] = useState(session?.user?.platoon || "");
    const [platoons, setPlatoons] = useState<string[]>([]);
    useEffect(() => {
        fetch("/api/deliverables/parade-state")
            .then((res) => res.json())
            .then((responseData) => {
                if (responseData.success) {
                    console.log({ responseData });
                    setDate(new Date(responseData.data.selectedDate));
                    setPlatoons(responseData.data.platoons);
                } else {
                    alert(responseData.error);
                }
            });
    }, [setDate, setPlatoons]);
    useEffect(() => {
        if (session && session.user && session.user.platoon)
            setPlatoon(session.user.platoon);
    }, [session, setPlatoon]);

    const changeDate = (direction: "left" | "right") => {
        if (direction === "left") {
            setDate((prevDate) => subDays(prevDate, 1));
        } else if (direction === "right") {
            setDate((prevDate) => addDays(prevDate, 1));
        }
    };

    const { data: psData, error } = useSWR<any>(
        `/api/deliverables/parade-state/generate?date=${format(
            date,
            Assignments.mysqldateformat
        )}&platoon=${platoon}`,
        fetcher
    );

    const copyRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    const [hasCopied, setHasCopied] = useState(false);
    const delay = 2500;
    const onCopy = () => {
        setHasCopied(true);
        navigator.clipboard.writeText(
            copyRef.current?.innerText.replaceAll("\n\n", " \n") || ""
        );
        toast({
            title: "Copied",
            description: "The parade state has been copied to your clipboard.",
            status: "success",
            duration: delay,
            isClosable: true,
        });
        setTimeout(() => setHasCopied(false), delay);
    };
    console.log(copyRef.current?.innerText.replaceAll("\n\n", "\n"));

    const share = async () => {
        const data = psData.data;
        const text = copyRef.current?.innerText.replaceAll("\n\n", " \n");
        if (!text) {
            toast({
                title: "Error sharing",
                description:
                    "There was an error selecting the parade state for sharing.",
                status: "error",
                duration: delay,
                isClosable: true,
            });
            return;
        }
        try {
            if ("share" in navigator) {
                await navigator.share({
                    title: `${data["PLATOON-NAME"]} PARADE STATE AS OF ${data["SELECTED-DATE"]} 0800HRS`,
                    //- url,
                    text,
                });
            } else { 
                toast({
                    title: "Unable to share",
                    description: "Sorry, your browser does not support direct share. Please copy-and-paste manually.",
                    status: "error",
                    duration: delay,
                    isClosable: true,
                });
            }
        } catch (e) {
            toast({
                title: "Share cancelled",
                description: "User cancelled the share.",
                status: "error",
                duration: delay,
                isClosable: true,
            });
        }
    };

    return (
        <Stack direction="column">
            <Box>
                <Center>
                    <Heading> Parade State </Heading>
                </Center>
                <Center>
                    <Heading size="lg"> {platoon} </Heading>
                </Center>
                <SimpleGrid
                    columns={{
                        base: 1,
                        sm: 2,
                    }}
                    mt={2}
                    spacing={2}
                >
                    <Box>
                        <InputGroup
                            maxWidth={{
                                base: "100%",
                                sm: "275px",
                            }}
                            ml={{
                                base: 0,
                                sm: "auto",
                            }}
                        >
                            {/* <InputLeftAddon cursor="pointer"> {"<"} </InputLeftAddon> */}
                            <InputLeftElement>
                                <Button
                                    size="xs"
                                    w="30px"
                                    colorScheme="gray"
                                    onClick={() => changeDate("left")}
                                >
                                    {" "}
                                    <Icon as={IoChevronBack} />
                                </Button>
                            </InputLeftElement>
                            <CustomDatePicker
                                placeholder="Generation date"
                                size="md"
                                date={date}
                                setDate={setDate}
                            />
                            {/* <InputRightAddon cursor="pointer"> {">"} </InputRightAddon> */}
                            <InputRightElement>
                                <Button
                                    size="xs"
                                    w="30px"
                                    colorScheme="gray"
                                    onClick={() => changeDate("right")}
                                >
                                    {" "}
                                    <Icon as={IoChevronForward} />
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                    <Box>
                        <Select
                            maxWidth={{
                                base: "100%",
                                sm: "275px",
                            }}
                            mr={{
                                base: 0,
                                sm: "auto",
                            }}
                            textAlign="center"
                            value={platoon}
                            onChange={(e) => setPlatoon(e.target.value)}
                        >
                            {platoons.map((platoon, index) => (
                                <option value={platoon} key={index}>
                                    {platoon}{" "}
                                </option>
                            ))}
                        </Select>
                    </Box>
                </SimpleGrid>
            </Box>{" "}
            <Center>
                <SimpleGrid columns={2} spacing={2}>
                    <Button onClick={onCopy} disabled={hasCopied}>
                        {hasCopied ? "Copied" : "Copy"}
                    </Button>
                    <Button onClick={share}> Share </Button>
                </SimpleGrid>
            </Center>
            <Box>
                {psData?.data ? (
                    <ParadeStateFormat ref={copyRef} data={psData.data} />
                ) : <> Loading data... </>}
            </Box>
        </Stack>
    );
};
ParadeState.requireAuth = true
export default ParadeState;
