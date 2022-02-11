import { Box, Divider, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import { SortedStatusObject } from "../../../pages/api/info/overview";
import { ExtendedPersonnel } from "../../../types/database";
import { ExtendedStatus } from "../../../types/types";
import BasicCard from "../../Card/BasicCard";
import SmallCard from "../../Card/SmallCard";
import { AddedOthers } from "../../Dashboard/AddedEvent";
import StatusEntry from "../../Personnel/Status/StatusEntry";
import PersonTemplate from "./Person";

const StatusCard: React.FC<{
    statusesSortedByPlatoonThenID: SortedStatusObject;
}> = ({ statusesSortedByPlatoonThenID }) => {
    return (
        <Stack direction="column"  spacing={3} divider={<Divider />}>
            {Object.keys(statusesSortedByPlatoonThenID).map(
                (platoon, index) => (
                    <Stack key={index} direction="column"  spacing={3} divider={<Divider />}>
                        {Object.keys(
                            statusesSortedByPlatoonThenID[platoon]
                        ).map((personnel_ID, index2) => (
                            <Box key={index2}>
                                <PersonTemplate
                                    person={
                                        statusesSortedByPlatoonThenID[platoon][
                                            personnel_ID
                                        ][0]
                                    }
                                />
                                <Wrap mt={1}>
                                    {statusesSortedByPlatoonThenID[platoon][
                                        personnel_ID
                                    ].map((status, index2) => (
                                        <WrapItem key={index2}>
                                            <SmallCard
                                                colors={["red.50", "gray.800"]}
                                                borderColors={[
                                                    "red.100",
                                                    "gray.800",
                                                ]}
                                            >
                                                <StatusEntry status={status} />
                                            </SmallCard>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                                
                            </Box>
                        ))}
                    </Stack>
                )
            )}
        </Stack>
    );
};
export default StatusCard;
