import { Box, Center, Heading } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import React, { ReactNode } from "react";
import AuthStepper from "./AuthStepper";

const AuthHeading: React.FC<{ step: 0 | 1 | 2; children: ReactNode, skippedOpt?: boolean }> = ({
    step,
    children,
    skippedOpt = false
}) => {
    return (
        <Box w="100%">
            <Center>
                <Heading> {children} </Heading>
            </Center>
            <Center mt={2} w="100%">
                <AuthStepper step={step} skippedOpt={skippedOpt}/>
            </Center>
        </Box>
    );
};

export default React.memo(AuthHeading);
