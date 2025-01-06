"use client";

import { useDispatch, useSelector } from "react-redux";
import { satCoordsUpdated, satPathUpdated } from "@/redux/slices/satData";
import { useEffect } from "react";
const satellite = require("satellite.js");

const Calc = ({ satNum }) => {
  const dispatch = useDispatch();
  const satellites = useSelector((state) => state.satDataReducer[satNum]);
  const observerGd = {
    longitude: satellite.degreesToRadians(85.7956695),
    latitude: satellite.degreesToRadians(20.2516902),
    height: 0.06,
  };

  const getSatellitePosition = (line1, line2, date = new Date()) => {
    const satrec = satellite.twoline2satrec(line1, line2); //Initializing the satellite record with the TLE (line 1 and line 2)
    const positionAndVelocity = satellite.propagate(satrec, date);
    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(
      positionAndVelocity.position,
      gmst
    );
    const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
    const long = satellite.degreesLong(positionGd.longitude);
    const lat = satellite.degreesLat(positionGd.latitude);
    const height = positionGd.height;
    return {
      long,
      lat,
      height,
      positionGd,
      positionAndVelocity,
      gmst,
      positionEcf,
    };
  };

  const cords = (line1, line2) => {
    // Return some default value or handle the error appropriately already handled when fething still a fallback
    if (!line1 || !line2) {
      console.error("TLE data is missing:", line1, line2);
      return [0, 0, 0];
    }
    const { long, lat, height } = getSatellitePosition(line1, line2);
    return [long, lat, height];
  };

  const passes = (line1, line2, observerCoords) => {
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
      const { positionEcf } = getSatellitePosition(line1, line2, date);

      const lookAngles = satellite.ecfToLookAngles(observerCoords, positionEcf);

      const azimuth = satellite.radiansToDegrees(lookAngles.azimuth);
      const elevation = satellite.radiansToDegrees(lookAngles.elevation);
      const rangeSat = lookAngles.rangeSat;

      if (elevation > 5) {
        if (!currentPass) {
          currentPass = {
            startAzimuth: azimuth,
            startElevation: elevation,
            startRange: rangeSat,
            startTime: new Date(date),
            peakAzimuth: azimuth,
            peakElevation: elevation,
            peakRange: rangeSat,
            peakTime: new Date(date),
            endAzimuth: azimuth,
            endElevation: elevation,
            endRange: rangeSat,
            endTime: new Date(date),
          };
          peakElevation = elevation;
        } else {
          if (elevation > peakElevation) {
            currentPass.peakAzimuth = azimuth;
            currentPass.peakElevation = elevation;
            currentPass.peakRange = rangeSat;
            currentPass.peakTime = new Date(date);
            peakElevation = elevation;
          }
          currentPass.endAzimuth = azimuth;
          currentPass.endElevation = elevation;
          currentPass.endRange = rangeSat;
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
    const paths = [];
    let currentPath = [];
    let date = new Date();

    for (let i = 0; i < 7200; i++) {
      const { long, lat } = getSatellitePosition(line1, line2, date);
      if (long < -179 || long > 179) {
        if (currentPath.length > 0) {
          paths.push(currentPath);
          currentPath = [];
        }
      } else {
        currentPath.push([lat, long]);
      }
      date = new Date(date.getTime() + 1000);
    }

    if (currentPath.length > 0) {
      paths.push(currentPath);
    }

    return paths;
  };

  const CalcCoords = () => {
    if (satellites?.tle && satellites.tle.length === 2) {
      const [line1, line2] = satellites.tle;
      const data = cords(line1, line2);
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
      const [line1, line2] = satellites.tle;
      const data = path(line1, line2);
      dispatch(
        satPathUpdated({
          id: satNum,
          path: data,
        })
      );
    }
  };

  const Calcpass = () => {
    if (satellites?.tle && satellites.tle.length === 2) {
      const data = passes(satellites.tle[0], satellites.tle[1], observerGd);
    }
  };

  useEffect(() => {
    Calcpass();
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
