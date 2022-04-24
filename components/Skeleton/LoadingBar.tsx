import { Center, CircularProgress, Progress } from "@chakra-ui/react";

const CustomLoadingBar: React.FC = () => {
    // return (
    //     <Center>
    //         <Progress size="xs" color="teal" isIndeterminate/>
    //         {/* <CircularProgress size='120px' color="teal" isIndeterminate textAlign='center' /> */}
    //     </Center>
    // );
    return <Progress size="xs" colorScheme="teal" isIndeterminate/>
     
};

export default CustomLoadingBar;
