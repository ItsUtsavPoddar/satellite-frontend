"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  coordinates: {
    latitude: 21,
    longitude: 84,
    height: 0.23,
  },
};

const userData = createSlice({
  name: "userData",
  initialState,
  reducers: {
    updateCoordinates: (state, action) => {
      const { latitude, longitude, height } = action.payload;
      state.coordinates.latitude = latitude;
      state.coordinates.longitude = longitude;
      state.coordinates.height = height;
    },
  },
});
export const { updateCoordinates } = userData.actions;
export default userData.reducer;
