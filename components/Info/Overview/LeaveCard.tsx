import { Box, Divider, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import { SortedObject } from "../../../pages/api/info/overview";
import { ExtendedPersonnel } from "../../../types/database";
import SmallCard from "../../Card/SmallCard";
import { AddedLeaveOrOff } from "../../Dashboard/AddedEvent";
import PersonTemplate from "./Person";

const LeaveCard: React.FC<{
    leaveSortedByPlatoonThenID: SortedObject;
}> = ({ leaveSortedByPlatoonThenID }) => {
    return (
        <Stack direction="column"  spacing={3} divider={<Divider />}>
            {Object.keys(leaveSortedByPlatoonThenID).map((platoon, index) => (
                <Stack key={index} direction="column"  spacing={3} divider={<Divider />}>
                    {Object.keys(leaveSortedByPlatoonThenID[platoon]).map(
                        (personnel_ID, index2) => (
                            <Box key={index2}>
                                <PersonTemplate
                                    person={
                                        leaveSortedByPlatoonThenID[platoon][
                                            personnel_ID
                                        ][0]
                                    }
                                ></PersonTemplate>
                                <Wrap mt={1}>
                                    {leaveSortedByPlatoonThenID[platoon][
                                        personnel_ID
                                    ].map((leave, index2) => (
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
                                                            leave.start,
                                                            leave.end,
                                                        ],
                                                        "start-time":
                                                            leave.start_time,
                                                        "end-time":
                                                            leave.end_time,
                                                        reason: leave.reason,
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
export default LeaveCard;
