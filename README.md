# Warsaw Veturilo Public Bike System API Helper

This library provides easy access to real-time data from the **Warsaw Veturilo (Nextbike)** public bicycle system.   
It fetches, parses, and exposes structured information about bike stations, availability, and individual bikes in JSON format.

**Note:** This library only provides data for bikes that are currently parked and available, not those that are rented out.

## Installation
Issue `npm install veturilo-api-helper` in your project folder.

## Data Source

All data is retrieved from the publicaly available official Nextbike API via the following endpoint:
```
https://veturilo.waw.pl/wp-json/nbmap/v1/data?target=https://api-gateway.nextbike.pl/api/maps/locations?serviceUid=vw
```

## Features
- Retrieve all stations with geolocation and bike availability status
- Fetch bikes at a specific station
- Find a station by its number
- Search for a specific bike by its number

## Usage
Check example code: [example_usage.ts](/example/example_usage.ts)

### 1. Import the library

```ts
import {
  getAllStations,
  getStationByNumber,
  getBikesAtStation,
  getBikeByNumber,
  Station,
  Bike,
  StationType,
  BikeType
} from "veturilo-api-helper";
```

### 2. Example: Get all stations

```ts
const stations = await getAllStations();
console.log("Total stations:", stations.length);
console.log("First station:", stations[0]);
```

### 3. Example: Find a station by number

```ts
const station = await getStationByNumber(9648);
if (station) {
  console.log("Station name:", station.name);
  console.log("Available standard bikes:", station.availabilityStatus.availableStandardBikes);
}
```

### 4. Example: List bikes at a station

```ts
const bikes = await getBikesAtStation(9648);
bikes.forEach(bike => {
  console.log(`Bike #${bike.number}: Type=${bike.type}, Battery=${bike.battery ?? "N/A"}`);
});
```

### 5. Example: Find a bike by its number

```ts
const bike = await getBikeByNumber(613712);
console.log(
    `Bike #${index + 1}: Number=${bike.number}, Type=${bike.type}, Battery=${bike.battery ?? "N/A"}, Coordinates=(${bike.geoCoords.lat}, ${bike.geoCoords.lng}), Station Number=${bike.stationNumber ?? "N/A"}`
);
```

## Type Definitions

### `Station`

```ts
export enum StationType {
  Station = "Station",
  FreestandingBike = "Freestanding Bike",
}

interface Station {
  id: number;
  name: string;
  number: number | null;
  placeType: StationType;
  geoCoords: {
    lat: number;
    lng: number;
  };
  availabilityStatus: {
    availableStandardBikes: number;
    availableElectricBikes: number;
    availableTandemBikes: number;
  };
  bikes: Bike[];
}
```

### `Bike`

```ts
export enum BikeType {
  Standard = "Standard",
  Electric = "Electric",
  Tandem = "Tandem",
}

export interface Bike {
  number: number;
  type: BikeType;
  battery: number | null;
  stationNumber: number | null; 
  geoCoords: {
    lat: number;
    lng: number;
  };
}
```

## Notes
- The Veturilo system supports renting bikes that are not parked at any station. Such bikes are known as "freestanding bikes" and in the system appear as special single-bike stations with `station.number` set to `null`.
- Battery level is only available for electric bikes; for others, it's `null`.
- You can run the provided usage examples by executing `npm run example` in the library directory.

## Disclaimer
This project is not affiliated with Veturilo, Nextbike, or any official operator.  
It uses publicly available data from the [veturilo.waw.pl](https://veturilo.waw.pl) website to make it easier to work with real-time bike availability in Warsaw. Please respect their infrastructure and check their Terms of Service before using this in production.