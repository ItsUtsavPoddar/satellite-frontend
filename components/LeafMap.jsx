"use client";

import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
// import { NightRegion } from "react-leaflet-night-region";

const LeafMap = () => {
  // const [satellites, setsatellites] = useState([]);

  return (
    <div>
      <MapContainer
        center={[21, 78]}
        zoom={3}
        scrollWheelZoom={true}
        worldCopyJump={true}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        minZoom={2}
        className="static w-full rounded-md shadow-sm h-80 md:h-96 lg:h-128"
      >
        <TileLayer
          //   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        {/* <NightRegion
          fillColor="#00345c"
          color="#001a2e"
          refreshInterval={2000} 
        /> */}
        {/* <Calculation satnumber={"25544"} /> */}
      </MapContainer>
    </div>
  );
};

export default LeafMap;
