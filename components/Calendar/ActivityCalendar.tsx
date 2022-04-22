import React, { SyntheticEvent } from "react";
import { PersonnelPageData } from "../../pages/personnel/manage/[p_ID]";
import { Personnel } from "../../types/database";
import {
    Calendar,
    dateFnsLocalizer,
    Event,
    EventPropGetter,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

import "../../node_modules/react-big-calendar/lib/css/react-big-calendar.css";
import { Box } from "@chakra-ui/react";
import { colorArray, googleColors } from "../../lib/colors";

export interface CustomEvent extends Event { 
    activity_ID?: number;
    type?: string,
    color?: string
}

const locales = {
    "en-US": enUS,
};
const ActivityCalendar: React.FC<{
    data: CustomEvent[];
    onClick: (event: CustomEvent) => void;
}> = ({ data, onClick }) => {
    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
    });

    const mappedData = data
    const eventStyleGetter: EventPropGetter<CustomEvent> = (event) => {
      
        console.log({event})
        if (event.title?.toString().startsWith("Missed:")) { 
            return {
                style: {
                    backgroundColor: "gray",
                    color: "darkgray"
                }
            }
        }
        // if (event.title?.toString().startsWith("HA")) {
        //     return {style: {
        //         backgroundColor: event.color
        //     }}
        // }
        return {
            style: {
                backgroundColor: googleColors[event.color as keyof typeof googleColors],
                color: "white",
            },
        };
    };

    const onSelectEventHandler = (event: CustomEvent, e: SyntheticEvent) => {
        console.log(event); // only status has no event type
        onClick(event)
    };
    return (
        <Box height={{ base: "800px" }}>
            <Calendar
                localizer={localizer}
                events={mappedData}
                views={["month", "agenda"]}
                style={{ height: "100%" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={onSelectEventHandler}
            />
        </Box>
    );
};

export default React.memo(ActivityCalendar);
