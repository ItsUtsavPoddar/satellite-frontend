"use client";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useState, useEffect } from "react";
import { satFetchData } from "@/redux/slices/satData";
import { satDel } from "@/redux/slices/satData";
import { toast } from "sonner";
const satellite = require("satellite.js");
const FetchSat = ({ satNum }) => {
  const [satName, setSatName] = useState("");
  const [satTle, setSatTle] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  const dispatch = useDispatch();

  const handleData = (epochDate) => {
    const newSatellite = {
      id: satNum,
      name: satName,
      tle: satTle,
      epochDate: epochDate, // Store the TLE epoch date
    };
    dispatch(satFetchData(newSatellite));
    setSatName("");
    setSatTle("");
  };

  const fetchData = async () => {
    // Prevent double-fetch in React Strict Mode
    if (hasFetched) return;
    setHasFetched(true);

    try {
      const [tleResponse] = await Promise.all([
        axios.get(`http://localhost:8081/${satNum}`),
      ]);

      const tleData = tleResponse.data.tleString;
      if (!tleData) {
        throw new Error("TLE data is missing");
      }

      console.log("Raw TLE data:", tleData);
      console.log("TLE data length:", tleData.length);

      // Split the TLE string into lines and filter out empty lines
      const tleLines = tleData
        .split(/\r?\n/) // Handle both \r\n and \n
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      console.log("Parsed lines:", tleLines);
      console.log("Number of lines:", tleLines.length);

      if (tleLines.length < 3) {
        throw new Error("Incomplete TLE data");
      }
      // the first line is the satellite name and the next two lines are the TLE lines
      const satName = tleLines[0];
      const tleLine1 = tleLines[1];
      const tleLine2 = tleLines[2];

      console.log("Parsed TLE:", { satName, tleLine1, tleLine2 });

      // Validate TLE by attempting to parse it
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      if (satrec.error) {
        toast.error(`Invalid TLE data for ${satName}`, {
          description: "TLE format is incorrect",
        });
        dispatch(satDel({ id: satNum }));
        return;
      }

      // Extract epoch date from TLE line 1
      // Format: YYDDD.DDDDDDDD (columns 18-32)
      const epochYearStr = tleLine1.substring(18, 20);
      const epochDayStr = tleLine1.substring(20, 32);
      const epochYear =
        parseInt(epochYearStr) < 57
          ? 2000 + parseInt(epochYearStr)
          : 1900 + parseInt(epochYearStr);
      const epochDay = parseFloat(epochDayStr);

      // Convert to JavaScript Date with fractional day
      const epochDate = new Date(Date.UTC(epochYear, 0, 1)); // Jan 1 of that year
      const msPerDay = 24 * 60 * 60 * 1000;
      epochDate.setTime(epochDate.getTime() + (epochDay - 1) * msPerDay);

      console.log("TLE Epoch Date:", epochDate.toISOString());

      // Test propagation - try both current date and epoch date
      const currentDate = new Date();
      let positionAndVelocity = satellite.propagate(satrec, currentDate);
      console.log("Current date propagation result:", positionAndVelocity);

      // Check if position is valid (not false, not undefined, and has x/y/z coordinates)
      const canPropagate =
        positionAndVelocity.position &&
        positionAndVelocity.position !== false &&
        typeof positionAndVelocity.position === "object" &&
        positionAndVelocity.position.x !== undefined;

      // Reject if current date propagation fails - no epoch date fallback for validation
      if (!canPropagate) {
        console.log("Current date propagation failed - rejecting satellite");
        toast.error(`Cannot visualize ${satName}`, {
          description: `Orbital decay is too extreme to calculate current position. Try an active satellite.`,
          duration: 5000,
        });
        dispatch(satDel({ id: satNum }));
        return;
      }

      setSatName(satName);
      setSatTle([tleLine1, tleLine2, epochDate.toISOString()]);
    } catch (error) {
      // Reset flag on error so it can retry
      setHasFetched(false);

      if (error.response?.status === 404) {
        toast.error(`Satellite ${satNum} not found`, {
          description: "Please check the NORAD ID",
        });
      } else {
        toast.error("Failed to fetch satellite data", {
          description: error.message || "Unknown error",
        });
      }
      dispatch(satDel({ id: satNum }));
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (satName !== "" && satTle !== "") {
      const epochDate = satTle[2]; // Extract epoch date from TLE array
      handleData(epochDate);
    }
  }, [satName, satTle]);
  return;
};

export default FetchSat;
