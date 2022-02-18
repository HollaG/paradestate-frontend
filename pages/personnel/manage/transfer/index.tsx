import {
    Collapse,
    SimpleGrid,
    Tag,
    TagLabel,
    Flex,
    Button,
    Divider,
    AccordionItem,
    AccordionButton,
    Box,
    AccordionIcon,
    AccordionPanel,
    Text,
    Accordion,
    Center,
    Heading,
    Stack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import PersonBasicDetails from "../../../../components/Common/PersonBasicDetails";
import SearchInput from "../../../../components/SearchInput";
import { NextProtectedPage } from "../../../../lib/auth";
import fetcher from "../../../../lib/fetcher";
import { ExtendedPersonnel } from "../../../../types/database";
interface ResponseData {
    sortedByPlatoon: {
        [key: string]: ExtendedPersonnel[];
    };
    inactivePersonnel: ExtendedPersonnel[];
    total: number;
}
// Copy much of the code from /personnel/manage/index.tsx

const PersonAccordionItem: React.FC<{
    person: ExtendedPersonnel;
    search: string;
    ord?: boolean;
}> = ({ person, search, ord = false }) => {
    const isVisible =
        search.length === 0 ? true : person.name.includes(search.toUpperCase());

    const router = useRouter();
    const handleClick = () =>
        router.push(`/personnel/manage/${person.personnel_ID}`);
    return (
        <Collapse in={isVisible} animateOpacity>
            <SimpleGrid
                columns={{ sm: 1, lg: 2 }}
                spacing="6px"
                my={3}
                w="100%"
            >
                <PersonBasicDetails person={person} handleClick={handleClick}>
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
}> = ({ personnel, platoon, search, ord = false }) => {
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
                {rendered &&
                    personnel.map((person, index) => (
                        <MemoizedPersonAccordionItem
                            key={index}
                            person={person}
                            search={search}
                            ord={ord}
                        />
                    ))}
            </AccordionPanel>
        </AccordionItem>
    );
};
const MemoizedPlatoonAccordionItem = React.memo(PlatoonAccordionItem);

const TransferPage: NextProtectedPage = () => {
    const { data, error } = useSWR<ResponseData>(
        "/api/personnel/manage/transfer",
        fetcher
    );

    const { data: session } = useSession();

    const defaultIndex = useMemo(
        () => [
            Object.keys(data?.sortedByPlatoon || {}).indexOf(
                session?.user.platoon || ""
            ),
        ],
        [data, session]
    );
    const [index, setIndex] = useState(defaultIndex); // todo - set this to the user platoon
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
            setIndex(defaultIndex);
        }
    }, [search, data?.sortedByPlatoon, defaultIndex]);
    return (
        <Stack direction="column">
            <Center>
                <Heading> Personnel ({data?.total})</Heading>
            </Center>
            <SearchInput setSearch={setSearch} />
            {data && (
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
                        />
                    ))}
                    {data.inactivePersonnel.length > 0 && (
                        <MemoizedPlatoonAccordionItem
                            personnel={data.inactivePersonnel}
                            platoon="ORD"
                            search={search}
                            ord={true}
                        />
                    )}
                </Accordion>
            )}
        </Stack>
    );
};

export default TransferPage;
