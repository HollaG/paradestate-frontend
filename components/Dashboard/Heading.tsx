import { Box, Button, Center, Heading } from "@chakra-ui/react";
import React from "react";
import CustomStepper from "./CustomStepper";

const DashboardHeading: React.FC<{ step: 0 | 1 | 2 }> = React.memo(({
    children,
    step,
}) => {
    return (
        <Box>
            <Center w="100%">{children}</Center>
            <Center mt={2}>
                {/* <Text>
                            {" "}
                            Click the buttons on the right to add events{" "}
                        </Text> */}
                <CustomStepper step={step} />
            </Center>
        </Box>
    );
});

export default DashboardHeading;
