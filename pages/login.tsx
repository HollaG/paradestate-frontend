import { Button } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import Layout from "../components/Sidebar";

const Login = () => {
    
    return (
        <Layout
            content={
                <Button colorScheme="teal" onClick={() => signIn()}>
                    Sign in
                </Button>
            }
        />
    );
};

export default Login;
