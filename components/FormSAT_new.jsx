"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSelector, useDispatch } from "react-redux";
import { satAdded, satDel } from "@/redux/slices/satData";
import { updateCoordinates } from "@/redux/slices/userData";
import FetchSat from "./FetchSat";
import Calc from "./Calc";
import { Passes } from "@/components/Passes";
import MostSearchedSatellite from "./MostSearchedSatellite";
import {
  Satellite,
  Trash2,
  Plus,
  MapPin,
  Eye,
  Sun,
  Moon,
  ArrowUp,
  Orbit,
  Ruler,
} from "lucide-react";

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

// Satellite Card Component
const SatelliteCard = ({ sat, onDelete }) => {
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
      setCountdown(next ? getCountdown(next.time) : "No upcoming");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sat?.riseSetTime]);

  return (
    <>
      <Calc satNum={sat.id} />
      <FetchSat satNum={sat.id} />

      <div className="relative group">
        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl hover:border-zinc-700 transition-all duration-300">
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-11 h-11 rounded border-2 flex items-center justify-center shrink-0 bg-zinc-950"
                style={{ borderColor: sat.color }}
              >
                <Satellite className="w-5 h-5" style={{ color: sat.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-white font-bold text-base tracking-tight truncate"
                  title={sat.name}
                >
                  {sat.name}
                </h3>
                <p className="text-zinc-500 text-xs font-mono">
                  NORAD {sat.id}
                </p>
              </div>
            </div>

            {/* Eclipse Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold tracking-wide uppercase shrink-0 ${
                sat.isEclipsed
                  ? "bg-zinc-950 text-zinc-400 border-zinc-700"
                  : "bg-zinc-950 text-zinc-300 border-zinc-600"
              }`}
            >
              {sat.isEclipsed ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {sat.isEclipsed ? "Eclipse" : "Sunlit"}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 px-5 pb-5">
            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5 font-medium uppercase tracking-wide">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Altitude</span>
              </div>
              <div className="text-zinc-100 font-bold text-base">
                {sat.height} km
              </div>
            </div>

            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5 font-medium uppercase tracking-wide">
                <Orbit className="w-3.5 h-3.5" />
                <span>Azimuth</span>
              </div>
              <div className="text-zinc-100 font-bold text-base">
                {sat.azimuth}°
              </div>
            </div>

            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5 font-medium uppercase tracking-wide">
                <Eye className="w-3.5 h-3.5" />
                <span>Elevation</span>
              </div>
              <div className="text-zinc-100 font-bold text-base">
                {sat.elevation}°
              </div>
            </div>

            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5 font-medium uppercase tracking-wide">
                <Ruler className="w-3.5 h-3.5" />
                <span>Distance</span>
              </div>
              <div className="text-zinc-100 font-bold text-base">
                {sat.rangeSat} km
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-3">
            {/* Coordinates */}
            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5 font-medium uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5" />
                <span>Position</span>
              </div>
              <div className="text-zinc-100 text-sm font-mono font-semibold">
                {sat.coords[1]?.toFixed(4)}°, {sat.coords[0]?.toFixed(4)}°
              </div>
            </div>

            {/* Next Event Countdown */}
            {nextTime && (
              <div className="bg-zinc-950 border border-zinc-700 rounded p-3">
                <div className="text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wide">
                  Next {sat.isEclipsed ? "Sunrise" : "Sunset"}
                </div>
                <div className="text-zinc-100 font-bold text-lg font-mono">
                  {countdown}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Passes satelliteId={sat.id} />
              <Button
                onClick={() => onDelete(sat.id)}
                variant="ghost"
                size="sm"
                className="bg-zinc-950 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
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
      name: "Loading...",
      coords: [0, 0],
      tle: " ",
      height: "0",
      path: [],
      color,
      isEclipsed: false,
      passes: [],
      riseSetTime: [],
      rangeSat: 0,
      azimuth: 0,
      elevation: 0,
    };
    dispatch(satAdded(newSatellite));
    setSatNumber("");
  };

  const handleDeleteSatellite = (id) => {
    dispatch(satDel({ id }));
  };

  const handleUpdateCoordinates = () => {
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Satellite className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Satellite Tracker
          </h1>
        </div>

        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Track satellites in real-time and view orbital predictions
        </p>

        {/* User Location Display */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-white/10 text-xs text-gray-300">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>
            {user.coordinates.latitude.toFixed(4)}°,{" "}
            {user.coordinates.longitude.toFixed(4)}°
            {user.coordinates.height > 0 && ` • ${user.coordinates.height}km`}
          </span>
        </div>

        {/* Update Coordinates */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          <Input
            onChange={(e) => setLatitude(e.target.value)}
            className="w-24 h-9 text-center bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500"
            placeholder="Lat"
            type="number"
            step="any"
            value={latitude}
          />
          <Input
            onChange={(e) => setLongitude(e.target.value)}
            className="w-24 h-9 text-center bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500"
            placeholder="Lng"
            type="number"
            step="any"
            value={longitude}
          />
          <Input
            onChange={(e) => setHeight(e.target.value)}
            className="w-24 h-9 text-center bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500"
            placeholder="Alt (km)"
            type="number"
            step="any"
            value={height}
          />
          <Button
            onClick={handleUpdateCoordinates}
            className="h-9 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            Update
          </Button>
        </div>
      </div>

      {/* Most Searched */}
      <div className="text-center">
        <div className="inline-block">
          <MostSearchedSatellite />
        </div>
      </div>

      {/* Add Satellite Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddSatellite();
        }}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <Input
          onChange={(e) => setSatNumber(e.target.value)}
          className="flex-1 h-11 bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 text-center font-mono"
          maxLength={5}
          pattern="[0-9]{5}"
          placeholder="Enter NORAD ID (e.g., 25544)"
          type="text"
          value={satNumber}
        />
        <Button
          type="submit"
          disabled={!isValidSat}
          className="h-11 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Satellite
        </Button>
      </form>

      {/* Satellites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.values(satellites).map((sat) => (
          <SatelliteCard
            key={sat.id}
            sat={sat}
            onDelete={handleDeleteSatellite}
          />
        ))}
      </div>

      {Object.values(satellites).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Satellite className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No satellites tracked yet</p>
          <p className="text-sm mt-2">
            Add a satellite using its NORAD ID above
          </p>
        </div>
      )}
    </div>
  );
};

export default FormSAT;
