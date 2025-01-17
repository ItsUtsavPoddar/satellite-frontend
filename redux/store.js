"use client";

import { configureStore } from "@reduxjs/toolkit";
import satDataReducer from "./slices/satData";
import userDataReducer from "./slices/userData";
export const makeStore = () => {
  return configureStore({
    reducer: { satDataReducer, userDataReducer },
  });
};
