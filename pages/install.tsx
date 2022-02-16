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
    const {
        
        showInstallPrompt,
        appinstalled, 
        isPwa,
    } = usePwa();
   
    const router = useRouter()
    useEffect(() => {
        if (isPwa || appinstalled) router.push("/")
    },[isPwa, appinstalled])
    return (
        <Stack direction="column" textAlign="center">
            <Heading>Install this website as an app on your device</Heading>
            <Text>
                You can now install this website as an app. To do so, click the
                button below:
            </Text>
            <Box>
                <Button colorScheme="teal" onClick={showInstallPrompt}>Install</Button>
            </Box>
            {/* <button
                class="mb-3 btn btn-primary android"
                id="install-button"
                onclick="install()"
            ></button> */}
            <Divider />
            <Text>
                For iOS users, use Safari, then tap the {"'"}Share{"'"} button
                and then
                {" '"}Add to Home Screen{"'"}.
            </Text>
        </Stack>
    );
};

export default InstallPage;
