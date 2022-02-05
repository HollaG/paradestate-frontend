import { Flex, Box, Stack, Center, Badge, Text } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { ExtendedPersonnel, Personnel } from "../../types/database";

const PersonBasicDetails: React.FC<{
    person: ExtendedPersonnel;
    children: ReactNode;
}> = ({ person, children }) => (
    <Flex alignItems="center">
        <Box>
            <Stack direction="row">
                {person.pes && <Center>
                    <Badge colorScheme="purple">{person.pes}</Badge>
                </Center>}
                <Text fontWeight="semibold">
                    {person.rank} {person.name}
                </Text>
            </Stack>

            {!!React.Children.count && (
                <Flex align="center">
                    <Stack direction="row" my={1} wrap="wrap">
                        {children}
                    </Stack>
                </Flex>
            )}
        </Box>
    </Flex>
);

export default React.memo(PersonBasicDetails);
