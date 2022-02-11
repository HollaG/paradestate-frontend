import { Box, Divider, Stack, Tag, TagLabel, Wrap, WrapItem } from "@chakra-ui/react";
import { SortedObject } from "../../../pages/api/info/overview";
import { ExtendedPersonnel } from "../../../types/database";
import SmallCard from "../../Card/SmallCard";
import { AddedAttCOrCourse } from "../../Dashboard/AddedEvent";
import PersonTemplate from "./Person";

const AttcCard: React.FC<{
    attcSortedByPlatoonThenID: SortedObject;
}> = ({ attcSortedByPlatoonThenID }) => {
    return (
        <Stack direction="column"  spacing={3} divider={<Divider />}>
            {Object.keys(attcSortedByPlatoonThenID).map((platoon, index) => (
                <Stack key={index} direction="column"  spacing={3} divider={<Divider />}>
                    {Object.keys(attcSortedByPlatoonThenID[platoon]).map(
                        (personnel_ID, index2) => (
                            <Box key={index2}>
                                <PersonTemplate
                                    person={
                                        attcSortedByPlatoonThenID[platoon][
                                            personnel_ID
                                        ][0]
                                    }
                                ></PersonTemplate>

                                <Wrap mt={1}>
                                    {attcSortedByPlatoonThenID[platoon][
                                        personnel_ID
                                    ].map((attc, index2) => (
                                        <WrapItem key={index2}>
                                            <SmallCard
                                                colors={["red.50", "gray.800"]}
                                                borderColors={[
                                                    "red.100",
                                                    "gray.800",
                                                ]}
                                            >
                                            
                                                <AddedAttCOrCourse
                                                    
                                                    data={{
                                                        date: [
                                                            attc.start,
                                                            attc.end,
                                                        ],
                                                        reason: attc.attc_name,
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
export default AttcCard;
