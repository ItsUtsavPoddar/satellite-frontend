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
      console.log("fetched");
      const nameResponse1 = nameResponse.data;
      const nameResponse2 = nameResponse1.split("1 " + satNum);

      setSatName(nameResponse2[0].trim());
      // console.log(nameResponse2[0].trim());
      //   xyz =
      //     "1 25544U 98067A   23131.59547726  .00014612  00000+0  26229-3 0  9992 2 25544  51.6400 149.8957 0006321 335.8261 168.3051 15.50121033396116";
      //   ("1 56179U 23054B   23149.85624328  .00006627  00000+0  29623-3 0  9994 2 56179  97.4043  44.9672 0010893 101.7937 258.4522 15.21601277  7375");
      // xyz = tleResponse.data;
      // xyz.toString();
      const tleResponse1 = tleResponse.data;
      tleResponse1.toString();
      const tleResponse2 = tleResponse1.replace(/(\r\n|\n|\r)/gm, "");
      const tleResponse3 = tleResponse2.split("2 " + satNum);
      setSatTle(tleResponse3);
      // console.log(satTle);
      //abc = xyz.split("2 " + satNum);

      // abc = xyz.split("2 " + "56179");
      // console.log(abc[1].trim());
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
