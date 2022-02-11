import { Box, Divider, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import { SortedObject } from "../../../pages/api/info/overview";
import { ExtendedPersonnel } from "../../../types/database";
import SmallCard from "../../Card/SmallCard";
import { AddedLeaveOrOff } from "../../Dashboard/AddedEvent";
import PersonTemplate from "./Person";

const OffCard: React.FC<{
    offSortedByPlatoonThenID: SortedObject;
}> = ({ offSortedByPlatoonThenID }) => {
    return (
        <Stack direction="column"  spacing={3} divider={<Divider />}>
            {Object.keys(offSortedByPlatoonThenID).map((platoon, index) => (
                <Stack key={index} direction="column" spacing={3} divider={<Divider />}>
                    {Object.keys(offSortedByPlatoonThenID[platoon]).map(
                        (personnel_ID, index2) => (
                            <Box key={index2}>
                                <PersonTemplate
                                    person={
                                        offSortedByPlatoonThenID[platoon][
                                            personnel_ID
                                        ][0]
                                    }
                                ></PersonTemplate>
                                <Wrap mt={1}>
                                    {offSortedByPlatoonThenID[platoon][
                                        personnel_ID
                                    ].map((off, index2) => (
                                        <WrapItem key={index2}>
                                            <SmallCard
                                                colors={["red.50", "gray.800"]}
                                                borderColors={[
                                                    "red.100",
                                                    "gray.800",
                                                ]}
                                            >
                                                <AddedLeaveOrOff
                                                    data={{
                                                        date: [
                                                            off.start,
                                                            off.end,
                                                        ],
                                                        "start-time":
                                                            off.start_time,
                                                        "end-time":
                                                            off.end_time,
                                                        reason: off.reason,
                                                    }}
                                                />
                                            </SmallCard>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            </Box>
                        )
                    )}
                </Stack>
            ))}
        </Stack>
    );
};
export default OffCard;
