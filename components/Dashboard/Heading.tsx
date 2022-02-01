import { Box, Button, Center, Heading } from "@chakra-ui/react";
import CustomStepper from "./CustomStepper";

const DashboardHeading: React.FC<{ step: 0 | 1 | 2 }> = ({
    children,
    step,
}) => {
    return (
        <Box mb={2}>
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
};

export default DashboardHeading;
