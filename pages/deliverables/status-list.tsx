import {
    Box,
    Button,
    Center,
    Heading,
    Icon,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Select,
    SimpleGrid,
    Stack,
    useToast,
} from "@chakra-ui/react";
import { subDays, addDays, format } from "date-fns";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import useSWR from "swr";
import CustomDatePicker from "../../components/Dates/CustomDatePicker";
import { NextProtectedPage } from "../../lib/auth";
import fetcher from "../../lib/fetcher";
import Assignments from "../../config/assignments.json";
import StatusListFormat from "../../formats/statuslist";
import { changeToNextDayIfPastNoon } from "../../lib/custom";

const StatusList: NextProtectedPage = () => {
    const { data: session } = useSession();

    const [date, setDate] = useState<Date>(
        changeToNextDayIfPastNoon(new Date())
    );

    const changeDate = (direction: "left" | "right") => {
        if (direction === "left") {
            setDate((prevDate) => subDays(prevDate, 1));
        } else if (direction === "right") {
            setDate((prevDate) => addDays(prevDate, 1));
        }
    };

    const { data: slData, error } = useSWR<any>(
        `/api/deliverables/status-list/generate?date=${format(
            date,
            Assignments.mysqldateformat
        )}`,
        fetcher
    );

    console.log({ slData });
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
            description: "The status list has been copied to your clipboard.",
            status: "success",
            duration: delay,
            isClosable: true,
        });
        setTimeout(() => setHasCopied(false), delay);
    };
    console.log(copyRef.current?.innerText.replaceAll("\n\n", "\n"));

    const share = async () => {
        const data = slData.data;
        const text = copyRef.current?.innerText.replaceAll("\n\n", " \n");
        if (!text) {
            toast({
                title: "Error sharing",
                description:
                    "There was an error selecting the status list for sharing.",
                status: "error",
                duration: delay,
                isClosable: true,
            });
            return;
        }
        try {
            if ("share" in navigator) {
                await navigator.share({
                    title: `${data["COMPANY-NAME"]} STATUS LIST AS OF ${data["SELECTED-DATE"]}`,
                    //- url,
                    text,
                });
            } else {
                toast({
                    title: "Unable to share",
                    description:
                        "Sorry, your browser does not support direct share. Please copy-and-paste manually.",
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
                    <Heading> Status List </Heading>
                </Center>
                <Center>
                    <Heading size="lg"> {session?.user?.company} </Heading>
                </Center>

                <Center mt={2}>
                    <InputGroup maxWidth="275px">
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
                </Center>
            </Box>
            <Center>
                <SimpleGrid columns={2} spacing={2}>
                    <Button onClick={onCopy} disabled={hasCopied}>
                        {hasCopied ? "Copied" : "Copy"}
                    </Button>
                    <Button onClick={share}> Share </Button>
                </SimpleGrid>
            </Center>
            <Box>
                {slData?.data ? (
                    <StatusListFormat ref={copyRef} data={slData.data} />
                ) : (
                    <> Loading data... </>
                )}
            </Box>
        </Stack>
    );
};

StatusList.requireAuth = true;
export default StatusList;
