import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";

const BasicCard: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <Flex
            p="4"
            bg={useColorModeValue("white", "gray.900")}
            borderRadius="sm"
            // width="fit-content"
            sx={{
                boxShadow: 2,
                borderRadius: "6px",
            }}
        >
            {children}
        </Flex>
    );
};

export default BasicCard;
