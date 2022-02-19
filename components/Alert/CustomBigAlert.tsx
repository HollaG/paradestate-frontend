import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { ReactNode } from "react";

const CustomBigAlert: React.FC<{
    children: ReactNode;
    header: string;
}> = ({ children, header }) => (
    <Alert
        status="success"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
    >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
            {header}
        </AlertTitle>
        <AlertDescription maxWidth="sm">
            {children}
        </AlertDescription>
    </Alert>
);

export default CustomBigAlert