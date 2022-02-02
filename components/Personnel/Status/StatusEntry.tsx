import { Box, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { ExtendedStatus } from "../../../types/types";
import Assignments from "../../../config/assignments.json";
const StatusEntry: React.FC<{ status: ExtendedStatus }> = ({ status }) => {
    const statusText =
        status.type === "perm"
            ? "Permanent"
            : `${format(new Date(status.start), Assignments.dateformat)} - ${format(
                  new Date(status.end),
                  Assignments.dateformat
              )}`;
    return (
        <Box>
            <Text fontWeight="semibold"> {status.status_name} </Text>
            <Text> {statusText} </Text>
        </Box>
    );
};

export default StatusEntry;
