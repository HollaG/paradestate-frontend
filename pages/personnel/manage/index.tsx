import {
    Text,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Center,
    Heading,
    Stack,
    Collapse,
    SimpleGrid,
    Button,
    Flex,
    Tag,
    TagLabel,
    TagRightIcon,
    Divider,
    Checkbox,
    ButtonGroup,
    InputGroup,
    InputLeftAddon,
    Input,
    useToast,
    Wrap,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
} from "@chakra-ui/react";
import {
    AsyncCreatableSelect,
    GroupBase,
    OptionBase,
    Select,
    SingleValue,
} from "chakra-react-select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { IoOpenOutline } from "react-icons/io5";
import useSWR, { KeyedMutator } from "swr";
import PersonBasicDetails from "../../../components/Common/PersonBasicDetails";
import SearchInput from "../../../components/SearchInput";
import { NextProtectedPage } from "../../../lib/auth";
import fetcher, { sendDELETE, sendPOST } from "../../../lib/fetcher";
import { ExtendedPersonnel, Personnel } from "../../../types/database";
import Assignments from "../../../config/assignments.json";
import DeleteDialog from "../../../components/Dialogs/DeleteDialog";
import { FaChevronDown } from "react-icons/fa";
import { Controller, useForm } from "react-hook-form";
import ErrorText from "../../../components/Forms/ErrorText";
import ServiceStatusInput from "../../../components/Forms/Controlled/ServiceStatusInput";
import RankInput from "../../../components/Forms/Controlled/RankInput";
import PesInput from "../../../components/Forms/Controlled/PesInput";
import ORDInput from "../../../components/Forms/Controlled/ORDInput";
import PostInInput from "../../../components/Forms/Controlled/PostInInput";
interface ResponseData {
    sortedByPlatoon: {
        [key: string]: ExtendedPersonnel[];
    };
    inactivePersonnel: ExtendedPersonnel[];
    total: number;
}

interface NewPlatoonSelectOption extends OptionBase {
    value: string;
    label: string;
    unit?: string;
}

interface ServiceStatusOption extends OptionBase {
    label: string;
    value: string;
}
[];

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
    search: string;
    ord?: boolean;
    checkedIDs: number[];
    setCheckedIDs: React.Dispatch<React.SetStateAction<number[]>>;
}> = ({ person, search, ord = false, checkedIDs, setCheckedIDs }) => {
    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    const router = useRouter();
    const handleClick = () =>
        router.push(`/personnel/manage/${person.personnel_ID}`);

    const isChecked = checkedIDs.includes(person.personnel_ID);
    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isChecked)
            setCheckedIDs((prev) =>
                prev.filter((id) => id !== person.personnel_ID)
            );
        else setCheckedIDs((prev) => [...prev, person.personnel_ID]);
    };
    return (
        <Collapse in={isVisible} animateOpacity>
            <SimpleGrid
                columns={{ sm: 1, lg: 2 }}
                spacing="6px"
                my={3}
                w="100%"
            >
                <Stack direction="row" spacing={3}>
                    <Checkbox isChecked={isChecked} onChange={handleCheck} />
                    <PersonBasicDetails
                        person={person}
                        handleClick={handleClick}
                    >
                        {!ord && <MemoizedTags person={person} />}
                        {ord && (
                            <Tag
                                size="sm"
                                variant="subtle"
                                colorScheme="teal" // TODO: find a nice color for this
                            >
                                <TagLabel>{person.platoon}</TagLabel>
                            </Tag>
                        )}
                    </PersonBasicDetails>
                </Stack>
                <Flex alignItems="center" m={{ lg: "unset", base: "auto" }}>
                    <Button size="xs" ml={{ lg: "auto" }} onClick={handleClick}>
                        Go to manager
                    </Button>
                </Flex>
            </SimpleGrid>
            <Divider />
        </Collapse>
    );
};

const MemoizedPersonAccordionItem = React.memo(PersonAccordionItem);

const PlatoonAccordionItem: React.FC<{
    personnel: ExtendedPersonnel[];
    platoon: string;
    search: string;
    ord?: boolean;
    platoonOptions: {
        label: string;
        options: {
            label: string;
            value: string;
        }[];
    }[];
    mutate: KeyedMutator<ResponseData>;
}> = ({ personnel, platoon, search, ord = false, platoonOptions, mutate }) => {
    const { data: session } = useSession();
    const [rendered, setRendered] = useState(platoon === session?.user.platoon);
    useEffect(() => {
        setRendered(platoon === session?.user.platoon);
    }, [session?.user.platoon, platoon]);

    useEffect(() => {
        if (search.length) setRendered(true);
    }, [search]);
    // don't render the accordion panel by default, only render when use rclicks
    // This allows the page to be more performant as there is less stuff to hydrate
    // Render the accordion panel which corresponds to the user (will render if platoon === personnel[0].platoon)

    const [checkedIDs, setCheckedIDs] = useState<number[]>([]);
    const handleCheckAll = () => {
        if (checkedIDs.length === personnel.length) {
            setCheckedIDs([]);
        } else {
            setCheckedIDs(personnel.map((person) => person.personnel_ID));
        }
    };
    const allChecked = checkedIDs.length === personnel.length;
    const isIndeterminate =
        checkedIDs.length !== personnel.length &&
        !allChecked &&
        checkedIDs.length > 0;

    const [isTransferring, setIsTransferring] = useState(false);

    const [value, setValue] = useState<NewPlatoonSelectOption>();
    const handleSelect = (e: SingleValue<NewPlatoonSelectOption>) => {
        e && setValue({ ...e });
    };
    const [password, setPassword] = useState("");

    const toast = useToast();

    /* Transferring */
    const [isLoading, setIsLoading] = useState(false);
    const submitTransfer = async () => {
        if (!value) return;

        // setEditOption("")
        // setDeleteOpen(false)

        setIsLoading(true);
        const [unit, company, platoon] = value?.value.split(
            Assignments.separator
        );

        const responseData = await sendPOST("/api/personnel/manage/transfer", {
            personnel_IDs: checkedIDs,
            to: {
                unit,
                company,
                platoon,
                password,
            },
        });

        if (responseData.success) {
            toast({
                title: "Success",
                description: `Successfully transferred ${responseData.data.movedNumber} personnel to ${responseData.data.to.unit} ${responseData.data.to.company} ${responseData.data.to.platoon}`,
                status: "success",
            });
            mutate();
            setCheckedIDs([]);
        } else {
            toast({
                title: "Error",
                description: responseData.message,
                status: "error",
            });
        }
        setIsLoading(false);

        setEditOption("");
        setIsTransferring(false);
        setDeleteOpen(false);
        setCheckedIDs([]);
    };

    /* Deleting */
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteSelected = async () => {
        if (!checkedIDs.length) return;

        // setEditOption("")
        // setIsTransferring(false)

        const responseData = await sendDELETE("/api/personnel/manage", {
            personnel_IDs: checkedIDs,
        });

        if (responseData.success) {
            toast({
                title: "Success",
                description: `Successfully deleted ${responseData.data.deletedNumber} personnel`,
                status: "success",
            });
            mutate();
            setCheckedIDs([]);
        } else {
            toast({
                title: "Error",
                description: responseData.message,
                status: "error",
            });
        }

        setEditOption("");
        setIsTransferring(false);
        setDeleteOpen(false);
        setCheckedIDs([]);
    };
    const customPlatoonOpts: {
        label: string;
        options: {
            label: string;
            value: string;
        }[];
    }[] = JSON.parse(JSON.stringify(platoonOptions));
    const thisUnit = customPlatoonOpts.find(
        ({ label }) => label === session?.user?.unit
    );
    if (thisUnit)
        thisUnit.options = thisUnit?.options.filter(
            (value) =>
                value.value !==
                `${session?.user?.unit}${Assignments.separator}${session?.user?.company}${Assignments.separator}${platoon}`
        );

    /* Editing */
    const [editOption, setEditOption] = useState("");
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({ shouldUnregister: true });
    let EditElement = <></>;
    switch (editOption) {
        case "svc_status":
            EditElement = (
                <ServiceStatusInput control={control} errors={errors} />
            );
            break;
        case "rank":
            EditElement = <RankInput control={control} errors={errors} />;

            break;
        case "pes":
            EditElement = <PesInput control={control} errors={errors} />;
            break;
        case "post_in":
            EditElement = <PostInInput control={control} errors={errors} />;

            break;
        case "ord":
            EditElement = <ORDInput control={control} errors={errors} />;

            break;
    }

    const submitEdit = async (data: any) => {
        console.log({ data });
        const responseData = await sendPOST("/api/personnel/manage/edit", {
            type: editOption,
            value: data[editOption],
            personnel_IDs: checkedIDs,
        });
        if (responseData.success) {
            toast({
                title: "Success",
                description: `Successfully edited ${responseData.data.editedNumber} personnel`,
                status: "success",
            });
            mutate();
            setCheckedIDs([]);
            setEditOption("");
            setIsTransferring(false);
            setDeleteOpen(false);
        } else {
            toast({
                title: "Error",
                description: responseData.message,
                status: "error",
            });
        }
    };

    return (
        <AccordionItem>
            <Text>
                <AccordionButton
                    _expanded={{ bg: "gray.200" }}
                    onClick={() => setRendered(true)}
                >
                    <Box flex={1} textAlign="left">
                        {platoon} ({personnel.length})
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
            </Text>
            <AccordionPanel borderColor="gray.200" borderWidth={2} pb={4}>
                <DeleteDialog
                    isOpen={deleteOpen}
                    setIsOpen={setDeleteOpen}
                    confirmDelete={deleteSelected}
                    type="personnel"
                />
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
                    <Box>
                        <ButtonGroup size="xs" isAttached p={2}>
                            <Button
                                colorScheme="red"
                                // variant="outline"
                                onClick={() => setDeleteOpen(true)}
                            >
                                Delete
                            </Button>
                            <Button
                                colorScheme="teal"
                                variant={isTransferring ? "solid" : "outline"}
                                onClick={() =>
                                    setIsTransferring((prev) => !prev)
                                }
                            >
                                Transfer
                            </Button>
                            <Menu closeOnSelect={true}>
                                <MenuButton
                                    as={Button}
                                    rightIcon={<FaChevronDown />}
                                    variant={editOption ? "solid" : "outline"}
                                    colorScheme="teal"
                                >
                                    Edit
                                </MenuButton>
                                <MenuList minWidth="240px">
                                    <MenuOptionGroup
                                        value={editOption}
                                        onChange={(e) =>
                                            setEditOption(e.toString())
                                        }
                                        type="radio"
                                    >
                                        <MenuItemOption
                                            value="svc_status"
                                            // isDisabled={!!person.course_row_ID}
                                        >
                                            Service status
                                        </MenuItemOption>
                                        <MenuItemOption
                                            value="rank"
                                            // isDisabled={!!person.ma_row_ID}
                                        >
                                            Rank
                                        </MenuItemOption>
                                        <MenuItemOption
                                            value="pes"
                                            // isDisabled={!!person.others_row_ID}
                                        >
                                            PES
                                        </MenuItemOption>
                                        <MenuItemOption
                                            value="post_in"
                                            // isDisabled={!!person.others_row_ID}
                                        >
                                            Post in
                                        </MenuItemOption>
                                        <MenuItemOption
                                            value="ord"
                                            // isDisabled={!!person.others_row_ID}
                                        >
                                            ORD
                                        </MenuItemOption>
                                    </MenuOptionGroup>
                                </MenuList>
                            </Menu>
                        </ButtonGroup>
                    </Box>
                </Flex>
                <Collapse in={isTransferring}>
                    <Stack direction="column">
                        <InputGroup size="sm" w="100%">
                            <InputLeftAddon children="Transfer to" />
                            <Box w="100%">
                                <Select<
                                    NewPlatoonSelectOption,
                                    false,
                                    GroupBase<NewPlatoonSelectOption>
                                >
                                    options={customPlatoonOpts}
                                    size="sm"
                                    value={value}
                                    onChange={handleSelect}
                                />
                            </Box>
                        </InputGroup>
                        <Collapse
                            in={
                                value &&
                                value?.value.split(Assignments.separator)[1] !==
                                    session?.user?.company
                            }
                        >
                            <InputGroup size="sm" w="100%">
                                <InputLeftAddon children="Password" />
                                <Input
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter password..."
                                />
                            </InputGroup>
                        </Collapse>
                        <Center>
                            <Button
                                size="sm"
                                colorScheme="teal"
                                onClick={submitTransfer}
                                disabled={isLoading || !checkedIDs.length}
                                isLoading={isLoading}
                            >
                                Submit
                            </Button>
                        </Center>
                    </Stack>
                </Collapse>
                <Collapse in={!!editOption}>
                    <form onSubmit={handleSubmit(submitEdit)}>
                        <Stack direction="column">
                            {EditElement}
                            <Center>
                                <Button
                                    type="submit"
                                    size="sm"
                                    colorScheme="teal"
                                >
                                    Submit
                                </Button>
                            </Center>
                        </Stack>
                    </form>
                </Collapse>
                {rendered &&
                    personnel.map((person, index) => (
                        <MemoizedPersonAccordionItem
                            key={index}
                            person={person}
                            search={search}
                            ord={ord}
                            checkedIDs={checkedIDs}
                            setCheckedIDs={setCheckedIDs}
                        />
                    ))}
            </AccordionPanel>
        </AccordionItem>
    );
};

const MemoizedPlatoonAccordionItem = React.memo(PlatoonAccordionItem);
const PersonnelListPage: NextProtectedPage = () => {
    // Get all personnel, active / old as well
    const { data, error, mutate } = useSWR<ResponseData>(
        "/api/personnel/manage",
        fetcher
    );
    const { data: session } = useSession();

    const [index, setIndex] = useState<number[]>([]); // todo - set this to the user platoon

    const handleAccordion = (index: number[]) => {
        setIndex(index);
    };
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (search.length && data?.sortedByPlatoon) {
            // do stuff
            // Open all the tabs
            setIndex(
                [
                    ...Object.keys(data.sortedByPlatoon).map(
                        (_, index) => index
                    ),
                    Object.keys(data.sortedByPlatoon).length,
                ] // add the ORD accordion
            );
        } else {
            // Only set the index if it hasn't been set yet

            setIndex((prev) => {
                if (!prev.length) {
                    const newIndex = Object.keys(data?.sortedByPlatoon || {}).indexOf(
                        session?.user.platoon || ""
                    )
                    if (newIndex === -1) return [...prev]
                    else return [newIndex]
                    
                } else return [...prev]
            });
        }
    }, [search, data?.sortedByPlatoon, session]);
    console.log(index);
    // Get platoon data
    const { data: platoonData } = useSWR<{
        [key: string]: {
            platoon: string;
            company: string;
            unit: string;
        }[];
    }>("/api/personnel/manage/transfer", fetcher);
    console.log({ platoonData });

    const otherPlatoonOptions = platoonData
        ? Object.keys(platoonData).map((unit) => ({
              label: unit,
              options: platoonData[unit].map(({ platoon, company }) => ({
                  label: `${company} - ${platoon}`,
                  value: `${unit}${Assignments.separator}${company}${Assignments.separator}${platoon}`,
              })),
          }))
        : [];
    console.log({ otherPlatoonOptions });

    return (
        <Stack direction="column">
            <Center>
                <Heading> Personnel ({data?.total})</Heading>
            </Center>
            <SearchInput setSearch={setSearch} />
            {data && platoonData && (
                <Accordion
                    // defaultIndex={[0]}
                    allowMultiple
                    allowToggle
                    index={index}
                    onChange={(e) => handleAccordion(e as number[])}
                >
                    {Object.keys(data.sortedByPlatoon).map((platoon, index) => (
                        <MemoizedPlatoonAccordionItem
                            personnel={data.sortedByPlatoon[platoon]}
                            platoon={platoon}
                            search={search}
                            key={index}
                            platoonOptions={otherPlatoonOptions}
                            mutate={mutate}
                        />
                    ))}
                    {data.inactivePersonnel.length > 0 && (
                        <MemoizedPlatoonAccordionItem
                            personnel={data.inactivePersonnel}
                            platoon="ORD"
                            search={search}
                            ord={true}
                            platoonOptions={otherPlatoonOptions}
                            mutate={mutate}
                        />
                    )}
                </Accordion>
            )}
        </Stack>
    );
};

PersonnelListPage.requireAuth = true;
export default React.memo(PersonnelListPage);
