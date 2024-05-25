"use client";
import FormSAT from "./FormSAT";
import LeafMap from "./LeafMap";

const Main = () => {
  return (
    <>
      <div className=" w-full p-3 pt-20 pb-10 justify-items-stretch gap-4 grid grid-cols-1 lg:grid-cols-5 sm:items-center">
        <div className=" z-0 col-start-1 col-end-2 lg:col-start-1 lg:col-end-4 ">
          <LeafMap />
        </div>
        <div className=" flex py-5 order-1 lg:col-start-4 lg:col-end-6 ">
          <FormSAT />
        </div>
      </div>
    </>
  );
};

export default Main;
