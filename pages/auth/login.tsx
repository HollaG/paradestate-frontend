import { Avatar, Button, Center, Heading, Stack, Text } from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { BuiltInProviderType } from "next-auth/providers";
import {
    ClientSafeProvider,
    getProviders,
    LiteralUnion,
    signIn,
} from "next-auth/react";
import GoogleButton from "../../components/Buttons/GoogleButton";

const Login: React.FC<{
    providers: Record<
        LiteralUnion<BuiltInProviderType, string>,
        ClientSafeProvider
    > | null;
}> = ({ providers }) => {
    console.log({ providers });
    return (
        <Stack direction="column" align="center">
            <Avatar size="2xl" src="/logos/icon-full.png" />

            <Text fontSize="3xl" fontWeight="semibold">
                Parade State Generator
            </Text>
            <Text>Please sign in using one of the methods below.</Text>
            <GoogleButton />
        </Stack>
    );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const providers = await getProviders();
    return {
        props: { providers },
    };
}

export default Login;
