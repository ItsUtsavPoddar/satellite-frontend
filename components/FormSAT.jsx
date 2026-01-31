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

// Professional color palette - bold greys and industrial tones
const colors = [
  "#9CA3AF", // Grey 400
  "#6B7280", // Grey 500
  "#4B5563", // Grey 600
  "#374151", // Grey 700
  "#1F2937", // Grey 800
  "#60A5FA", // Blue 400
  "#3B82F6", // Blue 500
  "#2563EB", // Blue 600
  "#8B5CF6", // Purple 500
  "#6366F1", // Indigo 500
  "#10B981", // Emerald 500
  "#14B8A6", // Teal 500
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
      <div className="flex items-center gap-1.5 text-zinc-400">
        {sat?.isEclipsed ? (
          <>
            <span className="inline-block w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600"></span>
            <span className="font-medium">Eclipse</span>
          </>
        ) : (
          <>
            <span className="inline-block w-3 h-3 rounded-full bg-zinc-400 border border-zinc-300"></span>
            <span className="font-medium">Sunlit</span>
          </>
        )}
      </div>
      <div className="mt-1.5 text-[11px] sm:text-xs text-zinc-500">
        {nextTime ? (
          <>
            Next {sat?.isEclipsed ? "Sunrise" : "Sunset"}:
            <br />
            <span className="font-mono text-zinc-400">{countdown}</span>
          </>
        ) : (
          "No data"
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
      }),
    );
    setLatitude("");
    setLongitude("");
    setHeight("");
  };

  return (
    <div className="mx-auto bg-zinc-950 p-6 rounded-lg border border-zinc-800">
      {/* Header block */}
      <div className="space-y-3 mb-6">
        <p className="text-zinc-400 text-xs font-mono border-l-2 border-zinc-700 pl-3">
          Location: {user.coordinates.latitude.toFixed(4)}° /{" "}
          {user.coordinates.longitude.toFixed(4)}° / {user.coordinates.height}m
        </p>

        {/* Coordinate inputs */}
        <div className="flex justify-start items-center gap-2 border-l-2 border-zinc-700 pl-3">
          <Input
            onChange={(e) => setLatitude(e.target.value)}
            className="w-20 h-8 px-2 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 rounded"
            id="latitude"
            placeholder="Latitude"
            inputMode="decimal"
            type="number"
            value={latitude}
          />
          <Input
            onChange={(e) => setLongitude(e.target.value)}
            className="w-20 h-8 px-2 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 rounded"
            id="longitude"
            placeholder="Longitude"
            inputMode="decimal"
            type="number"
            value={longitude}
          />
          <Input
            onChange={(e) => setHeight(e.target.value)}
            className="w-20 h-8 px-2 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 rounded"
            id="height"
            placeholder="Height(m)"
            inputMode="decimal"
            type="number"
            value={height}
          />
          <Button
            onClick={handleUpdateCoordinates}
            className="h-8 px-3 text-xs text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700"
            type="button"
          >
            Update
          </Button>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight mb-1">
            TRACK SATELLITE
          </h2>
          <div className="text-zinc-500 text-xs mb-2">
            <MostSearchedSatellite />
          </div>
        </div>
      </div>

      {/* Add satellite */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddSatellite();
        }}
        className="mb-6 flex gap-2"
      >
        <Input
          onChange={(e) => setSatNumber(e.target.value)}
          className="block flex-1 bg-zinc-900 border-zinc-800 text-zinc-100 text-sm py-2 px-3 rounded"
          id="satellite-number"
          maxLength={5}
          pattern="[0-9]{5}"
          placeholder="NORAD ID (5 digits)"
          type="text"
          value={satNumber}
        />
        <Button
          type="submit"
          disabled={!isValidSat}
          className="rounded py-2 px-4 text-sm font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700"
        >
          Add
        </Button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <Table className="min-w-[600px] text-xs">
          <TableHeader className="border-b border-zinc-800">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-semibold uppercase tracking-wider">
                Satellite
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold uppercase tracking-wider">
                Stats
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold uppercase tracking-wider">
                Coordinates
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-zinc-400 font-semibold uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(satellites).map((sat) => (
              <TableRow
                key={sat.id}
                className="border-b border-zinc-900 hover:bg-zinc-900/50"
              >
                {/* Triggers calculations/data fetch */}
                <Calc satNum={sat.id} />
                <FetchSat satNum={sat.id} />

                <TableCell className="text-xs whitespace-nowrap align-top py-4">
                  <div className="font-mono text-zinc-500 text-[10px] mb-1">
                    [{sat.id}]
                  </div>
                  <div className="font-semibold text-zinc-200">{sat.name}</div>
                </TableCell>

                <TableCell className="text-zinc-300 text-xs whitespace-nowrap align-top py-4 font-mono">
                  <div className="space-y-0.5 text-[11px]">
                    <div>
                      <span className="text-zinc-500">ALT:</span> {sat.height}{" "}
                      km
                    </div>
                    <div>
                      <span className="text-zinc-500">AZI:</span> {sat.azimuth}°
                    </div>
                    <div>
                      <span className="text-zinc-500">ELE:</span>{" "}
                      {sat.elevation}°
                    </div>
                    <div>
                      <span className="text-zinc-500">DST:</span> {sat.rangeSat}{" "}
                      km
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-xs whitespace-nowrap align-top py-4">
                  <div className="font-mono text-zinc-400 text-[11px]">
                    {Number(sat.coords[1])?.toFixed(4)}°
                    <br />
                    {Number(sat.coords[0])?.toFixed(4)}°
                  </div>
                </TableCell>

                <SatelliteTableCell sat={sat} />

                <TableCell className="align-top py-4">
                  <div className="flex flex-col gap-2">
                    <Passes satelliteId={sat.id} />
                    <Button
                      onClick={() => handleDeleteSatellite(sat.id)}
                      className="text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-900 px-3 py-1.5 text-xs rounded transition-all"
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
