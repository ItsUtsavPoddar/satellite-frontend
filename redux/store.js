"use client";

import { configureStore } from "@reduxjs/toolkit";
import satDataReducer from "./slices/satData";
export const makeStore = () => {
  return configureStore({
    reducer: { satDataReducer },
  });
};
