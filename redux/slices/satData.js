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
    isEclipsed: false,
    passes: [],
    riseSetTime: [],
    rangeSat: 0,
    azimuth: 0,
    elevation: 0,
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
      const { id, coords, height, azimuth, elevation, rangeSat } =
        action.payload;
      if (state[id]) {
        state[id].coords = coords;
        state[id].height = height;
        state[id].azimuth = azimuth;
        state[id].elevation = elevation;
        state[id].rangeSat = rangeSat;
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
    satPassesUpdated(state, action) {
      const { id, passes } = action.payload;
      if (state[id]) {
        state[id].passes = passes;
      }
    },
    satIsEclipsed(state, action) {
      const { id, isEclipsed } = action.payload;
      if (state[id]) {
        state[id].isEclipsed = isEclipsed;
      }
    },
    satRiseSetTimeUpdated(state, action) {
      const { id, riseSetTime } = action.payload;
      if (state[id]) {
        state[id].riseSetTime = riseSetTime;
      }
    },
  },
});
export const {
  satAdded,
  satCoordsUpdated,
  satDel,
  satFetchData,
  satPathUpdated,
  satPassesUpdated,
  satIsEclipsed,
  satRiseSetTimeUpdated,
} = satData.actions;
export default satData.reducer;
