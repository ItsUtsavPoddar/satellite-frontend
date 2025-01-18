"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sunCoords: {
    latitude: 0,
    longitude: 0,
  },
};

const sunData = createSlice({
  name: "sunData",
  initialState,
  reducers: {
    sunCoords: (state, action) => {
      const { latitude, longitude } = action.payload;
      state.sunCoords.latitude = latitude;
      state.sunCoords.longitude = longitude;
    },
  },
});
export const { sunCoords } = sunData.actions;
export default sunData.reducer;
