import { Box, Divider, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import { SortedObject } from "../../../pages/api/info/overview";
import { ExtendedPersonnel } from "../../../types/database";
import SmallCard from "../../Card/SmallCard";
import { AddedAttCOrCourse } from "../../Dashboard/AddedEvent";
import PersonTemplate from "./Person";

const CourseCard: React.FC<{
    courseSortedByPlatoonThenID: SortedObject;
}> = ({ courseSortedByPlatoonThenID }) => {
    return (
        <Stack direction="column"  spacing={3} divider={<Divider />}>
            {Object.keys(courseSortedByPlatoonThenID).map((platoon, index) => (
                <Stack key={index} direction="column"  spacing={3} divider={<Divider />}>
                    {Object.keys(courseSortedByPlatoonThenID[platoon]).map(
                        (personnel_ID, index2) => (
                            <Box key={index2}>
                                <PersonTemplate
                                    person={
                                        courseSortedByPlatoonThenID[platoon][
                                            personnel_ID
                                        ][0]
                                    }
                                ></PersonTemplate>
                                <Wrap mt={1}>
                                    {courseSortedByPlatoonThenID[platoon][
                                        personnel_ID
                                    ].map((course, index2) => (
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
                                                            course.start,
                                                            course.end,
                                                        ],
                                                        reason: course.course_name,
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
export default CourseCard;
