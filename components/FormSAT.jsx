"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "./ui/table";
import { useSelector, useDispatch } from "react-redux";
import { satAdded, satDel } from "@/redux/slices/satData";
import { useState } from "react";
import FetchSat from "./FetchSat";
import Calc from "./Calc";

const FormSAT = () => {
  const [satNumber, setSatNumber] = useState("");
  const satellites = useSelector((state) => state.satDataReducer);

  const dispatch = useDispatch();

  const handleAddSatellite = () => {
    const newSatellite = {
      id: satNumber,
      name: "SatName",
      coords: ["0", "0"],
      tle: " ",
      height: "0",
    };
    dispatch(satAdded(newSatellite));
    setSatNumber("");
  };

  const handleDeleteSatellite = (id) => {
    dispatch(satDel({ id }));
  };

  return (
    <>
      <div className="mx-auto  ">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Satellite Number</h1>
          <p className="mt-2 text-gray-50  text-lg">
            View and manage your satellite numbers
          </p>
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <Input
            onChange={(e) => setSatNumber(e.target.value)}
            className="block w-1/2 border-gray-300 text-base p-2 rounded-md shadow-sm text-black"
            id="satellite-number"
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="X X X X X"
            required
            type="text"
            value={satNumber}
          />
          <Button
            onClick={handleAddSatellite}
            className="w-1/2 rounded-md  py-2 px-4 text-base font-medium text-white shadow-sm 
             bg-[#4c0519]  hover:bg-[#660924]"
            type="submit"
          >
            Add Satellite
          </Button>
        </div>

        <div className="pt-5 overflow-hidden text-white">
          <Table>
            <TableHeader className="border-0 text-white">
              <TableRow className="border-0 ">
                <TableHead>Sat Number</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(satellites).map((sat) => (
                <TableRow key={sat.id}>
                  <Calc satNum={sat.id} />
                  <FetchSat satNum={sat.id} />
                  <TableCell>{sat.id}</TableCell>
                  <TableCell className=" text-white">{sat.height} km</TableCell>
                  <TableCell>
                    {sat.coords[0]}, {sat.coords[1]}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleDeleteSatellite(sat.id)}
                        className="text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default FormSAT;
