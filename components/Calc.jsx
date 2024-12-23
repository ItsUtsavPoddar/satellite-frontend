"use client";

import { useDispatch, useSelector } from "react-redux";
import { satCoordsUpdated, satPathUpdated } from "@/redux/slices/satData";
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

  const path = (line1, line2) => {
    var pathC1 = [];
    var pathC2 = [];
    const satrec = satellite.twoline2satrec(line1, line2);
    var date = new Date();
    var i = 0;

    //console.log(date);
    for (; i < 3600; i++) {
      var positionAndVelocity = satellite.propagate(satrec, date);
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(
        positionAndVelocity.position,
        gmst
      );

      const long = satellite.degreesLong(positionGd.longitude);
      const lat = satellite.degreesLong(positionGd.latitude);
      if (long < 179.4) {
        pathC1.push([lat, long]);
      } else {
        break;
      }
      date = new Date(date.getTime() + 1000);
    }

    for (var j = 0; j < 3600 - i; j++) {
      var positionAndVelocity = satellite.propagate(satrec, date);
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(
        positionAndVelocity.position,
        gmst
      );

      const long = satellite.degreesLong(positionGd.longitude);
      const lat = satellite.degreesLong(positionGd.latitude);

      if (long >= -180 && long <= 179) {
        pathC2.push([lat, long]);
      }

      date = new Date(date.getTime() + 1000);
    }

    // console.log(pathC1, pathC2, i, j, date);
    return [pathC1, pathC2];
  };

  const CalcCoords = () => {
    if (satellites?.tle && satellites.tle.length === 2) {
      const s = satellites.tle[0];
      const p = satellites.tle[1];
      const data = cords(s, p);
      dispatch(
        satCoordsUpdated({
          id: satNum,
          coords: [data[0].toFixed(2), data[1].toFixed(2)],
          height: data[2].toFixed(1),
        })
      );
    }
  };

  const CalcPath = () => {
    if (satellites?.tle && satellites.tle.length === 2) {
      const s = satellites.tle[0];
      const p = satellites.tle[1];
      const data = path(s, p);
      dispatch(
        satPathUpdated({
          id: satNum,
          path: [data[0], data[1]],
        })
      );
    }
  };

  useEffect(() => {
    CalcCoords();
    const intervalId1 = setInterval(CalcCoords, 2000);
    return () => clearInterval(intervalId1);
  }, [satellites?.tle]);

  useEffect(() => {
    CalcPath();
    const intervalId2 = setInterval(CalcPath, 5000);
    return () => clearInterval(intervalId2);
  }, [satellites?.tle]);
  return;
};

export default Calc;
