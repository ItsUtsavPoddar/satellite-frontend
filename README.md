# Satellite Tracker

## Overview

Welcome to the Satellite Tracker! This project allows users to discover real-time satellite positioning, view height details, and track the next 80 minutes of their orbital path and beyond. The app leverages orbital data (**TLE**) from [Celestrak](https://celestrak.com/) and is designed to provide a seamless and informative experience for anyone interested in satellite tracking.

## Features

- **Real-time Satellite Tracking**: View the current location of satellites in orbit.
- **Orbital Path Prediction**: Track the satellite's orbit for the next 80 minutes or more.

## Upcoming Features

- **User Authentication**: Securely login and save your preferences.
- **Global Chat**: Connect with other satellite enthusiasts globally.
- **Data Storage**: Satellite data is stored in the backend for efficient retrieval. The requested data will be refreshed automatically if it is older than 24 hours.
- **Satellite Passes**: Get information on upcoming satellite passes, including visibility times and locations.
- **My Own Library**: To calculate satellite position from TLE data.

## Tech Stack

- **Frontend**: 
  - React.js with Next.js
  - Redux for Global state management 
  - SatelliteJS Library for calculations
 
- **Upcoming Backend**:
  - Node.js with Express.js
  - SQL for data storage
  - JWT for user authentication
- **APIs**:
  - Celestrak for satellite data
- **Hosting**:
  - Frontend: Vercel
  - Upcoming Backend: Heroku

## Usage

- **Satellite Passes**: Use the "Passes" feature to determine when a satellite will pass overhead and its visibility times, allowing you to plan viewing sessions.
- **Track any Satellite**: View any satellite's live positions and other data.
- **Global Chat**: Join the global chat room and connect with other users. You need to be logged in to use the chat feature.
- **Authentication**: Create an account or log in to save your preferences and chat with others.

## Contributing
Contributions are welcome! Feel free to submit a pull request or open an issue to discuss potential changes.

## Contact
If you have any questions or suggestions, feel free to reach out at utsavpoddar002@gmail.com
