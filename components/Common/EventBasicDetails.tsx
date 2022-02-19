import { SimpleGrid, Text } from "@chakra-ui/react";
import React from "react";

const EventBasicDetails: React.FC<{ top: string; bottom: string }> = ({
    top,
    bottom,
}) => (
    <SimpleGrid py={1} px={2} columns={1} spacing={1}>
        <Text fontWeight="semibold"> {top} </Text>
        <Text>{bottom}</Text>
    </SimpleGrid>
);

export default React.memo(EventBasicDetails)