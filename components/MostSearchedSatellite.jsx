import React, { useEffect, useState } from "react";
import axios from "axios";

const MostSearchedSatellite = () => {
  const [satellite, setSatellite] = useState(null);

  useEffect(() => {
    const fetchMostSearchedSatellite = async () => {
      try {
        const response = await axios.get(
          "https://satellite-backend-lo09.onrender.com/most-fetched"
        );

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
