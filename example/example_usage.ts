// Example Usage of Warsaw Veturilo Public Bike System API Helper Library
// -----------------------------------------------------------------------
// This file demonstrates how to use the Veturilo API helper functions to:
// 1. Fetch all stations
// 2. Find a specific station by its number
// 3. Retrieve all bikes at a given station
// 4. Search for a specific bike by its number

import {
  getAllStations,
  getStationByNumber,
  getBikesAtStation,
  getBikeByNumber,
  Station,
  Bike,
  StationType,
  BikeType,
} from "../lib"; 

// 1. Fetch and display all stations
async function showAllStations() {
  console.log("Fetching all stations...");
  const stations: Station[] = await getAllStations();
  console.log(`Total stations found: ${stations.length}`);
  console.log("Sample station:", stations[0]);
}

// 2. Find and display details of a station by its number
async function showStationByNumber(stationNumber: number) {
  console.log(`\nLooking up station with number ${stationNumber}...`);
  const station = await getStationByNumber(stationNumber);
  if (station) {
    console.log("Station found:");
    console.log(`Name: ${station.name}`);
    console.log(`Location: (${station.geoCoords.lat}, ${station.geoCoords.lng})`);
    console.log(`Available standard bikes: ${station.availabilityStatus.availableStandardBikes}`);
    console.log(`Available electric bikes: ${station.availabilityStatus.availableElectricBikes}`);
    console.log(`Available tandem bikes: ${station.availabilityStatus.availableTandemBikes}`);
  } else {
    console.log("Station not found.");
  }
}

// 3. List all bikes at a specific station
async function showBikesAtStation(stationNumber: number) {
  console.log(`\nListing bikes at station ${stationNumber}...`);
  const bikes: Bike[] = await getBikesAtStation(stationNumber);
  if (bikes.length === 0) {
    console.log("No bikes found or station does not exist.");
    return;
  }

  bikes.forEach((bike, index) => {
    console.log(
      `Bike #${index + 1}: Number=${bike.number}, Type=${bike.type}, Battery=${bike.battery ?? "N/A"}, Coordinates=(${bike.geoCoords.lat}, ${bike.geoCoords.lng}), Station Number=${bike.stationNumber ?? "N/A"}`
    );
  });
}

// 4. Search for a specific bike by number
async function showBikeByNumber(bikeNumber: number) {
  console.log(`\nSearching for bike number ${bikeNumber}...`);
  const bike = await getBikeByNumber(bikeNumber);
  if (bike) {
    console.log(
      `Bike found: Number=${bike.number}, Type=${bike.type}, Battery=${bike.battery ?? "N/A"}, Station Number=${bike.stationNumber ?? "N/A"}`
    );
  } else {
    console.log("Bike not found.");
  }
}

// Run all examples
(async () => {
  const exampleStationNumber = 9648; 
  const exampleBikeNumber = 613712; 

  try {
    console.log("\n--- Show All Stations ---");
    await showAllStations();

    console.log("\n--- Show Station by Number ---");
    await showStationByNumber(exampleStationNumber);

    console.log("\n--- Show Bikes at Station ---");
    await showBikesAtStation(exampleStationNumber);

    console.log("\n--- Show Bike by Number ---");
    await showBikeByNumber(exampleBikeNumber);
    
   } catch (err) {
    console.error("Error:", err);
  }
})();