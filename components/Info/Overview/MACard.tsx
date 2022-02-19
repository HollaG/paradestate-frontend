import { Box, Divider, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import { SortedObject } from "../../../pages/api/info/overview";
import { ExtendedPersonnel } from "../../../types/database";
import SmallCard from "../../Card/SmallCard";
import { AddedMA } from "../../Dashboard/AddedEvent";
import PersonTemplate from "./Person";

const MaCard: React.FC<{
    maSortedByPlatoonThenID: SortedObject;
}> = ({ maSortedByPlatoonThenID }) => {
    return (
        <Stack direction="column"  spacing={3} divider={<Divider />}>
            {Object.keys(maSortedByPlatoonThenID).map((platoon, index) => (
                <Stack key={index} direction="column"  spacing={3} divider={<Divider />}>
                    {Object.keys(maSortedByPlatoonThenID[platoon]).map(
                        (personnel_ID, index2) => (
                            <Box key={index2}>
                                <PersonTemplate
                                    person={
                                        maSortedByPlatoonThenID[platoon][
                                            personnel_ID
                                        ][0]
                                    }
                                ></PersonTemplate>
                                <Wrap mt={1}>
                                    {maSortedByPlatoonThenID[platoon][
                                        personnel_ID
                                    ].map((ma, index2) => (
                                        <WrapItem key={index2}>
                                            <SmallCard
                                                colors={["red.50", "gray.800"]}
                                                borderColors={[
                                                    "red.100",
                                                    "gray.800",
                                                ]}
                                            >
                                                <AddedMA
                                                    key={index2}
                                                    data={{
                                                        "date-time": ma.date,
                                                        incamp: ma.in_camp,
                                                        location: ma.location,
                                                        name: ma.ma_name,
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
export default MaCard;
