import { createSlice } from "@reduxjs/toolkit";



const initialState = {
    calendarData : [],
    loading: false
}

const calendarSlice = createSlice({
    name : "calendar",
    initialState,
    reducers : {
        setCalendarData : (state,action) => {
               state.calendarData = action.payload 
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
})


export const {setCalendarData, setLoading} = calendarSlice.actions;

export default calendarSlice.reducer;

