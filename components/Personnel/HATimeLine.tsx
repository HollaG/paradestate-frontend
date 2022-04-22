import {
    Timeline,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
} from "@mui/lab";
import { format } from "date-fns";
import { Personnel } from "../../types/database";
import Assignments from "../../config/assignments.json";
const HATimeLine: React.FC<{
    haEvents: {
        row_ID: number;
        personnel_ID: number;
        event_type: "ended" | "resumed";
        date: Date;
    }[];
    person: Personnel;
}> = ({ haEvents, person }) => {
    return (
        <Timeline>
            <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                    {format(new Date(person.post_in), Assignments.dateformat)}
                </TimelineOppositeContent>
                <TimelineSeparator>
                    <TimelineDot color="success"/>
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>Posted in (HA active)</TimelineContent>
            </TimelineItem>
            {haEvents.map((event, index) => (
                <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                        {format(new Date(event.date), Assignments.dateformat)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot color={event.event_type === "ended" ? "error" : "success"}/>
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>HA {event.event_type}</TimelineContent>
                </TimelineItem>
            ))}
            
        </Timeline>
    );
};

export default HATimeLine;
