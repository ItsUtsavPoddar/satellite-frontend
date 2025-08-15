"use client";

import React, { useEffect, useState } from "react";
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
import { updateCoordinates } from "@/redux/slices/userData";
import FetchSat from "./FetchSat";
import Calc from "./Calc";
import { Passes } from "@/components/Passes";
import MostSearchedSatellite from "./MostSearchedSatellite";

// Color helpers
const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#33FFF2",
  "#F2FF33",
  "#FF8C00",
  "#FFD700",
  "#ADFF2F",
  "#00FF7F",
  "#20B2AA",
  "#00CED1",
  "#1E90FF",
  "#BA55D3",
  "#FF69B4",
  "#FF4500",
  "#32CD32",
  "#FFDAB9",
  "#8A2BE2",
  "#DC143C",
  "#4B0082",
  "#8B0000",
  "#00FA9A",
  "#4169E1",
];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

// Sunrise/Sunset helpers
const getNextRiseSetTime = (riseSetTimes = []) => {
  const now = new Date();
  return riseSetTimes.find((t) => new Date(t.time) > now) || null;
};
const getCountdown = (targetTime) => {
  if (!targetTime) return "";
  const now = new Date();
  const diff = new Date(targetTime) - now;
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
};

// Small status cell with live countdown (compact for mobile)
const SatelliteTableCell = ({ sat }) => {
  const [countdown, setCountdown] = useState("");
  const [nextTime, setNextTime] = useState(null);

  useEffect(() => {
    if (!sat?.riseSetTime?.length) {
      setCountdown("No Data");
      setNextTime(null);
      return;
    }
    const tick = () => {
      const next = getNextRiseSetTime(sat.riseSetTime);
      setNextTime(next);
      setCountdown(next ? getCountdown(next.time) : "No upcoming transitions");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sat?.riseSetTime]);

  return (
    <TableCell className="text-[11px] sm:text-xs whitespace-nowrap align-top">
      <div className="flex items-center gap-1.5">
        {sat?.isEclipsed ? (
          <>
            <svg
              className="w-4 h-4 text-blue-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 13 16.5 13C13.47 13 11 10.53 11 7.5C11 5.68 11.99 4.08 13.36 3.1C12.92 3.04 12.46 3 12 3Z" />
            </svg>
            <span>Darkness</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 text-yellow-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c.39.39 1.03.39 1.41 0l1.06-1.06z" />
            </svg>
            <span>Sunlight</span>
          </>
        )}
      </div>
      <div className="mt-1 text-[11px] sm:text-xs">
        {nextTime ? (
          <>
            Next {sat?.isEclipsed ? "Sunrise" : "Sunset"}:
            <br />
            {countdown}
          </>
        ) : (
          "No upcoming transitions"
        )}
      </div>
    </TableCell>
  );
};

const FormSAT = () => {
  const [satNumber, setSatNumber] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [height, setHeight] = useState("");
  const satellites = useSelector((state) => state.satDataReducer);
  const user = useSelector((state) => state.userDataReducer);
  const dispatch = useDispatch();

  const isValidSat = /^[0-9]{5}$/.test(satNumber);

  const handleAddSatellite = () => {
    if (!isValidSat) return;
    const color = getRandomColor();
    const newSatellite = {
      id: satNumber,
      name: "SatName",
      coords: ["0", "0"],
      tle: " ",
      height: "0",
      path: [
        [[], []],
        [[], []],
      ],
      color,
    };
    dispatch(satAdded(newSatellite));
    setSatNumber("");
  };

  const handleDeleteSatellite = (id) => {
    dispatch(satDel({ id }));
  };

  const handleUpdateCoordinates = () => {
    // Only update if any field provided (prevents NaN on empty)
    const hasAny =
      latitude.trim() !== "" || longitude.trim() !== "" || height.trim() !== "";
    if (!hasAny) return;

    dispatch(
      updateCoordinates({
        latitude:
          latitude.trim() === ""
            ? user.coordinates.latitude
            : parseFloat(latitude),
        longitude:
          longitude.trim() === ""
            ? user.coordinates.longitude
            : parseFloat(longitude),
        height:
          height.trim() === "" ? user.coordinates.height : parseFloat(height),
      })
    );
    setLatitude("");
    setLongitude("");
    setHeight("");
  };

  return (
    <div className="mx-auto">
      {/* Header block */}
      <div className="text-center space-y-2 sm:space-y-3">
        <p className="text-orange-300 text-[11px] sm:text-sm">
          User Position: Lat = {user.coordinates.latitude} Long ={" "}
          {user.coordinates.longitude} Height = {user.coordinates.height} km
        </p>

        {/* Compact coordinate inputs */}
        <div className="mt-1 sm:mt-2 mb-4 sm:mb-6 flex justify-center items-center gap-1.5">
          <Input
            onChange={(e) => setLatitude(e.target.value)}
            className="w-16 h-7 px-1 text-[11px] text-black rounded-sm"
            id="latitude"
            placeholder="Lat"
            inputMode="decimal"
            type="number"
            value={latitude}
          />
          <Input
            onChange={(e) => setLongitude(e.target.value)}
            className="w-16 h-7 px-1 text-[11px] text-black rounded-sm"
            id="longitude"
            placeholder="Long"
            inputMode="decimal"
            type="number"
            value={longitude}
          />
          <Input
            onChange={(e) => setHeight(e.target.value)}
            className="w-16 h-7 px-1 text-[11px] text-black rounded-sm"
            id="height"
            placeholder="Alt(km)"
            inputMode="decimal"
            type="number"
            value={height}
          />
          <Button
            onClick={handleUpdateCoordinates}
            className="h-7 px-2 text-[11px] sm:text-xs text-white bg-[#4c0519] hover:bg-[#660924] rounded-sm"
            type="button"
          >
            Update
          </Button>
        </div>

        <h1 className="text-xl sm:text-3xl font-bold pb-1 sm:pb-2">
          Satellite Number
        </h1>
        <div className="text-cyan-300 text-[11px] sm:text-sm">
          <MostSearchedSatellite />
        </div>
        <p className="mt-1 sm:mt-2 text-gray-50 text-xs sm:text-sm">
          View and manage your satellite numbers
        </p>
      </div>

      {/* Add satellite */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddSatellite();
        }}
        className="mt-2 flex justify-center gap-2"
      >
        <Input
          onChange={(e) => setSatNumber(e.target.value)}
          className="block w-40 sm:w-56 border-gray-300 text-sm sm:text-base py-1.5 px-2 rounded-md shadow-sm text-black"
          id="satellite-number"
          maxLength={5}
          pattern="[0-9]{5}"
          placeholder="X X X X X"
          type="text"
          value={satNumber}
        />
        <Button
          type="submit"
          disabled={!isValidSat}
          className="w-auto rounded-md py-1.5 px-3 text-sm sm:text-base font-medium text-white shadow-sm bg-[#4c0519] hover:bg-[#660924] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Add Satellite
        </Button>
      </form>

      {/* Table (scrolls horizontally on small screens) */}
      <div className="pt-4 sm:pt-5 overflow-x-auto text-white -mx-2 sm:mx-0">
        <Table className="min-w-[560px] text-[11px] sm:text-sm">
          <TableHeader className="border-0 text-white text-[11px] sm:text-sm">
            <TableRow className="border-0">
              <TableHead className="whitespace-nowrap">Satellite</TableHead>
              <TableHead className="whitespace-nowrap">Stats</TableHead>
              <TableHead className="whitespace-nowrap">Coordinates</TableHead>
              <TableHead className="whitespace-nowrap">isIlluminated</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(satellites).map((sat) => (
              <TableRow key={sat.id}>
                {/* Triggers calculations/data fetch */}
                <Calc satNum={sat.id} />
                <FetchSat satNum={sat.id} />

                <TableCell className="text-[11px] sm:text-sm whitespace-nowrap align-top">
                  [{sat.id}]
                  <br />
                  {sat.name}
                </TableCell>

                <TableCell className="text-white text-[11px] sm:text-xs whitespace-nowrap align-top">
                  Height: {sat.height} km
                  <br /> Azimuth: {sat.azimuth}°
                  <br /> Elevation: {sat.elevation}°
                  <br />
                  Dist_2_Sat: {sat.rangeSat} km
                </TableCell>

                <TableCell className="text-[11px] sm:text-xs whitespace-nowrap align-top">
                  {sat.coords[0]}, {sat.coords[1]}
                </TableCell>

                <SatelliteTableCell sat={sat} />

                <TableCell className="align-top">
                  <div className="flex items-center gap-2 -m-1.5">
                    <Passes satelliteId={sat.id} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 -m-1.5">
                    <Button
                      onClick={() => handleDeleteSatellite(sat.id)}
                      className="text-white bg-[#24050e] hover:bg-[#2d0a14] px-2 py-1 text-[11px] sm:text-xs"
                      type="button"
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
  );
};

export default FormSAT;
