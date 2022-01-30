import { Personnel } from "./database";

export interface RootState {
    dashboard: DashboardState;
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