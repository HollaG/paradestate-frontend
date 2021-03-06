import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { differenceInCalendarDays, format } from "date-fns";
import { ExtendedStatus } from "../../../types/types";
import Assignments from "../../../config/assignments.json";
import EventBasicDetails from "../../Common/EventBasicDetails";
const StatusEntry: React.FC<{ status: ExtendedStatus }> = ({ status }) => {
    const statusText =
        status.type === "perm"
            ? "Permanent"
            : `${format(
                  new Date(status.start),
                  Assignments.dateformat
              )} - ${format(new Date(status.end), Assignments.dateformat)} (${differenceInCalendarDays(new Date(status.end), new Date(status.start)) + 1} days)`;
    return <EventBasicDetails top={status.status_name} bottom={statusText} />;
};

export default StatusEntry;
