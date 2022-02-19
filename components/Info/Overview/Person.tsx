import { Flex, Box, Stack, Center, Badge, Text, Link, Tag, TagLabel } from "@chakra-ui/react";

import { ReactNode } from "react";
import { ExtendedPersonnel } from "../../../types/database";

const PersonTemplate: React.FC<{
    person: ExtendedPersonnel;
    children?: ReactNode;
}> = ({ person, children }) => {
    
    return (
        <Flex
            alignItems="center"
            // m={{ lg: "unset", base: "auto" }}
        >
            <Box>
                {/* <Flex align="center"> */}
                <Stack direction="row">
                    <Center>
                        <Badge colorScheme="purple">{person.pes}</Badge>
                    </Center>
                    <Text fontWeight="semibold">
                        <Link
                            isExternal
                            href={`/personnel/manage/${person.personnel_ID}`}
                        >
                            {person.rank} {person.name}
                        </Link>
                    </Text>
                </Stack>

                <Flex align="center">
                    <Stack direction="row" my={1} wrap="wrap">
                        <Tag size="sm" variant="subtle" colorScheme="purple">
                            <TagLabel> {person.platoon} </TagLabel>
                        </Tag>
                        {children}
                    </Stack>
                </Flex>
            </Box>
        </Flex>
    );
};
export default PersonTemplate;
