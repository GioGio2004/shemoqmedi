"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

// Sleek dark mode map style (muted colors, dark background, low contrast)
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#111111" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

interface CustomVenueMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
}

export default function CustomVenueMap({ lat, lng, zoom = 16, title = "Venue Location" }: CustomVenueMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Only load the API key on the client to avoid SSR hydration mismatches
    // if env vars differ or are missing initially
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "");
  }, []);

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-zinc-900 border border-white/10 flex items-center justify-center rounded-xl">
        <p className="text-[10px] text-white/30 uppercase tracking-widest">Loading Map...</p>
      </div>
    );
  }

  const position = { lat, lng };

  return (
    <APIProvider apiKey={apiKey} version="weekly">
      <Map
        defaultCenter={position}
        defaultZoom={zoom}
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        gestureHandling="cooperative"
        colorScheme="DARK"
        styles={DARK_MAP_STYLE}
        mapId="custom-venue-map" // Needed for AdvancedMarkerElement
        className="w-full h-full rounded-xl overflow-hidden"
      >
        <AdvancedMarker position={position} title={title}>
          <div className="flex flex-col items-center justify-center -mt-6">
            <svg
              width="32"
              height="40"
              viewBox="0 0 32 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* Outer Glow / Base */}
              <path
                d="M16 0C7.163 0 0 7.163 0 16C0 26.5 16 40 16 40C16 40 32 26.5 32 16C32 7.163 24.837 0 16 0Z"
                fill="url(#paint0_linear)"
                className="opacity-90"
              />
              <path
                d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16C2.5 24.965 16 36.197 16 36.197C16 36.197 29.5 24.965 29.5 16C29.5 8.544 23.456 2.5 16 2.5Z"
                fill="#000"
              />
              {/* Inner dot */}
              <circle cx="16" cy="16" r="6" fill="#10B981" />
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="16"
                  y1="0"
                  x2="16"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#10B981" />
                  <stop offset="1" stopColor="#047857" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}
