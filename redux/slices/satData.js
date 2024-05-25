"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const satData = createSlice({
  name: "satData",
  initialState,
  reducers: {
    satAdded(state, action) {
      const { id } = action.payload;
      state[id] = action.payload;
    },
    satFetchData(state, action) {
      const { id, name, tle } = action.payload;
      if (state[id]) {
        state[id].tle = tle;
        state[id].name = name;
      }
    },
    satCoordsUpdated(state, action) {
      const { id, coords, height } = action.payload;
      if (state[id]) {
        state[id].coords = coords;
        state[id].height = height;
      }
    },
    satDel(state, action) {
      const { id } = action.payload;
      delete state[id];
    },
  },
});
export const { satAdded, satCoordsUpdated, satDel, satFetchData } =
  satData.actions;
export default satData.reducer;
