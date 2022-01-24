export interface User {
    row_ID: number,
    google_ID: string,
    personnel_ID: number,
    photo: string,
    unit: string,
    company: string,
    platoon: string,
    permissions: string,
    username: string,
    email: string,
    
  }


  export interface Personnel { 
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
    
  }

export interface ExtendedPersonnel extends Personnel { 
    location: string;
    [key:string]: string|number|Date
}