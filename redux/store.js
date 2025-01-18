"use client";

import { configureStore } from "@reduxjs/toolkit";
import satDataReducer from "./slices/satData";
import userDataReducer from "./slices/userData";
import sunDataReducer from "./slices/sunData";
export const makeStore = () => {
  return configureStore({
    reducer: { satDataReducer, userDataReducer, sunDataReducer },
  });
};
