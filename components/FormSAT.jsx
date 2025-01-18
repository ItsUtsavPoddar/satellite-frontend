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
import { updateCoordinates } from "@/redux/slices/userData";
import { useState, useEffect } from "react";
import FetchSat from "./FetchSat";
import Calc from "./Calc";
import React from "react";
import { Passes } from "@/components/Passes";

import MostSearchedSatellite from "./MostSearchedSatellite";

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

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

const getNextRiseSetTime = (riseSetTimes) => {
  const now = new Date();
  return riseSetTimes.find((time) => new Date(time.time) > now);
};

const getCountdown = (targetTime) => {
  const now = new Date();
  const diff = new Date(targetTime) - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
};
const SatelliteTableCell = ({ sat }) => {
  const [countdown, setCountdown] = useState("");
  const [nextTime, setNextTime] = useState(null);

  useEffect(() => {
    if (!sat || !sat.riseSetTime) return;

    const updateNextTime = () => {
      const next = getNextRiseSetTime(sat.riseSetTime);
      setNextTime(next);
      if (next) {
        setCountdown(getCountdown(next.time));
      } else {
        setCountdown("No upcoming transitions");
      }
    };

    updateNextTime();

    const intervalId = setInterval(() => {
      if (nextTime && new Date(nextTime.time) <= new Date()) {
        updateNextTime();
      } else if (nextTime) {
        setCountdown(getCountdown(nextTime.time));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sat.riseSetTime, nextTime]);

  return (
    <TableCell>
      <div className="flex items-center gap-2">
        {sat.isEclipsed ? (
          <>
            <svg
              className="w-5 h-5 text-blue-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 13 16.5 13C13.47 13 11 10.53 11 7.5C11 5.68 11.99 4.08 13.36 3.1C12.92 3.04 12.46 3 12 3Z" />
            </svg>
            <span>In Darkness</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 text-yellow-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
            </svg>
            <span>In Sunlight</span>
          </>
        )}
      </div>
      <br />
      <br />
      {sat.riseSetTime && sat.riseSetTime.length > 0 ? (
        <>
          {(() => {
            const nextTime = getNextRiseSetTime(sat.riseSetTime);
            if (nextTime) {
              return (
                <div className="text-xs">
                  Next {sat.isEclipsed ? "Sunrise" : "Sunset"}:
                  <br />
                  {countdown}
                </div>
              );
            } else {
              return "No upcoming transitions";
            }
          })()}
        </>
      ) : (
        "No Data"
      )}
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

  const handleAddSatellite = () => {
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
      color: color,
    };
    dispatch(satAdded(newSatellite));
    setSatNumber("");
  };

  const handleDeleteSatellite = (id) => {
    dispatch(satDel({ id }));
  };

  const handleUpdateCoordinates = () => {
    dispatch(
      updateCoordinates({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        height: parseFloat(height),
      })
    );
    setLatitude("");
    setLongitude("");
    setHeight("");
  };
  return (
    <>
      <div className="mx-auto  ">
        <div className="text-center">
          <p className="text-orange-400 text-sm ">
            User Position: Lat = {user.coordinates.latitude} Long ={" "}
            {user.coordinates.longitude} Height = {user.coordinates.height} km
          </p>
          <div className="mt-2 mb-6 flex justify-center items-center gap-1">
            <Input
              onChange={(e) => setLatitude(e.target.value)}
              className="w-16 h-6 p-0.5 text-xs text-black rounded-sm"
              id="latitude"
              placeholder="Lat"
              required
              type="number"
              value={latitude}
            />
            <Input
              onChange={(e) => setLongitude(e.target.value)}
              className="w-16 h-6 p-0.5 text-xs text-black rounded-sm"
              id="longitude"
              placeholder="Long"
              required
              type="number"
              value={longitude}
            />
            <Input
              onChange={(e) => setHeight(e.target.value)}
              className="w-16 h-6 p-0.5 text-xs text-black rounded-sm"
              id="height"
              placeholder="Alt(km)"
              required
              type="number"
              value={height}
            />
            <Button
              onClick={handleUpdateCoordinates}
              className="h-6 px-1.5 text-xs text-white bg-[#4c0519] hover:bg-[#660924] rounded-sm"
              type="submit"
            >
              Update
            </Button>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold pb-2">
            Satellite Number
          </h1>
          <div className="text-cyan-300">
            <MostSearchedSatellite />
          </div>
          <p className="mt-2 text-gray-50  text-lg">
            View and manage your satellite numbers
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSatellite();
          }}
          className="mt-2 flex justify-center space-x-2"
        >
          <Input
            onChange={(e) => setSatNumber(e.target.value)}
            className="block w-1/3 border-gray-300 text-base p-2 rounded-md shadow-sm text-black"
            id="satellite-number"
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="X X X X X"
            required
            type="text"
            value={satNumber}
          />
          <Button
            type="submit"
            className="w-1/3 rounded-md py-2 px-4 text-base font-medium text-white shadow-sm bg-[#4c0519] hover:bg-[#660924]"
          >
            Add Satellite
          </Button>
        </form>

        <div className="pt-5 overflow-hidden text-white">
          <Table>
            <TableHeader className="border-0 text-white">
              <TableRow className="border-0 ">
                <TableHead>Satellite</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>isIlluminated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(satellites).map((sat) => (
                <TableRow key={sat.id}>
                  <Calc satNum={sat.id} />
                  <FetchSat satNum={sat.id} />
                  <TableCell>
                    [{sat.id}]
                    <br />
                    {sat.name}
                  </TableCell>
                  <TableCell className=" text-white text-xs">
                    Height: {sat.height} km <br /> Azimuth: {sat.azimuth}°
                    <br /> Elevation: {sat.elevation}° <br />
                    Dist_2_Sat: {sat.rangeSat} km
                  </TableCell>
                  <TableCell>
                    {sat.coords[0]}, {sat.coords[1]}
                  </TableCell>
                  <SatelliteTableCell sat={sat} />

                  <TableCell>
                    <div className="flex items-center space-x-2 -m-1.5">
                      <Passes satelliteId={sat.id} />
                    </div>
                    <br />
                    <div className="flex items-center space-x-2 -m-1.5 ">
                      <Button
                        onClick={() => handleDeleteSatellite(sat.id)}
                        className="text-white bg-[#24050e]  hover:bg-[#2d0a14]"
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
