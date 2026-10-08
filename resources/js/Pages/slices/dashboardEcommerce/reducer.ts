import { createSlice } from "@reduxjs/toolkit";
export const initialState : any = {
  revenueData: [],
  error: {}
};
const DashboardKirtanSlice = createSlice({
  name: 'DashboardKirtan',
  initialState,
  reducers: {
    getRevenueChartsData: (state:any, action:any) => {
      state.revenueData = action.payload;
    },
  },
});
export const {getRevenueChartsData} = DashboardKirtanSlice.actions;
export default DashboardKirtanSlice.reducer;