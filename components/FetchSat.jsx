"use client";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useState, useEffect } from "react";
import { satFetchData } from "@/redux/slices/satData";
import { satDel } from "@/redux/slices/satData";
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
          `https://satellite-backend-lo09.onrender.com/${satNum}`
        ),
      ]);

      const tleData = tleResponse.data.tleString;
      if (!tleData) {
        throw new Error("TLE data is missing");
      }
      // Split the TLE string into lines
      const tleLines = tleData.split("\r\n").map((line) => line.trim());

      if (tleLines.length < 3) {
        throw new Error("Incomplete TLE data");
      }
      // the first line is the satellite name and the next two lines are the TLE lines
      const satName = tleLines[0];
      const tleLine1 = tleLines[1];
      const tleLine2 = tleLines[2];

      setSatName(satName);
      setSatTle([tleLine1, tleLine2]);
    } catch (error) {
      console.error("Error fetching data:", error);
      dispatch(satDel({ id: satNum }));
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
