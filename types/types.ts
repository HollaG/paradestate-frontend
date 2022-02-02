import { StatusOption } from "../pages/personnel/manage/status";
import { Personnel } from "./database";

export interface RootState {
    dashboard: DashboardState;
    status: StatusState
}
export interface StatusState {
    isPerm: boolean;
    sortedByPlatoon: { [key: string]: any };
    statusDate: [string, string];
    statuses: StatusOption[];
}
export interface DashboardState {
    data: EventData;
    personnelMap: { [key: number]: Personnel };
}

export interface EventData {
    off: {
        [key: number]: any;
    };
    leave: {
        [key: number]: any;
    };
    attc: {
        [key: number]: any;
    };
    course: {
        [key: number]: any;
    };
    ma: {
        [key: number]: any;
    };
    others: {
        [key: number]: any;
    };
}

export interface Data {
    off: any;
    leave: any;
    attc: any;
    course: any;
    ma: any;
    others: any;
}

export interface HighlightedDay { 
    day: number,
    badgeText: string,
    disabled: boolean
}

export interface Status {
    status_ID: string;
    status_name: string
    
}

export interface ExtendedStatus extends Status { 
    personnel_ID: string;
    start: Date|string;
    end: Date|string;
    type: "perm" | ""
}