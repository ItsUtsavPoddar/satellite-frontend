"use client";
import FormSAT from "./FormSAT";
// import LeafMap from "./LeafMap";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Main = () => {
  const LeafMap = useMemo(
    () =>
      dynamic(() => import("./LeafMap"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );
  return (
      <div className="pt-20 pb-10 justify-center pr-0 gap-4 grid grid-cols-1 lg:grid-cols-5 sm:items-center">
        <div className=" z-0 col-start-1 col-end-2 lg:col-start-1 lg:col-end-4 ">
          <LeafMap />
        </div>
        <div
          className=" flex py-5 order-1 lg:col-start-4 lg:col-end-6 overflow-x-auto
        m-0 "
        >
          <FormSAT />
        </div>
      </div>
  );
};

export default Main;
