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
    satCoordsUpdated(state, action) {
      const { id, name, coords } = action.payload;
      if (state[id]) {
        state[id].coords = coords;
        state[id].name = name;
      }
    },
    satDel(state, action) {
      const { id } = action.payload;
      delete state[id];
    },
  },
});
export const { satAdded, satCoordsUpdated, satDel } = satData.actions;
export default satData.reducer;
