export interface User {
    row_ID: number;
    google_ID: string;
    personnel_ID: number;
    photo: string;
    unit: string;
    company: string;
    platoon: string;
    permissions: string;
    username: string;
    email: string;
}

export interface BasicPersonnel { 
    rank: string,
    name: string,
    pes: string,
    post_in: Date|string,
    ord: Date|string,
    platoon: string,
    svc_status: string,
    pers_num: string
}

export interface Personnel extends BasicPersonnel {
    personnel_ID: number;
    rank: string;
    name: string;
    pes: string;
    post_in: Date;
    ord: Date;
    off_balance: number;
    leave_balance: number;
    unit: string;
    company: string;
    platoon: string;
    section: string;
    svc_status: string;
    ha_active: boolean,
    ha_end_date: Date,
    pers_num: string

}

export interface ExtendedPersonnel extends Personnel {
    location: string;
    locationArr: string[];
    [key: string]: any;
}
