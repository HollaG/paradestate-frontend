import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "../types/types";
import dashboardSlice from "./dashboard-slice";


const saveState = (state: RootState) => {
    try {
        const serializedState = JSON.stringify(state.dashboard);
        localStorage.setItem("dashboard", serializedState);
    } catch (err) {
        console.log(err);
    }
};
const store = configureStore({
    reducer: {       
        dashboard: dashboardSlice.reducer
    }
})

store.subscribe(() => saveState(store.getState()))
export default store