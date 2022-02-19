import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BasicPersonnel, Personnel } from "../types/database";
import {
    DashboardState,
    EventData,
    PersonnelImportState,
    PersonnelState,
} from "../types/types";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("personnel");
        if (!serializedState) return undefined;
        else return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};
const initialState: PersonnelState = loadState() || {
    import: {},
};

const personnelSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setState(state, action: PayloadAction<PersonnelImportState>) {
            state.import = action.payload;
        },
        clearImport(state) {
            state.import = { excel: [], googleSheets: [] };
        },
    },
});

export const personnelActions = personnelSlice.actions;
export default personnelSlice;
