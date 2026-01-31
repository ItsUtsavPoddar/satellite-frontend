"use client";
import React from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMapEvents,
} from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { updateCoordinates } from "@/redux/slices/userData";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { NightRegion } from "react-leaflet-night-region";
import { MapPin, Locate, Loader2 } from "lucide-react";

// Fetch elevation from coordinates using Open-Elevation API
async function fetchElevation(lat, lng) {
  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`,
    );
    const data = await response.json();
    if (data.results && data.results[0]) {
      return Math.round(data.results[0].elevation); // elevation in meters
    }
  } catch (error) {
    console.error("Error fetching elevation:", error);
  }
  return 0;
}

// Draggable user marker component
function DraggableUserMarker({ position, onPositionChange }) {
  const [markerPos, setMarkerPos] = useState(position);
  const markerRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    // Only update marker position from props if not currently dragging
    if (!isDragging.current) {
      setMarkerPos(position);
    }
  }, [position]);

  const eventHandlers = {
    dragstart() {
      isDragging.current = true;
    },
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setMarkerPos([newPos.lat, newPos.lng]);
        onPositionChange(newPos.lat, newPos.lng);
        // Reset dragging flag after a short delay to allow position update
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      }
    },
  };

  const icon_user = L.divIcon({
    className: "custom-user-marker",
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
      </svg>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={markerPos}
      ref={markerRef}
      icon={icon_user}
    >
      <Popup className="custom-popup">
        <div className="text-center font-medium">
          <div className="text-zinc-100 font-bold">Your Location</div>
          <div className="text-xs text-zinc-400 mt-1">
            {markerPos[0].toFixed(4)}°, {markerPos[1].toFixed(4)}°
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Drag to change location
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Geolocation button component
function GeolocationButton() {
  const dispatch = useDispatch();
  const map = useMapEvents({});
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 6 });
  };

  useMapEvents({
    locationfound(e) {
      setLocating(false);
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      fetchElevation(lat, lng).then((elevation) => {
        dispatch(
          updateCoordinates({
            latitude: lat,
            longitude: lng,
            height: elevation,
          }),
        );
      });
    },
    locationerror() {
      setLocating(false);
      alert(
        "Unable to determine your location. Please enable location services.",
      );
    },
  });

  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      className="leaflet-control-custom fixed bottom-24 right-4 z-[1000] bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 p-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Detect my location"
    >
      {locating ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Locate className="h-5 w-5" />
      )}
    </button>
  );
}

const LeafMap = () => {
  const satellites = useSelector((state) => state.satDataReducer);
  const user = useSelector((state) => state.userDataReducer);
  const sun = useSelector((state) => state.sunDataReducer);
  const dispatch = useDispatch();

  // Auto-detect location on first load
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      // Check if user has default coordinates (likely not set yet)
      if (user.coordinates.latitude === 0 && user.coordinates.longitude === 0) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = parseFloat(position.coords.latitude.toFixed(6));
            const lng = parseFloat(position.coords.longitude.toFixed(6));
            const elevation = await fetchElevation(lat, lng);
            dispatch(
              updateCoordinates({
                latitude: lat,
                longitude: lng,
                height: elevation,
              }),
            );
          },
          (error) => {
            console.log("Geolocation not available:", error.message);
          },
        );
      }
    }
  }, [dispatch, user.coordinates.latitude, user.coordinates.longitude]);

  const handleUserPositionChange = async (lat, lng) => {
    // Dispatch immediately with current height, then update with fetched elevation
    dispatch(
      updateCoordinates({
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        height: 0, // Temporary value
      }),
    );

    // Fetch elevation in background and update
    const elevation = await fetchElevation(lat, lng);
    dispatch(
      updateCoordinates({
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        height: elevation,
      }),
    );
  };

  // Create dynamic satellite icon based on color
  const createSatIcon = (color) => {
    return L.divIcon({
      className: "custom-sat-marker",
      html: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 3.5L8 8M20.5 20.5L16 16M8.5 8.5L4 13M20 11L13 4M11 20L4 13" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="3" fill="${color}" stroke="${color}" stroke-width="1.5" fill-opacity="0.3"/>
        </svg>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const icon_sun = L.divIcon({
    className: "custom-sun-marker",
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div className="relative h-screen w-screen">
      <MapContainer
        key="main-map-container"
        center={[
          user.coordinates.latitude || 20,
          user.coordinates.longitude || 0,
        ]}
        zoom={3}
        scrollWheelZoom={true}
        worldCopyJump={true}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        minZoom={2}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        <NightRegion
          fillColor="#000000"
          color="#111111"
          refreshInterval={2000}
        />

        <DraggableUserMarker
          position={[user.coordinates.latitude, user.coordinates.longitude]}
          onPositionChange={handleUserPositionChange}
        />

        <GeolocationButton />

        <Marker
          position={[sun.sunCoords.latitude, sun.sunCoords.longitude]}
          icon={icon_sun}
        >
          <Popup className="custom-popup">
            <div className="text-center font-medium">
              <div className="text-zinc-100 font-bold">Sun</div>
              <div className="text-xs text-zinc-400 mt-1">
                {sun.sunCoords.latitude.toFixed(2)}°,{" "}
                {sun.sunCoords.longitude.toFixed(2)}°
              </div>
            </div>
          </Popup>
        </Marker>

        {Object.values(satellites).map((sat) => (
          <div key={sat.id}>
            <Marker
              position={[sat.coords[1], sat.coords[0]]}
              icon={createSatIcon(sat.color)}
            >
              <Popup className="custom-popup">
                <div className="text-center font-medium">
                  <div className="text-white font-bold text-base">
                    {sat.name}
                  </div>
                  <div className="text-sm text-zinc-200 mt-1">
                    NORAD: {sat.id}
                  </div>
                  <div className="text-sm text-zinc-200 mt-1">
                    Alt: {sat.height} km
                  </div>
                </div>
              </Popup>
            </Marker>
            {sat.path &&
              sat.path.length > 0 &&
              sat.path.map((pathSegment, index) => (
                <Polyline
                  key={index}
                  positions={pathSegment.coords || []}
                  pathOptions={{
                    color: pathSegment.inShadow ? `${sat.color}40` : sat.color,
                    weight: 2,
                    opacity: pathSegment.inShadow ? 0.4 : 0.8,
                  }}
                  smoothFactor={2}
                />
              ))}
            <Circle
              center={[sat.coords[1], sat.coords[0]]}
              radius={800e3}
              pathOptions={{
                weight: 1,
                opacity: 0.2,
                color: sat.color,
                fillColor: sat.color,
                fillOpacity: 0.05,
              }}
            />
          </div>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="fixed bottom-4 left-4 z-[1000] bg-zinc-950 border border-zinc-800 rounded p-3 max-w-xs">
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="#f43f5e"
                stroke="#e11d48"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-zinc-300">Your Location (Draggable)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.5 3.5L8 8M20.5 20.5L16 16M8.5 8.5L4 13M20 11L13 4M11 20L4 13"
                stroke="#71717a"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="#71717a"
                stroke="#71717a"
                strokeWidth="1.5"
                fillOpacity="0.3"
              />
            </svg>
            <span className="text-zinc-300">Satellites (colored by path)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="4"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <path
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-zinc-300">Sun Position</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LeafMap);
