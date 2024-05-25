"use client";

import { useDispatch, useSelector } from "react-redux";
import { satCoordsUpdated } from "@/redux/slices/satData";
import { useEffect } from "react";
const satellite = require("satellite.js");

const Calc = ({ satNum }) => {
  const dispatch = useDispatch();
  const satellites = useSelector((state) => state.satDataReducer[satNum]);

  const cords = (line1, line2) => {
    // console.log(line1, "\n", line2);
    // console.log(typeof line1, "\n", typeof line2);
    if (!line1 || !line2) {
      console.error("TLE data is missing:", line1, line2);
      return [0, 0, 0]; // Return some default value or handle the error appropriately
    }
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

  const CalcCoords = () => {
    if (satellites?.tle && satellites.tle.length === 2) {
      const s = satellites.tle[0];
      const p = "2 " + satNum + satellites.tle[1];
      const data = cords(s, p);
      dispatch(
        satCoordsUpdated({
          id: satNum,
          coords: [data[0].toFixed(4), data[1].toFixed(4)],
          height: data[2].toFixed(1),
        })
      );
    }
  };

  useEffect(() => {
    const intervalId = setInterval(CalcCoords, 2000);
    return () => clearInterval(intervalId);
  }, [satellites]);
  return;
};

export default Calc;
