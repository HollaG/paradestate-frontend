import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";

const SmallCard: React.FC<{ children: ReactNode, colors?: [string, string], borderColors?: [string, string] }> = ({ children, colors = ["white", 'gray.800'], borderColors = ["white", "gray.800"] }) => {
    return (
        <Box
            px={1}
            py={0.5}
            bg={useColorModeValue(colors[0], colors[1])}
            borderRadius="sm"
            // width="fit-content"
            sx={{
                // boxShadow: 1,
                borderRadius: "6px",
            }}
            w="fit-content"
            border="1px"
            borderColor={useColorModeValue(borderColors[0], borderColors[1])} 
        >
            {children}
        </Box>
    );
};

export default SmallCard;
