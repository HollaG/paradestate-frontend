import {
    Button,
    Center,
    Heading,
    Stack,
    Text,
    Box,
    Divider,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import usePwa from "use-pwa";
const InstallPage: NextPage = () => {
    const { showInstallPrompt } = usePwa();
    return (
        <Stack direction="column" textAlign="center">
            <Heading>Install this website as an app on your device</Heading>
            <Box id="android">
                <Text>
                    You can now install this website as an app. For <b>Android</b> users, click
                    the button below:
                </Text>
                <Box mt={2}>
                    <Button colorScheme="teal" onClick={showInstallPrompt}>
                        Install app
                    </Button>
                </Box>
            </Box>
            
            <Text id="ios">
                For <b>iOS</b> users, use Safari, then tap the {"'"}Share{"'"} button
                and then
                {" '"}Add to Home Screen{"'"}.
            </Text>
        </Stack>
    );
};

export default InstallPage;
