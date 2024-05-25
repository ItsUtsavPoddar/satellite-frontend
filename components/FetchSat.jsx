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
      const [tleResponse, nameResponse] = await Promise.all([
        axios.get("https://celestrak.org/NORAD/elements/gp.php", {
          params: {
            CATNR: satNum,
            FORMAT: "2le",
          },
        }),
        axios.get("https://celestrak.org/NORAD/elements/gp.php", {
          params: {
            CATNR: satNum,
            FORMAT: "tle",
          },
        }),
      ]);
      // console.log("fetched");
      const nameResponse1 = nameResponse.data;
      const nameResponse2 = nameResponse1.split("1 " + satNum);

      setSatName(nameResponse2[0].trim());

      const tleResponse1 = tleResponse.data;
      tleResponse1.toString();
      const tleResponse2 = tleResponse1.replace(/(\r\n|\n|\r)/gm, "");
      const tleResponse3 = tleResponse2.split("2 " + satNum);
      setSatTle(tleResponse3);
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
