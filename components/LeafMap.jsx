"use client";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  CircleMarker,
} from "react-leaflet";
import { useSelector } from "react-redux";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
// import { NightRegion } from "react-leaflet-night-region";

const LeafMap = () => {
  const satellites = useSelector((state) => state.satDataReducer);
  const icon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1209/1209255.png?w=360",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return (
    <div>
      <MapContainer
        center={[21, 78]}
        zoom={0}
        scrollWheelZoom={true}
        worldCopyJump={true}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        minZoom={1}
        className="static w-full rounded-md shadow-sm h-112 md:h-96 lg:h-128"
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
        {Object.values(satellites).map((sat) => (
          <div key={sat.id}>
            <Marker
              position={[sat.coords[1], sat.coords[0]]}
              icon={icon}
              autoPanOnFocus={false}
              autoPan={false}
            >
              <Popup autoPan={false}>
                Name: {sat.name} SatNum: {sat.id}
              </Popup>
            </Marker>
            {sat.path.map((pathSegment, index) => (
              <Polyline
                key={index}
                positions={pathSegment}
                pathOptions={{
                  color: sat.color,
                  weight: 1.5,
                }}
                smoothFactor={2}
              ></Polyline>
            ))}
            <Circle
              center={[sat.coords[1], sat.coords[0]]}
              radius={800e3}
              pathOptions={{
                weight: 1.5,
                opacity: 0.3,
                color: "gray",
                fillColor: "#000000",
                fillOpacity: 0.2,
              }}
            ></Circle>
          </div>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafMap;
