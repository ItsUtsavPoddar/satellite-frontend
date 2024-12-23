import React, { useEffect, useState } from "react";
import axios from "axios";

const MostSearchedSatellite = () => {
  const [satellite, setSatellite] = useState(null);

  useEffect(() => {
    const fetchMostSearchedSatellite = async () => {
      try {
        const response = await axios.get(
          "https://satellite-backend-production.up.railway.app/most-fetched"
        );
        console.log("Response data:", response.data); // Log the response data
        setSatellite(response.data);
      } catch (error) {
        console.error("Error fetching most searched satellite:", error);
      }
    };

    fetchMostSearchedSatellite();
  }, []);
  if (!satellite) {
    return <div>Loading...</div>;
  }

  return `Most Searched Satellite
          Sat ID: ${satellite.satNumber}
          Searches: ${satellite.fetchCount}`;
};

export default MostSearchedSatellite;
