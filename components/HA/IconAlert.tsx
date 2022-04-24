
import { Center, Icon, Link } from "@chakra-ui/react";
import { differenceInBusinessDays } from "date-fns";
import { IoPartlySunny } from "react-icons/io5";
import { Personnel } from "../../types/database";

const IconAlert: React.FC<{ activityDate: Date; person: Personnel }> = ({
    activityDate,
    person,
}) => {
    let color = "red.400";
    if (person.ha_active) {
        if (
            differenceInBusinessDays(
                new Date(person.ha_end_date),
                activityDate,
            ) < 3
        )
            color = "yellow.400";
        else color = "green.400";
    }
    return (
        <Link
            href={`/personnel/manage/${person.personnel_ID}?view=ha`}
            isExternal
        >
            {/* <Center h="100%">
                {person.ha_active ? (
                    differenceInBusinessDays(
                        activityDate,
                        new Date(person.ha_end_date)
                    ) < 3 ? (
                        
                        <SunIcon w={5} h={5} color="green.400" />
                    ) : (
                        <SunIcon w={5} h={5} color="yellow.400" />
                    )
                ) : (
                    <SunIcon w={5} h={5} color="red.400" />
                )}
            </Center> */}
            <Center h="100%">
                <Icon as={IoPartlySunny} w={5} h={5} color={color}/>
                
            </Center>
        </Link>
    );
};

export default IconAlert;
