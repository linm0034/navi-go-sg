import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapCameraChangedEvent,
  useMap,
  Pin,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';

type Poi = { key: string; location: google.maps.LatLngLiteral };

const kmlUrl = '/HotelLocations.kml';

function fetchKml(url: string): Promise<any> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch KML file');
      }
      return response.text();
    })
    .then((data) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'application/xml');

      const error = xmlDoc.querySelector('parsererror');
      if (error) {
        throw new Error('Error parsing KML data');
      }

      return xmlDoc;
    });
}

const App = () => {
  const [locations, setLocations] = useState<Poi[]>([]);

  useEffect(() => {
    fetchKml(kmlUrl)
      .then((parsedKml) => {
        const placemarks = parsedKml.getElementsByTagName('Placemark');
        const locations: Poi[] = [];

        for (let i = 0; i < placemarks.length; i++) {
          const placemark = placemarks[i];

          const nameElement = placemark.querySelector('SimpleData[name="NAME"]');
          const name = nameElement ? nameElement.textContent : 'Unnamed Place';

          const coordinatesElement = placemark.getElementsByTagName('coordinates')[0];
          const coordinatesText = coordinatesElement ? coordinatesElement.textContent : '';
          const coordinates = coordinatesText.trim().split(',');

          locations.push({
            key: name.replace(/\s+/g, '').toLowerCase(),
            location: {
              lat: parseFloat(coordinates[1]),
              lng: parseFloat(coordinates[0]),
            },
          });
        }

        setLocations(locations); // Set the state with the locations
      })
      .catch((error) => {
        console.error('Error fetching KML:', error);
      });
  }, []);
  
  return (
    <APIProvider
      apiKey={'AIzaSyDeR6Hy8nbGdxyllA2TAmRFotc6fELGDGc'}
      onLoad={() => console.log('Maps API has loaded.')}
    >
      <Map
        defaultZoom={13}
        defaultCenter={{ lat: 1.364917, lng: 103.822872 }}
        mapId="DEMO_MAP_ID"
        onCameraChanged={(ev: MapCameraChangedEvent) =>
          console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
        }
      >
        <PoiMarkers pois={locations} />
      </Map>
    </APIProvider>
  );
};

const PoiMarkers = (props: { pois: Poi[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  const handleClick = useCallback((ev: google.maps.MapMouseEvent) => {
    if (!map) return;
    if (!ev.latLng) return;
    console.log('marker clicked:', ev.latLng.toString());
    map.panTo(ev.latLng);
  });

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return (
    <>
      {props.pois.map((poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          clickable={true}
          onClick={handleClick}
          ref={(marker) => setMarkerRef(marker, poi.key)}
        >
          <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

const root = createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);

export default App;
