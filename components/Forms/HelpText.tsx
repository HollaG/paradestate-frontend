import React from "react";
import { Text } from "@chakra-ui/react"
const HelpText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <Text ml={2} fontSize="xs" color="gray.500" fontWeight="semibold">
            {text}
        </Text>
    );
};

export default React.memo(HelpText);
