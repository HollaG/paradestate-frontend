import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StatusOption } from "../pages/personnel/manage/status";
import { Personnel } from "../types/database";
import { StatusState } from "../types/types";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("status");
        if (!serializedState) return undefined;
        else return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};
const initialState: StatusState = loadState() || {};

const statusSlice = createSlice({
    name: "status",
    initialState,
    reducers: {
        // deleteEntry: (state, action: PayloadAction<number>) => {
        //     const personnel_ID = action.payload;
        //     const tempSortedByPlatoon = { ...state.sortedByPlatoon };
        //     let totalLength = 0;
        //     Object.keys(tempSortedByPlatoon).forEach((platoon) => {
        //         const filteredPlatoon = tempSortedByPlatoon[platoon].filter(
        //             (person) => person.personnel_ID !== personnel_ID
        //         );
        //         totalLength = totalLength + filteredPlatoon.length;
        //         if (!filteredPlatoon.length)
        //             delete tempSortedByPlatoon[platoon];
        //         else tempSortedByPlatoon[platoon] = filteredPlatoon;
        //     });
        //     if (totalLength === 0) {
        //         return { ...state, sortedByPlatoon: {} };
        //     } else {
        //         return { ...state, sortedByPlatoon: tempSortedByPlatoon };
        //     }
        // },
        // deleteSelectedStatus: (state, action: PayloadAction<string>) => {
        //     return {
        //         ...state,
        //         statuses: state.statuses.filter(
        //             (status) => status.value !== action.payload
        //         ),
        //     };
        // },
        deleteEntry: (state, action: PayloadAction<number>) => {
            // Remove this person from personnelMap and sortedByPlatoon
            const personnel_ID = action.payload;
            const tempSortedByPlatoon = { ...state.sortedByPlatoon };
            let totalLength = 0;
            Object.keys(tempSortedByPlatoon).forEach((platoon) => {
                const filteredPlatoon = tempSortedByPlatoon[platoon].filter(
                    (person) => person.personnel_ID !== personnel_ID
                );
                totalLength = totalLength + filteredPlatoon.length;
                if (!filteredPlatoon.length)
                    delete tempSortedByPlatoon[platoon];
                else tempSortedByPlatoon[platoon] = filteredPlatoon;
            });

            const tempPersonnelMap = { ...state.personnelMap };
            delete tempPersonnelMap[personnel_ID];
            if (totalLength === 0) {
                return { ...state, sortedByPlatoon: {}, personnelMap: tempPersonnelMap };
            } else {
                return { ...state, sortedByPlatoon: tempSortedByPlatoon, personnelMap: tempPersonnelMap };
            }
        },
        updateData: (state, action: PayloadAction<any>) => {
            return { ...state, ...action.payload };
        },
        clearData: (state) => initialState,
    },
});

export const statusActions = statusSlice.actions;
export default statusSlice;
