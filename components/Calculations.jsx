"use client";

import { useDispatch, useSelector } from "react-redux";
import { satCoordsUpdated } from "@/redux/slices/satData";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
const satellite = require("satellite.js");

const Calculations = ({ satNum, stopInterval }) => {
  const intervalIdRef = useRef(null);

  const dispatch = useDispatch();
  const [longi, setlong] = useState(0);
  const [lati, setlat] = useState(0);
  const [height, setheight] = useState(0);
  const [path1, setpath1] = useState(0);
  const [path2, setpath2] = useState(0);
  var xyz;
  var abc;
  var name;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const [tleResponse, nameResponse] = await Promise.all([
        //   axios.get("https://celestrak.org/NORAD/elements/gp.php", {
        //     params: {
        //       CATNR: satNum,
        //       FORMAT: "2le",
        //     },
        //   }),
        //   axios.get("https://celestrak.org/NORAD/elements/gp.php", {
        //     params: {
        //       CATNR: satNum,
        //       FORMAT: "tle",
        //     },
        //   }),
        // ]);
        name = "ISS";
        //   nameResponse.data;

        name = name.split("1 " + satNum);

        xyz =
          "1 25544U 98067A   23131.59547726  .00014612  00000+0  26229-3 0  9992 2 25544  51.6400 149.8957 0006321 335.8261 168.3051 15.50121033396116";
        // ("1 56179U 23054B   23149.85624328  .00006627  00000+0  29623-3 0  9994 2 56179  97.4043  44.9672 0010893 101.7937 258.4522 15.21601277  7375");
        // tleResponse.data;
        xyz.toString();
        abc = xyz.split("2 " + satNum);

        // abc = xyz.split("2 " + "56179");
        // console.log(abc[1].trim());
        if (!ignore) {
          intervalIdRef.current = setInterval(() => {
            fitLat(); // Pass tleData to fitLat function
          }, 2000);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
    return () => {
      ignore = true;
      console.log("treue");
    };
  }, []);

  useEffect(() => {
    if (stopInterval && intervalIdRef.current) {
      console.log("deleted");
      clearInterval(intervalIdRef.current);
    }
  }, [stopInterval]);

  const cords = (line1, line2) => {
    // console.log(line1, line2);
    const satrec = satellite.twoline2satrec(line1, line2); // Initializing the satellite record with the TLE (line 1 and line 2)
    // console.log(satrec)
    var date = new Date();

    //date = new Date (date.getTime() + 800000); // <-- TEST CODE (DO NOT UNCOMMENT THE CODE IF YOU DONT KNOW WHAT YOU ARE DOING)

    // Getting the position of the satellite at the given date
    // The position_velocity result is a key-value pair of ECI coordinates.
    // https://celestrak.org/columns/v02n01/#:~:text=The%20ECI%20coordinate%20system%20(see,orthogonal%20(mutually%20perpendicular)%20axes.

    var positionAndVelocity = satellite.propagate(satrec, date);
    // console.log(positionAndVelocity);

    // grabbing GMST for the coordinate transforms.
    // https://en.wikipedia.org/wiki/Sidereal_time#Definition

    const gmst = satellite.gstime(date);
    // console.log(gmst);

    // converts Earth-centered inertial ECI coordinates, specified by position, to latitude, longitude, altitude (LLA) geodetic coordinates.
    const positionGd = satellite.eciToGeodetic(
      positionAndVelocity.position,
      gmst
    );
    // console.log(positionGd);

    // Converting the RADIANS to DEGREES (given the results were in radians)
    const long = (180 * positionGd.longitude) / Math.PI;
    const lat = (180 * positionGd.latitude) / Math.PI;
    const height = positionGd.height;
    //console.log([long, lat]);
    return [long, lat, height];
  };
  const fitLat = () => {
    // console.log(ar1[0]);
    console.log(3);

    var foo = cords(abc[0], "2 " + satNum + "  " + abc[1].trim());
    // console.log(foo);
    setlat(foo[1]);
    setlong(foo[0]);
    setheight(foo[2]);
    dispatch(
      satCoordsUpdated({
        id: satNum,
        name: name[0].trim(),
        coords: [foo[0].toFixed(4), foo[1].toFixed(4)],
      })
    );
  };
  return <></>;
};

export default Calculations;
