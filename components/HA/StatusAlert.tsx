import { Alert, AlertIcon } from "@chakra-ui/react";
import { differenceInBusinessDays, format } from "date-fns";
import { Personnel } from "../../types/database";
import Assignments from "../../config/assignments.json";
const StatusAlert: React.FC<{ person: Personnel }> = ({ person }) => {
    if (!person.ha_active)
        return (
            <Alert status="error">
                <AlertIcon />
                Not heat acclimatised! Expired{" "}
                {differenceInBusinessDays(
                    new Date(),
                    new Date(person.ha_end_date)
                )}{" "}
                working days ago (
                {format(new Date(person.ha_end_date), Assignments.dateformat)})
            </Alert>
        );
    else if (
        person.ha_active &&
        differenceInBusinessDays(new Date(person.ha_end_date), new Date()) <= 3
    )
        return (
            <Alert status="warning">
                <AlertIcon />
                Heat acclimatisation will expire in{" "}
                {differenceInBusinessDays(
                    new Date(person.ha_end_date),
                    new Date()
                )}{" "} working
                days! (
                {format(new Date(person.ha_end_date), Assignments.dateformat)})
            </Alert>
        );
    return (
        <Alert status="success">
            <AlertIcon />
            Heat acclimatisation will expire in{" "}
            {differenceInBusinessDays(
                new Date(person.ha_end_date),
                new Date()
            )}{" "} working
            days. (
            {format(new Date(person.ha_end_date), Assignments.dateformat)})
        </Alert>
    );
};
export default StatusAlert;
