import { Box, Button, Center, Heading } from "@chakra-ui/react";
import CustomStatusStepper from "./CustomStatusStepper";


const StatusHeading: React.FC<{ step: 0 | 1 | 2}> = ({
    children,
    step,
}) => {
    return (
        <Box>
            <Center w="100%">{children}</Center>
            <Center mt={2}>
                
                <CustomStatusStepper step={step} />
            </Center>
        </Box>
    );
};

export default StatusHeading;
