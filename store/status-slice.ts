import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("status");
        if (!serializedState) return undefined;
        else return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};
const initialState: any = loadState() || {};

const statusSlice = createSlice({
    name: "status",
    initialState,
    reducers: {
        updateData: (state, action: PayloadAction<any>) => {
            return { ...state, ...action.payload };
        },
        clearData: (state) => initialState,
    },
});

export const statusActions = statusSlice.actions;
export default statusSlice;
