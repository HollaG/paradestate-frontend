import { Box, Divider, Flex, Heading, Stack, Tag, TagLabel } from "@chakra-ui/react";
import { DefaultLink } from "../../../pages";
import { ExtendedPersonnel } from "../../../types/database";
import PersonTemplate from "./Person";
const events: (
    | "off"
    | "leave"
    | "attc"
    | "course"
    | "ma"
    | "others"
    | "extras"
    | "incamp"
)[] = ["off", "leave", "attc", "course", "ma", "others"];
const AllCard: React.FC<{
    sortedByPlatoon: { [key: string]: ExtendedPersonnel[] };
    type: string;
}> = ({ sortedByPlatoon, type }) => {
    return (
        <Stack direction="column" spacing={3} divider={<Divider />}>
            {Object.keys(sortedByPlatoon).map((platoon, index) => (
                <Box key={index}>
                    <Heading mb={2}> {platoon} </Heading>                     
                    <Stack direction="column" spacing={3} divider={<Divider />}>
                        {sortedByPlatoon[platoon].map((person, index2) => {
                            if (
                                type === "All" ||
                                (type === "In camp" &&
                                    person.location === "In camp") ||
                                (type === "Out of camp" &&
                                    person.location !== "In camp")
                            )
                                return (
                                    <Box key={index2}>
                                        <PersonTemplate person={person}>
                                            {/* <Flex align="center">
                                    <Stack direction="row" my={1} wrap="wrap"> */}

                                            {events.map((event, index) =>
                                                person[`${event}_row_ID`] ? (
                                                    <DefaultLink
                                                        key={index}
                                                        url={`/personnel/manage/${event}/${
                                                            person.personnel_ID
                                                        }/#${
                                                            person[
                                                                `${event}_row_ID`
                                                            ]
                                                        }`}
                                                        type={event}
                                                        person={person}
                                                    />
                                                ) : null
                                            )}
                                            {person.location === "In camp" && (
                                                <DefaultLink
                                                    key={index}
                                                    url=""
                                                    type={"incamp"}
                                                    person={person}
                                                />
                                            )}
                                            {/* </Stack>
                                </Flex> */}
                                        </PersonTemplate>
                                    </Box>
                                );
                            else return null;
                        })}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
};

export default AllCard;
