import Assignments from '../config/assignments.json'
export interface Activity { 
    activity_ID: number,
    group_ID: number,
    name: string,
    date: Date | string,
    start_date: Date | string,
    end_date: Date | string,
    day: number,
    type: keyof typeof Assignments.activityColorMap,
    editor_ID: string,
    unit: string,
    company: string
}