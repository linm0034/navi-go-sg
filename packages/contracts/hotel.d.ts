export type HotelItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  price: number;
  score: number;
};

export type HotelSearchResponse = {
  items: HotelItem[];
  total: number;
  requestId: string;
};