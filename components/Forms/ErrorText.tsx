import React from "react";
import { Text } from "@chakra-ui/react"
const ErrorText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <Text ml={2} fontSize="xs" color="red.500" fontWeight="semibold">
            {text}
        </Text>
    );
};

export default React.memo(ErrorText);
