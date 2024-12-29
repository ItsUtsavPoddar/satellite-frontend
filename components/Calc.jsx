"use client";

import { useDispatch, useSelector } from "react-redux";
import { satCoordsUpdated, satPathUpdated } from "@/redux/slices/satData";
import { useEffect } from "react";
const satellite = require("satellite.js");
let positionEcf = null;

const Calc = ({ satNum }) => {
  const dispatch = useDispatch();
  const satellites = useSelector((state) => state.satDataReducer[satNum]);
  const observerGd = {
    longitude: satellite.degreesToRadians(85.7956695),
    latitude: satellite.degreesToRadians(20.2516902),
    height: 0.06,
  };

  const cords = (line1, line2) => {
    // Return some default value or handle the error appropriately already handled when fething still a fallback
    if (!line1 || !line2) {
      console.error("TLE data is missing:", line1, line2);
      return [0, 0, 0];
    }
    const satrec = satellite.twoline2satrec(line1, line2); // Initializing the satellite record with the TLE (line 1 and line 2)
    var date = new Date();

    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    var positionAndVelocity = satellite.propagate(
      satrec,
      new Date(date.getTime() + 0)
    );

    // grabbing GMST for the coordinate transforms.
    // https://en.wikipedia.org/wiki/Sidereal_time#Definition

    const gmst = satellite.gstime(new Date(date.getTime() + 0));
    // converts Earth-centered inertial ECI coordinates, specified by position, to (latitude, longitude, altitude [LLA]) geodetic coordinates.
    positionEcf = satellite.eciToEcf(
      positionAndVelocity.position,
      satellite.gstime(new Date(date.getTime() + 0))
    );
    const positionGd = satellite.eciToGeodetic(
      positionAndVelocity.position,
      gmst
    );

    // Converting the RADIANS to DEGREES (given the results were in radians)
    const long = (180 * positionGd.longitude) / Math.PI;
    const lat = (180 * positionGd.latitude) / Math.PI;
    const height = positionGd.height;
    return [long, lat, height];
  };

  const calcPasses = (line1, line2, observerCoords) => {
    const satrec = satellite.twoline2satrec(line1, line2);
    const passes = [];
    let currentPass = null;
    let peakElevation = -Infinity;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);

    for (
      let date = new Date();
      date <= endDate;
      date.setSeconds(date.getSeconds() + 10)
    ) {
      const positionAndVelocity = satellite.propagate(satrec, date);
      const gmst = satellite.gstime(date);
      const positionEcf = satellite.eciToEcf(
        positionAndVelocity.position,
        gmst
      );
      const positionGd = satellite.eciToGeodetic(
        positionAndVelocity.position,
        gmst
      );
      const lookAngles = satellite.ecfToLookAngles(observerCoords, positionEcf);

      const azimuth = satellite.radiansToDegrees(lookAngles.azimuth);
      const elevation = satellite.radiansToDegrees(lookAngles.elevation);

      if (elevation > 5) {
        if (!currentPass) {
          currentPass = {
            startAzimuth: azimuth,
            startElevation: elevation,
            startTime: new Date(date),
            peakAzimuth: azimuth,
            peakElevation: elevation,
            peakTime: new Date(date),
            endAzimuth: azimuth,
            endElevation: elevation,
            endTime: new Date(date),
          };
          peakElevation = elevation;
        } else {
          if (elevation > peakElevation) {
            currentPass.peakAzimuth = azimuth;
            currentPass.peakElevation = elevation;
            currentPass.peakTime = new Date(date);
            peakElevation = elevation;
          }
          currentPass.endAzimuth = azimuth;
          currentPass.endElevation = elevation;
          currentPass.endTime = new Date(date);
        }
      } else if (currentPass) {
        if (currentPass.peakElevation >= 10) {
          passes.push(currentPass);
        }
        currentPass = null;
        peakElevation = -Infinity;
      }
    }
    console.log(passes);
  };

  const path = (line1, line2) => {
    var pathC1 = [];
    var pathC2 = [];
    const satrec = satellite.twoline2satrec(line1, line2);
    var date = new Date();
    var i = 0;

    //console.log(date);
    for (; i < 5000; i++) {
      var positionAndVelocity = satellite.propagate(
        satrec,
        new Date(date.getTime() + 0)
      );
      const gmst = satellite.gstime(new Date(date.getTime() + 0));
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

    for (var j = 0; j < 5000 - i; j++) {
      var positionAndVelocity = satellite.propagate(
        satrec,
        new Date(date.getTime() + 0)
      );
      const gmst = satellite.gstime(new Date(date.getTime() + 0));
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
  const CalcPass = () => {
    if (satellites?.tle && satellites.tle.length === 2) {
      const s = satellites.tle[0];
      const p = satellites.tle[1];
      const data = calcPasses(satellites.tle[0], satellites.tle[1], observerGd);
    }
  };

  useEffect(() => {
    CalcPass();
    CalcCoords();
    const intervalId1 = setInterval(CalcCoords, 2000);
    CalcPath();
    const intervalId2 = setInterval(CalcPath, 5000);
    return () => {
      clearInterval(intervalId2);
      clearInterval(intervalId1);
    };
  }, [satellites?.tle]);

  return;
};

export default Calc;
