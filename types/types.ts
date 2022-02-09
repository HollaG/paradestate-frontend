import { StatusOption } from "../pages/personnel/manage/status";
import { BasicPersonnel, ExtendedPersonnel, Personnel } from "./database";

export interface RootState {
    dashboard: DashboardState;
    status: StatusState;
    personnel: PersonnelState;
}

export interface PersonnelState {
    import: PersonnelImportState
}

export interface PersonnelImportState {
    excel: BasicPersonnel[];
    googleSheets: BasicPersonnel[];
} 
export interface StatusState {
    sortedByPlatoon: {
        [key: string]: ExtendedPersonnel[];
    };
    personnelMap: PersonnelMap;
    statuses: StatusOption[];
}
export interface PersonnelMap {
    [key: string]: SelectedPersonStatuses;
}

export interface SelectedPersonStatuses {
    [key: string]: {
        perm: boolean;
        selected: StatusOption[];
        date: [string, string];
    };
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
    day: number;
    badgeText: string;
    disabled: boolean;
}

export interface Status {
    status_ID: string;
    status_name: string;
}

export interface ExtendedStatus extends Status {
    personnel_ID: string;
    start: Date | string;
    end: Date | string;
    type: "perm" | "";
    [key: string]: any;
}

export interface GenericEvent {
    row_ID: string;
    personnel_ID: string;
    editor_ID:string;
    start: Date;
    end: Date;
    [key: string]: any;
}

export interface OffOrLeaveEvent extends GenericEvent {
    start_time: "AM" | "PM";
    end_time: "AM" | "PM";
    reason: string;
}

export interface MAEvent {
    location: string;
    ma_name: string;
    in_camp: boolean;
    time: string;
    row_ID: string;
    date: Date;
    personnel_ID: string;

    [key: string]: any;
}

export interface OtherEvent extends GenericEvent {
    others_name: string;
    location: string;
    in_camp: boolean;
}
