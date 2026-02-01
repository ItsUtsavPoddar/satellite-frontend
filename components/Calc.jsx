"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  satCoordsUpdated,
  satPathUpdated,
  satIsEclipsed,
  satPassesUpdated,
  satRiseSetTimeUpdated,
} from "@/redux/slices/satData";
import { sunCoords } from "@/redux/slices/sunData";
import { useEffect } from "react";
const satellite = require("satellite.js");

const Calc = ({ satNum }) => {
  const dispatch = useDispatch();
  const satellites = useSelector((state) => state.satDataReducer[satNum]);
  const user = useSelector((state) => state.userDataReducer);

  // Get epoch date from satellite data
  const epochDate = satellites?.epochDate
    ? new Date(satellites.epochDate)
    : new Date();

  const observerGd = {
    longitude: satellite.degreesToRadians(user?.coordinates?.longitude || 0),
    latitude: satellite.degreesToRadians(user?.coordinates?.latitude || 0),
    height: user?.coordinates?.height || 0,
  };

  const getSatellitePosition = (line1, line2, date = new Date()) => {
    const satrec = satellite.twoline2satrec(line1, line2); //Initializing the satellite record with the TLE (line 1 and line 2)

    // Check if satrec was created successfully
    if (satrec.error) {
      return null;
    }

    let positionAndVelocity = satellite.propagate(satrec, date);

    // If propagation failed with current date, try with epoch date
    if (!positionAndVelocity.position) {
      positionAndVelocity = satellite.propagate(satrec, epochDate);

      if (!positionAndVelocity.position) {
        return null;
      }

      // Use epoch date for calculations if current date failed
      date = epochDate;
    }

    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(
      positionAndVelocity.position,
      gmst,
    );
    const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
    const long = satellite.degreesLong(positionGd.longitude);
    const lat = satellite.degreesLat(positionGd.latitude);
    const height = positionGd.height;

    const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
    const azimuth = satellite.radiansToDegrees(lookAngles.azimuth);
    const elevation = satellite.radiansToDegrees(lookAngles.elevation);
    const rangeSat = lookAngles.rangeSat;

    return {
      long,
      lat,
      height,
      positionGd,
      positionAndVelocity,
      gmst,
      positionEcf,
      azimuth,
      elevation,
      rangeSat,
    };
  };

  const cords = (line1, line2) => {
    // Return some default value or handle the error appropriately already handled when fething still a fallback
    if (!line1 || !line2) {
      return null;
    }
    const position = getSatellitePosition(line1, line2);
    if (!position) {
      return null;
    }
    const { long, lat, height, azimuth, elevation, rangeSat } = position;
    return [long, lat, height, azimuth, elevation, rangeSat];
  };

  const passes = (line1, line2, observerCoords) => {
    const passes = [];
    let currentPass = null;
    let peakElevation = -Infinity;
    let visibilityStart = null;
    let hasBeenVisible = false;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 15);

    for (
      let date = new Date();
      date <= endDate;
      date.setSeconds(date.getSeconds() + 10)
    ) {
      const position = getSatellitePosition(line1, line2, date);
      if (!position) {
        return [];
      }
      const { positionEcf } = position;
      const lookAngles = satellite.ecfToLookAngles(observerCoords, positionEcf);
      const azimuth = satellite.radiansToDegrees(lookAngles.azimuth);
      const elevation = satellite.radiansToDegrees(lookAngles.elevation);
      const rangeSat = lookAngles.rangeSat;

      if (elevation > 5) {
        const sunPosition = calculateSunPosition(date);
        const eclipseStatus = isSatelliteInEclipse(line1, line2, date);
        const isVisible =
          sunPosition.elevation < -6 &&
          !(eclipseStatus.isUmbral || eclipseStatus.isPenumbral);

        if (!currentPass) {
          currentPass = {
            isVisible: false,
            startTime: date.toISOString(),
            startAzimuth: azimuth,
            startElevation: elevation,
            startRange: rangeSat,
            peakTime: date.toISOString(),
            peakAzimuth: azimuth,
            peakElevation: elevation,
            peakRange: rangeSat,
            endTime: date.toISOString(),
            endAzimuth: azimuth,
            endElevation: elevation,
            endRange: rangeSat,
            visiblePeriod: null,
            maxElevation: elevation,
          };
        }

        if (isVisible) {
          hasBeenVisible = true;
          if (!visibilityStart) {
            visibilityStart = date.toISOString();
          }
        } else if (visibilityStart) {
          currentPass.visiblePeriod = {
            start: visibilityStart,
            end: date.toISOString(),
          };
          visibilityStart = null;
        }

        // Update peak and other properties
        if (elevation > peakElevation) {
          peakElevation = elevation;
          currentPass.peakTime = date.toISOString();
          currentPass.peakAzimuth = azimuth;
          currentPass.peakElevation = elevation;
          currentPass.peakRange = rangeSat;
          currentPass.maxElevation = elevation;
        }

        currentPass.endTime = date.toISOString();
        currentPass.endAzimuth = azimuth;
        currentPass.endElevation = elevation;
        currentPass.endRange = rangeSat;
      } else if (currentPass) {
        if (visibilityStart) {
          currentPass.visiblePeriod = {
            start: visibilityStart,
            end: date.toISOString(),
          };
        }

        if (hasBeenVisible) {
          currentPass.isVisible = true;
        }

        if (currentPass.maxElevation >= 10) {
          passes.push(currentPass);
        }

        // Reset for next pass
        currentPass = null;
        peakElevation = -Infinity;
        visibilityStart = null;
        hasBeenVisible = false;
      }
    }

    // Handle last pass if exists
    if (currentPass && currentPass.maxElevation >= 10) {
      if (visibilityStart) {
        currentPass.visiblePeriod = {
          start: visibilityStart,
          end: currentPass.endTime,
        };
      }
      currentPass.isVisible = hasBeenVisible;
      passes.push(currentPass);
    }

    return passes;
  };

  const path = (line1, line2) => {
    const paths = [];
    let currentPath = {
      coords: [],
      inShadow: false,
    };
    let date = new Date(); // Start from current date

    for (let i = 0; i < 7200; i++) {
      const position = getSatellitePosition(line1, line2, date);
      if (!position) {
        return [];
      }

      const { long, lat } = position;
      const eclipseStatus = isSatelliteInEclipse(line1, line2, date);
      const isInShadow = eclipseStatus.isUmbral || eclipseStatus.isPenumbral;

      if (long < -179 || long > 179) {
        if (currentPath.coords.length > 0) {
          paths.push(currentPath);
          currentPath = {
            coords: [],
            inShadow: isInShadow,
          };
        }
      } else {
        // If shadow status changes, start a new path segment
        if (
          currentPath.coords.length > 0 &&
          isInShadow !== currentPath.inShadow
        ) {
          paths.push(currentPath);
          currentPath = {
            coords: [],
            inShadow: isInShadow,
          };
        }
        currentPath.coords.push([lat, long]);
        currentPath.inShadow = isInShadow;
      }
      date = new Date(date.getTime() + 1000);
    }

    if (currentPath.coords.length > 0) {
      paths.push(currentPath);
    }

    return paths;
  };

  const CalcCoords = () => {
    if (satellites?.tle && satellites.tle.length >= 2) {
      const [line1, line2] = satellites.tle;
      const data = cords(line1, line2);

      // Skip update if propagation failed
      if (!data) {
        return;
      }

      const data2 = isSatelliteInEclipse(line1, line2);
      const isEclipsed = data2.isUmbral || data2.isPenumbral;
      dispatch(
        satCoordsUpdated({
          id: satNum,
          coords: [data[0].toFixed(2), data[1].toFixed(2)],
          height: data[2].toFixed(1),
          azimuth: data[3].toFixed(2),
          elevation: data[4].toFixed(2),
          rangeSat: data[5].toFixed(2),
        }),
      );
      dispatch(
        satIsEclipsed({
          id: satNum,
          isEclipsed: isEclipsed,
        }),
      );
    }
  };

  const CalcPath = () => {
    if (satellites?.tle && satellites.tle.length >= 2) {
      const [line1, line2] = satellites.tle;
      const data = path(line1, line2);

      dispatch(
        satPathUpdated({
          id: satNum,
          path: data,
        }),
      );
    }
  };

  const Calcpass = () => {
    if (satellites?.tle && satellites.tle.length >= 2) {
      const data = passes(satellites.tle[0], satellites.tle[1], observerGd);
      dispatch(
        satPassesUpdated({
          id: satNum,
          passes: data,
        }),
      );
    }
  };

  const calculateSunPosition = (date = new Date()) => {
    const jd = date.getTime() / 86400000.0 + 2440587.5; // Julian Date
    const n = jd - 2451545.0; // Days since J2000.0
    //console.log(date);
    // Mean longitude of the Sun
    const L = (280.46 + 0.9856474 * n) % 360;

    // Mean anomaly of the Sun
    const g = (357.528 + 0.9856003 * n) % 360;

    // Ecliptic longitude of the Sun
    const lambda =
      L +
      1.915 * Math.sin((g * Math.PI) / 180) +
      0.02 * Math.sin((2 * g * Math.PI) / 180);

    // Obliquity of the ecliptic
    const epsilon = 23.439 - 0.0000004 * n;

    // Right ascension of the Sun
    const alpha =
      (Math.atan2(
        Math.cos((epsilon * Math.PI) / 180) *
          Math.sin((lambda * Math.PI) / 180),
        Math.cos((lambda * Math.PI) / 180),
      ) *
        180) /
      Math.PI;

    // Declination of the Sun
    const delta =
      (Math.asin(
        Math.sin((epsilon * Math.PI) / 180) *
          Math.sin((lambda * Math.PI) / 180),
      ) *
        180) /
      Math.PI;

    const gmst = 18.697374558 + 24.06570982441908 * n;
    const lst = (gmst + (observerGd.longitude * 180) / Math.PI / 15) % 24;

    // Convert the right ascension to hours
    const alphaHours = alpha / 15;

    // Calculate the hour angle
    const H = (lst - alphaHours) * 15;

    // Convert the hour angle to radians
    const Hrad = (H * Math.PI) / 180;

    // Convert the declination to radians
    const deltarad = (delta * Math.PI) / 180;

    // Convert the observer's latitude to radians
    const latrad = observerGd.latitude;
    const alphaRad = (alpha * Math.PI) / 180;

    // Distance from Earth to Sun in AU (Astronomical Units)
    const distance =
      1.00014 -
      0.01671 * Math.cos((g * Math.PI) / 180) -
      0.00014 * Math.cos((2 * g * Math.PI) / 180);

    // Convert distance to kilometers
    const distanceKm = distance * 149597870.7;

    // Calculate Sun's position in ECI coordinates
    const sunEci = {
      x: distanceKm * Math.cos(deltarad) * Math.cos(alphaRad),
      y: distanceKm * Math.cos(deltarad) * Math.sin(alphaRad),
      z: distanceKm * Math.sin(deltarad),
    };
    // console.log(`Sun ECI: x=${sunEci.x}, y=${sunEci.y}, z=${sunEci.z}`);

    // Calculate the elevation angle
    const elevation =
      (Math.asin(
        Math.sin(latrad) * Math.sin(deltarad) +
          Math.cos(latrad) * Math.cos(deltarad) * Math.cos(Hrad),
      ) *
        180) /
      Math.PI;

    // Calculate the azimuth angle
    const azimuth =
      (Math.acos(
        (Math.sin(deltarad) * Math.cos(latrad) -
          Math.cos(deltarad) * Math.sin(latrad) * Math.cos(Hrad)) /
          Math.cos((elevation * Math.PI) / 180),
      ) *
        180) /
      Math.PI;

    // Adjust azimuth based on the hour angle
    const adjustedAzimuth = H > 0 ? (360 - azimuth) % 360 : azimuth;
    // console.log(`Azimuth: ${adjustedAzimuth.toFixed(2)} degrees`);
    // console.log(`Elevation: ${elevation.toFixed(2)} degrees`);
    // console.log(`Right Ascension: ${alpha.toFixed(2)} degrees`);
    // console.log(`Declination: ${delta.toFixed(2)} degrees`);
    // Convert to longitude
    let longitude = (alpha - gmst * 15) % 360;
    if (longitude > 180) longitude -= 360;
    if (longitude < -180) longitude += 360;

    // Latitude is equal to declination
    const latitude = delta;
    return { alpha, delta, azimuth, elevation, sunEci, longitude, latitude };
  };

  const isSatelliteInEclipse = (line1, line2, date = new Date()) => {
    const satrec = satellite.twoline2satrec(line1, line2);
    const positionAndVelocity = satellite.propagate(satrec, date);
    const positionEci = positionAndVelocity.position;

    // Check if propagation succeeded
    if (!positionEci) {
      return { isUmbral: false, isPenumbral: false };
    }

    // Calculate the Sun's position in ECI coordinates
    const sunEci = calculateSunPosition(date).sunEci;

    // Calculate distances
    const rhoE = Math.sqrt(
      positionEci.x ** 2 + positionEci.y ** 2 + positionEci.z ** 2,
    );
    const rhoS = Math.sqrt(
      (sunEci.x - positionEci.x) ** 2 +
        (sunEci.y - positionEci.y) ** 2 +
        (sunEci.z - positionEci.z) ** 2,
    );
    const rS = Math.sqrt(sunEci.x ** 2 + sunEci.y ** 2 + sunEci.z ** 2);

    // Calculate semidiameters
    const RE = 6378.137; // Earth's radius in km
    const RS = 696340; // Sun's radius in km
    const thetaE = Math.asin(RE / rhoE);
    const thetaS = Math.asin(RS / rhoS);

    // Calculate normalized vectors
    const satToEarthVector = {
      x: -positionEci.x / rhoE,
      y: -positionEci.y / rhoE,
      z: -positionEci.z / rhoE,
    };

    const satToSunVector = {
      x: (sunEci.x - positionEci.x) / rhoS,
      y: (sunEci.y - positionEci.y) / rhoS,
      z: (sunEci.z - positionEci.z) / rhoS,
    };

    // Calculate the dot product
    const dotProduct =
      satToEarthVector.x * satToSunVector.x +
      satToEarthVector.y * satToSunVector.y +
      satToEarthVector.z * satToSunVector.z;
    const theta = Math.acos(Math.max(-1, Math.min(1, dotProduct)));

    //console.log(`theta: ${theta}`);
    const isUmbral = thetaE > thetaS && theta < thetaE - thetaS;
    const isPenumbral =
      Math.abs(thetaE - thetaS) < theta && theta < thetaE + thetaS;

    //console.log(`isUmbral: ${isUmbral}, isPenumbral: ${isPenumbral}`);
    return { isUmbral, isPenumbral };
  };

  const RiseSetTimes = () => {
    if (satellites?.tle && satellites.tle.length >= 2) {
      const [line1, line2] = satellites.tle;
      const results = [];
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours ahead
      const stepSec = 10; // Check every 10 seconds

      let lastEclipseState = false;
      let currentTime = new Date(startTime);

      while (currentTime <= endTime) {
        const eclipseStatus = isSatelliteInEclipse(line1, line2, currentTime);
        const currentEclipseState =
          eclipseStatus.isUmbral || eclipseStatus.isPenumbral;

        // Detect transition
        if (currentEclipseState !== lastEclipseState) {
          results.push({
            time: currentTime.toISOString(),
            type: currentEclipseState ? "sunset" : "sunrise",
          });
        }

        lastEclipseState = currentEclipseState;
        currentTime = new Date(currentTime.getTime() + stepSec * 1000);
      }

      dispatch(
        satRiseSetTimeUpdated({
          id: satNum,
          riseSetTime: results,
        }),
      );

      //console.log(results);
      return results;
    }
  };

  const SunLatLong = () => {
    const sunPosition = calculateSunPosition();

    dispatch(
      sunCoords({
        latitude: sunPosition.latitude,
        longitude: sunPosition.longitude,
      }),
    );
  };

  useEffect(() => {
    CalcPath();
    RiseSetTimes();
    SunLatLong();
    const intervalId1 = setInterval(CalcCoords, 750);
    const intervalId2 = setInterval(CalcPath, 60000);
    const intercalId3 = setInterval(RiseSetTimes, 3600000);
    const intervalId4 = setInterval(SunLatLong, 60000);

    return () => {
      clearInterval(intervalId2);
      clearInterval(intervalId1);
      clearInterval(intercalId3);
      clearInterval(intervalId4);
    };
  }, [satellites?.tle, user?.coordinates]);

  // Calculate passes only after height/altitude is available
  useEffect(() => {
    if (
      user?.coordinates?.height !== undefined &&
      user?.coordinates?.height !== 0
    ) {
      Calcpass();
    }
  }, [satellites?.tle, user?.coordinates?.height]);

  return null;
};

export default Calc;
