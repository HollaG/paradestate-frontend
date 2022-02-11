import { Box, Divider, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import { SortedObject } from "../../../pages/api/info/overview";
import { ExtendedPersonnel } from "../../../types/database";
import SmallCard from "../../Card/SmallCard";
import { AddedOthers } from "../../Dashboard/AddedEvent";
import PersonTemplate from "./Person";

const OthersCard: React.FC<{
    othersSortedByPlatoonThenID: SortedObject;
}> = ({ othersSortedByPlatoonThenID }) => {
    return (
        <Stack direction="column"  spacing={3} divider={<Divider />}>
            {Object.keys(othersSortedByPlatoonThenID).map((platoon, index) => (
                <Stack key={index} direction="column"  spacing={3} divider={<Divider />}>
                    {Object.keys(othersSortedByPlatoonThenID[platoon]).map(
                        (personnel_ID, index2) => (
                            <Box key={index2}>
                                <PersonTemplate
                                    person={
                                        othersSortedByPlatoonThenID[platoon][
                                            personnel_ID
                                        ][0]
                                    }
                                ></PersonTemplate>
                                <Wrap mt={1}>
                                    {othersSortedByPlatoonThenID[platoon][
                                        personnel_ID
                                    ].map((others, index2) => (
                                        <WrapItem key={index2}>
                                            <SmallCard
                                                colors={["red.50", "gray.800"]}
                                                borderColors={[
                                                    "red.100",
                                                    "gray.800",
                                                ]}
                                            >
                                                <AddedOthers
                                                    data={{
                                                        date: [
                                                            others.start,
                                                            others.end,
                                                        ],
                                                        incamp: others.in_camp,
                                                        name: others.others_name,
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
export default OthersCard;
