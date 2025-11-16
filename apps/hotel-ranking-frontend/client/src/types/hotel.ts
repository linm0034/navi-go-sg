export interface Hotel {
  name: string;
  overallScore: number;
  price: number;
  latitude: number;
  longitude: number;
  filterScores: Record<string, number>;
}

export type SortType = 'overall' | 'price_low' | 'price_high' | 'filter';

export type FilterType = 'hawker' | 'mrt' | 'bus' | 'money' | 'attraction' | 'wifi';

export const FILTER_LABELS: Record<FilterType, string> = {
  hawker: 'Hawker Centres',
  mrt: 'MRT Stations',
  bus: 'Bus Stops',
  money: 'Money Changers',
  attraction: 'Tourist Attractions',
  wifi: 'Wireless Hotspots',
};
