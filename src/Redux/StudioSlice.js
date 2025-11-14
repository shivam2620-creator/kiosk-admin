import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    loading: false,
    studioData: []
};

const studioSlice = createSlice({
    name: "studio",
    initialState,
    reducers: {
        setStudioData: (state, action) => {
            state.studioData = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
         clearStudios(state) {
      state.studioData = [];
    }
        

    },
});

export const { clearStudios,setStudioData,setLoading } = studioSlice.actions;

export default studioSlice.reducer;