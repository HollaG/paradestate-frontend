import { Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import fetcher from "../../../lib/fetcher";
import { Absentee, Attendee } from "../../../pages/api/activity/[activity_ID]";
import { Activity } from "../../../types/activity";
import { Personnel } from "../../../types/database";
import ActivityCalendar from "../../Calendar/ActivityCalendar";
import { CustomEvent } from "../../Calendar/ActivityCalendar";
import StatusAlert from "../../HA/StatusAlert";
import HATimeLine from "../HATimeLine";

const HA: React.FC = () => {
    console.log("hello from HA page");
    const router = useRouter();
    const personnel_ID = router.query.p_ID;
    const { data, error } = useSWR<{
        activities: Activity[];
        calendarData: CustomEvent[];
        absencesByActivityID: {
            [key: string]: Absentee[];
        };
        attendedByActivityID: {
            [key: string]: Attendee[];
        };
        haEvents: {
            row_ID: number;
            personnel_ID: number;
            event_type: "ended" | "resumed";
            date: Date;
        }[];
        person: Personnel;
    }>(`/api/personnel/manage/${personnel_ID}/ha`, fetcher);


    const eventOnClick = (event: CustomEvent) => {
        router.push(`/activity/${event.activity_ID}`);
    };

    if (data)
        return (
            <Stack>
                <StatusAlert person={data.person} />
                <ActivityCalendar
                    data={data.calendarData}
                    onClick={eventOnClick}
                />
                <HATimeLine haEvents={data.haEvents} person={data.person} />
            </Stack>
        );
    else return <>Loading...</>;
};

export default React.memo(HA);
