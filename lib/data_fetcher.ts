// Warsaw Veturilo Public Bike System API Helper Library
// ---------------------------------------------------------------------
// This library fetches and formats bike and station data from Veturilo (Nextbike).
// Data source: https://veturilo.waw.pl/wp-json/nbmap/v1/data?target=https%3A%2F%2Fapi-gateway.nextbike.pl%2Fapi%2Fmaps%2Flocations%3FserviceUid%3Dvw

// --- TYPES ---

export enum BikeType {
  Standard = "Standard",
  Electric = "Electric",
  Tandem = "Tandem",
}

export interface Bike {
  number: number;
  type: BikeType;
  battery: number | null;
  stationNumber: number | null; // Only for bikes at stations, not applicable for freestanding bikes
  geoCoords: {
    lat: number;
    lng: number;
  };
}

export enum StationType {
  Station = "Station",
  FreestandingBike = "Freestanding Bike",
}

export interface Station {
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

interface RawStationData {
  uid: string;
  name: string;
  number: number;
  placeType: string;
  geoCoords: {
    lat: number;
    lng: number;
  };
  availabilityStatus: {
    bikes: number;
    availableBikes: number;
    freeRacks: number;
    bikeRacks: number;
  };
  bikes: {
    number: number;
    bikeType: string;
    battery: number | null;
  }[];
}

// --- INTERNAL FUNCTIONS ---

async function fetchRawStations(): Promise<RawStationData[]> {
  const url = "https://veturilo.waw.pl/wp-json/nbmap/v1/data?target=https%3A%2F%2Fapi-gateway.nextbike.pl%2Fapi%2Fmaps%2Flocations%3FserviceUid%3Dvw";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { cities?: { places?: RawStationData[] }[]; }[];
  return json?.[0]?.cities?.[0]?.places ?? [];
}

function mapRawStationToStation(station: RawStationData): Station {
  const standardBikes = station.bikes.filter(b => b.bikeType === "STANDARD_4G").length;
  const electricBikes = station.bikes.filter(b => b.bikeType === "ELECTRIC_4G").length;
  const tandemBikes = station.bikes.filter(b => b.bikeType === "TANDEM_4G").length;

  return {
    id: Number(station.uid),
    name: station.name,
    number: mapStationType(station.placeType) === StationType.Station ? Number(station.number) : null,
    placeType: mapStationType(station.placeType),
    geoCoords: {
      lat: station.geoCoords.lat,
      lng: station.geoCoords.lng,
    },
    availabilityStatus: {
      availableStandardBikes: standardBikes,
      availableElectricBikes: electricBikes,
      availableTandemBikes: tandemBikes,
    },
    bikes: station.bikes.map(bike => ({
      number: bike.number,
      type: mapBikeType(bike.bikeType),
      battery: bike.battery ?? null,
      stationNumber: mapStationType(station.placeType) === StationType.Station ? Number(station.number) : null,
      geoCoords: {
        lat: station.geoCoords.lat,
        lng: station.geoCoords.lng,
      },
    })),
  };
}

function mapBikeType(rawType: string): BikeType {
  switch (rawType) {
    case "STANDARD_4G":
      return BikeType.Standard;
    case "ELECTRIC_4G":
      return BikeType.Electric;
    case "TANDEM_4G":
      return BikeType.Tandem;
    default:
      throw new Error(`Unknown bike type: ${rawType}`);
  }
}

function mapStationType(rawType: string): StationType {
  switch (rawType) {
    case "STATION":
      return StationType.Station;
    case "FREESTANDING_BIKE":
    case "FREESTANDING_ELECTRIC_BIKE":
    case "FREESTANDING_TANDEM_BIKE":
      return StationType.FreestandingBike;
    default:
      throw new Error(`Unknown station type: ${rawType}`);
  }
}

// --- API FUNCTIONS ---

export async function getAllStations(): Promise<Station[]> {
  const stations = await fetchRawStations();
  return stations.map(mapRawStationToStation);
}

export async function getStationByNumber(stationNumber: number): Promise<Station | null> {
  const stations = await fetchRawStations();
  const station = stations.find(s => s.number === stationNumber);
  return station ? mapRawStationToStation(station) : null;
}

export async function getBikeByNumber(bikeNumber: number): Promise<Bike | null> {
  const stations = await fetchRawStations();
  for (const station of stations) {
    const bike = station.bikes.find(b => b.number === bikeNumber);
    if (bike) {
      return {
        number: bike.number,
        type: mapBikeType(bike.bikeType),
        battery: bike.battery ?? null,
        stationNumber: mapStationType(station.placeType) === StationType.Station ? Number(station.number) : null,
        geoCoords: {
          lat: station.geoCoords.lat,
          lng: station.geoCoords.lng,
        },
      };
    }
  }
  return null;
}

export async function getBikesAtStation(stationNumber: number): Promise<Bike[]> {
  const station = await getStationByNumber(stationNumber);
  if (!station) return [];

  return station.bikes.map((bike: Bike) => ({
    number: Number(bike.number),
    type: bike.type,
    battery: bike.battery ?? null,
    stationNumber: station.number, 
    geoCoords: {
      lat: bike.geoCoords.lat,
      lng: bike.geoCoords.lng,
    },
  }));
}