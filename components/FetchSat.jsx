"use client";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useState, useEffect } from "react";
import { satFetchData } from "@/redux/slices/satData";

const FetchSat = ({ satNum }) => {
  const [satName, setSatName] = useState("");
  const [satTle, setSatTle] = useState("");

  const dispatch = useDispatch();

  const handleData = () => {
    const newSatellite = {
      id: satNum,
      name: satName,
      tle: satTle,
    };
    dispatch(satFetchData(newSatellite));
    setSatName("");
    setSatTle("");
  };

  const fetchData = async () => {
    try {
      const [tleResponse] = await Promise.all([
        axios.get(
          `https://satellite-backend-production.up.railway.app/${satNum}`
        ),
      ]);

      const tleData = tleResponse.data.tleString;
      console.log("TLE Data:", tleData);

      // Split the TLE string into lines
      const tleLines = tleData.split("\r\n").map((line) => line.trim());

      // the first line is the satellite name and the next two lines are the TLE lines
      const satName = tleLines[0];
      const tleLine1 = tleLines[1];
      const tleLine2 = tleLines[2];

      console.log("Satellite Name:", satName);
      console.log("TLE Line 1:", tleLine1);
      console.log("TLE Line 2:", tleLine2);

      setSatName(satName);
      setSatTle([tleLine1, tleLine2]);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (satName !== "" && satTle !== "") {
      handleData();
    }
  }, [satName, satTle]);
  return;
};

export default FetchSat;
