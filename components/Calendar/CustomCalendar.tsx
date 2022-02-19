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
import { colorArray } from "../../lib/colors";

const locales = {
    "en-US": enUS,
};
const CustomCalender: React.FC<{
    data: PersonnelPageData;
    onClick: (event: Event) => void;
}> = ({ data, onClick }) => {
    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
    });

    const mappedData = data.calendarData.map((event) => ({
        ...event,
        start: event.start ? new Date(event.start) : new Date(),
        end: event.end ? new Date(event.end) : new Date(),
    }));
    const eventStyleGetter: EventPropGetter<{
        start: Date;
        end: Date;
        allDay?: boolean | undefined;
        title?: React.ReactNode;
        resource?: any;
    }> = ({ start, end, allDay, title }) => {
        let color: string = "";
        let cleanedTitle = title?.toString().toLowerCase() || "";
        if (cleanedTitle.startsWith("off")) {
            color = colorArray[0];
        }
        if (cleanedTitle.startsWith("leave")) {
            color = colorArray[0];
        }
        if (cleanedTitle.startsWith("attc")) {
            color = colorArray[1];
        }
        if (cleanedTitle.startsWith("course")) {
            color = colorArray[2];
        }
        if (cleanedTitle.startsWith("ma")) {
            color = colorArray[3];
        }
        if (cleanedTitle.startsWith("course")) {
            color = colorArray[4];
        }
        if (cleanedTitle.startsWith("status")) {
            color = colorArray[5];
        }

        return {
            style: {
                backgroundColor: color,
                color: "white",
            },
        };
    };

    const onSelectEventHandler = (event: any, e: SyntheticEvent) => {
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

export default React.memo(CustomCalender);
