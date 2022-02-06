import { Flex, Box, Stack, Center, Badge, Text, Link } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { ExtendedPersonnel, Personnel } from "../../types/database";
import NextLink from "next/link";

const PersonBasicDetails: React.FC<{
    person: ExtendedPersonnel;
    children: ReactNode;
    handleClick: () => Promise<boolean>
}> = ({ person, children, handleClick }) => (
    <Flex alignItems="center">
        <Box>
            <Stack direction="row">
                {person.pes && (
                    <Center>
                        <Badge colorScheme="purple">{person.pes}</Badge>
                    </Center>
                )}
                <Text fontWeight="semibold">
                    {/* <NextLink
                        href={{
                            pathname: "/personnel/manage/[p_ID]",
                            query: { p_ID: person.p_ID },
                        }}
                        passHref
                    > */}
                        <Link onClick={handleClick}>
                            {person.rank} {person.name}
                        </Link>
                    {/* </NextLink> */}
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
