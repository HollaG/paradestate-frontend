import { AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from "@chakra-ui/react";
import React from "react";

const DeleteDialog: React.FC<{
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    confirmDelete: () => void;
    type?: string;
}> = ({ isOpen, setIsOpen, confirmDelete, type = "entry" }) => {
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const closeHandler = () => {
        confirmDelete();
        setIsOpen(false);
    };
    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete {type}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can{"'"}t undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={closeHandler} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};
export default DeleteDialog