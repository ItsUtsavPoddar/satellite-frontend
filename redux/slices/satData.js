"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  25544: {
    id: 25544,
    name: "SatName",
    coords: ["0", "0"],
    tle: " ",
    height: "0",
    path: [
      [[], []],
      [[], []],
    ],
    color: "#FF003F",
  },
};

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
    satPathUpdated(state, action) {
      const { id, path } = action.payload;
      if (state[id]) {
        state[id].path = path;
      }
    },
    satDel(state, action) {
      const { id } = action.payload;
      delete state[id];
    },
  },
});
export const {
  satAdded,
  satCoordsUpdated,
  satDel,
  satFetchData,
  satPathUpdated,
} = satData.actions;
export default satData.reducer;
