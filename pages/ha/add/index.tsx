import {
    Stack,
    Center,
    Heading,
    Box,
    InputGroup,
    InputLeftAddon,
    Input,
    Button,
    Text,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    ButtonGroup,
    Checkbox,
    Collapse,
    Flex,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    useToast,
    SimpleGrid,
    Divider,
    Tag,
    TagLabel,
    TagRightIcon,
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Link,
} from "@chakra-ui/react";
import {
    CreatableSelect,
    GroupBase,
    Select,
    SingleValue,
} from "chakra-react-select";
import {
    Controller,
    FieldValues,
    FormProvider,
    useForm,
    useFormContext,
    UseFormRegister,
} from "react-hook-form";
import CustomStepper from "../../../components/Auth/AuthStepper";
import ORDInput from "../../../components/Forms/Controlled/ORDInput";
import PesInput from "../../../components/Forms/Controlled/PesInput";
import PostInInput from "../../../components/Forms/Controlled/PostInInput";
import ActivityTypeInput from "../../../components/Forms/Controlled/HA/ActivityTypeInput";
import RankInput from "../../../components/Forms/Controlled/RankInput";
import ServiceStatusInput from "../../../components/Forms/Controlled/ServiceStatusInput";
import ErrorText from "../../../components/Forms/ErrorText";
import HelpText from "../../../components/Forms/HelpText";
import { NextProtectedPage } from "../../../lib/auth";
import platoons from "../../api/auth/platoons";
import DateInput from "../../../components/Forms/Controlled/HA/DateInput";
import { useEffect, useState } from "react";
import HAStepper from "../../../components/HA/HAStepper";
import { sendPOST } from "../../../lib/fetcher";

import { ExtendedPersonnel } from "../../../types/database";
import { useSession } from "next-auth/react";
import React from "react";
import { openInNewTab } from "../../../lib/custom";
import PersonBasicDetails from "../../../components/Common/PersonBasicDetails";
import { IoOpenOutline } from "react-icons/io5";
import SearchInput from "../../../components/SearchInput";
import CustomBigAlert from "../../../components/Alert/CustomBigAlert";
import { format } from "date-fns";

import Assignments from "../../../config/assignments.json";
import NextLink from "next/link";
import { useRouter } from "next/router";
const Tags: React.FC<{ person: ExtendedPersonnel }> = ({ person }) => {
    const tags = [];

    if (person.locationArr && person.locationArr.length) {
        person.locationArr.forEach((location) => {
            tags.push(
                <Tag
                    size="sm"
                    variant="subtle"
                    colorScheme="red"
                    key={tags.length}
                    // onClick={onOpen}
                    // sx={{ cursor: "pointer" }}
                >
                    {/* <TagLeftIcon as={IoCheckmarkDoneOutline} boxSize='12px'/> */}

                    <TagLabel>{location}</TagLabel>
                    <TagRightIcon as={IoOpenOutline} />
                </Tag>
            );
        });
    } else {
        tags.push(
            <Tag
                key={tags.length}
                size="sm"
                variant="subtle"
                colorScheme="green"
            >
                <TagLabel>In camp</TagLabel>
            </Tag>
        );
    }
    if (person.status_row_ID) {
        tags.push(
            <Tag key={tags.length} size="sm" variant="subtle" colorScheme="red">
                <TagLabel>On status</TagLabel>
                <TagRightIcon as={IoOpenOutline} />
            </Tag>
        );
    } else {
        tags.push(
            <Tag
                key={tags.length}
                size="sm"
                variant="subtle"
                colorScheme="green"
            >
                <TagLabel>No status</TagLabel>
            </Tag>
        );
    }
    return <>{tags}</>;
};

const MemoizedTags = React.memo(Tags);
const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    checkedIDs: number[];
    setCheckedIDsState: React.Dispatch<
        React.SetStateAction<{
            [key: string]: number[];
            [key: number]: number[];
        }>
    >;
    search: string;
}> = ({ person, checkedIDs, setCheckedIDsState, search }) => {
    const handleClick = () =>
        openInNewTab(`/personnel/manage/${person.personnel_ID}`);

    const isChecked = checkedIDs.includes(person.personnel_ID);
    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isChecked)
            setCheckedIDsState((prev) => ({
                ...prev,
                [person["platoon"]]: prev[person.platoon].filter(
                    (id) => id !== person.personnel_ID
                ),
            }));
        else
            setCheckedIDsState((prev) => ({
                ...prev,
                [person.platoon]: [
                    ...prev[person.platoon],
                    person.personnel_ID,
                ],
            }));
    };
    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());
    const { register } = useFormContext();

    // set the default value
    let defaultValueArr = [...person.locationArr]; // copy to prevent mutating
    if (person.status_row_ID) defaultValueArr.push("On status");

    let defaultValue = defaultValueArr.join(", ") || "";
    return (
        <Collapse in={isVisible} animateOpacity>
            <Stack direction="column" my={3}>
                <Stack direction="row" spacing={3}>
                    <Checkbox isChecked={isChecked} onChange={handleCheck} />
                    <PersonBasicDetails
                        person={person}
                        handleClick={handleClick}
                    >
                        <MemoizedTags person={person} />
                    </PersonBasicDetails>
                </Stack>

                <Collapse in={!isChecked}>
                    <Box>
                        <InputGroup size="sm">
                            <InputLeftAddon children="Reason (optional)" />
                            <Input
                                placeholder="Optional reason for absence"
                                defaultValue={defaultValue}
                                {...register(`${person.personnel_ID}`, {
                                    required: false,
                                })}
                            />
                        </InputGroup>
                    </Box>
                </Collapse>
            </Stack>
            <Divider />
        </Collapse>
    );
};

const MemoizedPersonAccordionItem = React.memo(PersonAccordionItem);

const PlatoonAccordionItem: React.FC<{
    personnel: ExtendedPersonnel[];
    platoon: string;
    checkedIDs: number[];
    setCheckedIDsState: React.Dispatch<
        React.SetStateAction<{
            [key: string]: number[];
            [key: number]: number[];
        }>
    >;
    search: string;
}> = ({ personnel, platoon, checkedIDs, setCheckedIDsState, search }) => {
    const { data: session } = useSession();
    // don't render the accordion panel by default, only render when use rclicks
    // This allows the page to be more performant as there is less stuff to hydrate
    // Render the accordion panel which corresponds to the user (will render if platoon === personnel[0].platoon)

    // const [checkedIDs, setCheckedIDs] = useState<number[]>([]);
    const handleCheckAll = () => {
        if (checkedIDs.length === personnel.length) {
            setCheckedIDsState((prev) => ({
                ...prev,
                [platoon]: [],
            }));
        } else {
            setCheckedIDsState((prev) => ({
                ...prev,
                [platoon]: personnel.map((person) => person.personnel_ID),
            }));
        }
    };
    const allChecked = checkedIDs?.length === personnel.length;
    const isIndeterminate =
        checkedIDs?.length !== personnel.length &&
        !allChecked &&
        checkedIDs?.length > 0;

    return (
        <AccordionItem>
            <Text>
                <AccordionButton _expanded={{ bg: "gray.200" }}>
                    <Box flex={1} textAlign="left">
                        {platoon} ({personnel.length})
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
            </Text>
            <AccordionPanel borderColor="gray.200" borderWidth={2} pb={4}>
                <Flex justifyContent="space-between" flexWrap="wrap">
                    <Checkbox
                        size="lg"
                        spacing={3}
                        isChecked={allChecked}
                        isIndeterminate={isIndeterminate}
                        onChange={handleCheckAll}
                    >
                        {checkedIDs.length} selected
                    </Checkbox>
                </Flex>

                {personnel.map((person, index) => (
                    <MemoizedPersonAccordionItem
                        key={index}
                        person={person}
                        checkedIDs={checkedIDs}
                        setCheckedIDsState={setCheckedIDsState}
                        search={search}
                    />
                ))}
            </AccordionPanel>
        </AccordionItem>
    );
};
const MemoizedPlatoonAccordionItem = React.memo(PlatoonAccordionItem);

const AddParticipants: React.FC<{
    data: { [key: string]: ExtendedPersonnel[] };
    submit: (data: any, reasons: any) => Promise<void>;
}> = ({ data, submit }) => {
    console.log({ data }, "------------------------");
    const defaultIndex = Object.keys(data).map((_, index) => index);
    const [index, setIndex] = useState<number[]>(defaultIndex); // todo - set this to the user platoon

    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };

    const [checkedIDsState, setCheckedIDsState] = useState<{
        [key: keyof typeof data]: number[];
    }>(
        Object.keys(data).reduce((acc: any, key) => {
            acc[key] = data[key]
                .filter(
                    (person: ExtendedPersonnel) =>
                        person.location === "In camp" && !person.status_row_ID
                )
                .map((person: ExtendedPersonnel) => person.personnel_ID);
            return acc;
        }, {})
    );
    // This creates an object that has the keys which correspond to the platoon names,
    // then it sets the properties an array of personnel ID
    // where each personnel is going to be in camp AND has no status row ID
    console.log({ checkedIDsState });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    useEffect(() => {
        if (search.length && data) {
            // do stuff
            // Open all the tabs
            setIndex(
                [
                    ...Object.keys(data).map((_, index) => index),
                    Object.keys(data).length,
                ] // add the ORD accordion
            );
        } else {
            // Only set the index if it hasn't been set yet

            setIndex(defaultIndex);
        }
    }, [search, data?.sortedByPlatoon]);

    const methods = useForm<any>();
    const submitFn = (reasons: any) => {
        submit(checkedIDsState, reasons);
    };
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submitFn)}>
                <Stack direction="column">
                    <SearchInput setSearch={setSearch} />
                    <Accordion
                        defaultIndex={Object.keys(data).map(
                            (_, index) => index
                        )}
                        allowMultiple
                        allowToggle
                        index={index}
                        onChange={(e) => handleAccordion(e as number[])}
                    >
                        {Object.keys(data).map((platoon, index) => (
                            <MemoizedPlatoonAccordionItem
                                personnel={data[platoon]}
                                platoon={platoon}
                                key={index}
                                checkedIDs={checkedIDsState[platoon] || []}
                                setCheckedIDsState={setCheckedIDsState}
                                search={search}
                            />
                        ))}
                    </Accordion>
                    <Center>
                        <Button
                            colorScheme="teal"
                            type="submit"
                            // onClick={() => submit(checkedIDsState)}
                            isLoading={isSubmitting}
                        >
                            Submit
                        </Button>
                    </Center>
                </Stack>
            </form>
        </FormProvider>
    );
};

const HAAddPage: NextProtectedPage = () => {
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [formData, setFormData] = useState<{
        type: any;
        name: any;
        date: any;
        personnel: {
            [key: string]: ExtendedPersonnel[];
        };
        hasEvent: any[];
        noEvent: any[];
    }>(); // todo
    const [attendeeIDsSortedByPlatoon, setAttendeeIDsSortedByPlatoon] =
        useState<{ [key: string]: number[] }>();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<any>();
    const [isSubmittingHAInfo, setIsSubmittingHAInfo] = useState(false);
    const submitActivityInfo = async (data: any) => {
        console.log(data);
        setIsSubmittingHAInfo(true);

        const responseData = await sendPOST("/api/ha/getParticipants", data);
        console.log("Got a response - ", responseData);
        if (responseData.success) {
            setStage(1);
            setFormData(responseData.data);
        }
    };

    const submitPersonnelInfo = async (data: any, reasons: any) => {
        console.log({ reasons, data });
        setStage(2);
        setAttendeeIDsSortedByPlatoon(data);
        const responseData = await sendPOST("/api/ha/add", {
            personnelIDsSortedByPlatoon: data,
            sortedByPlatoon: formData?.personnel,
            type: formData?.type,
            name: formData?.name,
            date: formData?.date,
            reasons,
        });

        if (responseData.error) {
            alert(responseData.error);
        }
    };

    // set countdown timer when stage is 2
    const [timeLeft, setTimeLeft] = useState(10);
    useEffect(() => {
        if (stage === 2) {
            const timer = setInterval(() => {
                setTimeLeft((timeLeft) => timeLeft - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage, setTimeLeft]);
    const router = useRouter()
    if (timeLeft < 0) {
        setStage(0)
        setFormData(undefined)
        setAttendeeIDsSortedByPlatoon({})
        setTimeLeft(10)
        setIsSubmittingHAInfo(false)
    }
    return (
        <>
            <Stack>
                <Center>
                    <Heading> Add a(n) HA </Heading>
                </Center>
                <Center>
                    <HAStepper step={stage} />
                </Center>

                {stage === 0 && (
                    <form onSubmit={handleSubmit(submitActivityInfo)}>
                        <Stack direction="column">
                            <Center>
                                {/* <CustomStepper step={step} steps={steps} /> */}
                            </Center>
                            {/* <Center>
                    <Box>
                        <Button colorScheme="teal"> Import </Button>
                    </Box>
                </Center> */}
                            <Text pl={2}> All fields are required. </Text>
                            <Stack direction="column" spacing={6}>
                                <ActivityTypeInput
                                    control={control}
                                    errors={errors}
                                />
                                <DateInput control={control} errors={errors} />
                                <Box>
                                    <InputGroup size="sm">
                                        <InputLeftAddon children="Name" />
                                        <Input
                                            placeholder="Name of HA"
                                            {...register("activity_name", {
                                                required: true,
                                            })}
                                        />
                                    </InputGroup>
                                    {errors?.activity_name?.type === "required" && (
                                        <ErrorText text="Please enter a name!" />
                                    )}
                                </Box>

                                <Center>
                                    <Button
                                        colorScheme="teal"
                                        type="submit"
                                        isLoading={isSubmittingHAInfo}
                                    >
                                        Submit
                                    </Button>
                                </Center>
                            </Stack>
                        </Stack>
                    </form>
                )}
                {stage === 1 && formData && formData.personnel && (
                    <AddParticipants
                        data={formData.personnel}
                        submit={submitPersonnelInfo}
                    />
                )}
                {stage === 2 && (
                    <CustomBigAlert header="Activity added!">
                        <Stack direction="column">
                            <Text>
                                Added {formData?.name} on{" "}
                                {format(
                                    new Date(formData?.date || new Date()),
                                    Assignments.dateformat
                                )}
                            </Text>
                            <Text>
                                {
                                    Object.values(
                                        attendeeIDsSortedByPlatoon || {}
                                    ).flat().length
                                }{" "}
                                /{" "}
                                {
                                    Object.values(
                                        formData?.personnel || {}
                                    ).flat().length
                                }{" "}
                                attending
                            </Text>

                            <Stack
                                direction="row"
                                mt={1}
                                justifyContent="center"
                            >
                                <NextLink href="/ha" passHref>
                                    <Button
                                        size="xs"
                                        colorScheme="teal"
                                        as={Link}
                                    >
                                        Edit activity
                                    </Button>
                                </NextLink>
                                <NextLink href="/ha" passHref>
                                    <Button
                                        size="xs"
                                        colorScheme="teal"
                                        as={Link}
                                    >
                                        Back to main page ({timeLeft}s)
                                    </Button>
                                </NextLink>
                                
                            </Stack>
                        </Stack>
                    </CustomBigAlert>
                )}
            </Stack>
        </>
    );
};
HAAddPage.requireAuth = true;

export default HAAddPage;
