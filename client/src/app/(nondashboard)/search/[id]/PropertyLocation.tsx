"use client";

import { useGetPropertyQuery } from "@/state/api";
import { Compass, MapPin } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface PropertyLocationProps {
  propertyId: number; // <-- change to number
}

const PropertyLocation = ({ propertyId }: PropertyLocationProps) => {
  const { data: property, isError, isLoading } = useGetPropertyQuery(propertyId);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || isError || !property) return;

    let map: any = null;
    let marker: any = null;

    (async () => {
      const mapboxglModule = await import("mapbox-gl");
      const mapboxgl = (mapboxglModule as any).default ?? mapboxglModule;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

      if (!mapContainerRef.current) return;

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/majesticglue/cm6u301pq008b01sl7yk1cnvb",
        center: [
          property.location.coordinates.longitude,
          property.location.coordinates.latitude,
        ],
        zoom: 14,
      });

      marker = new mapboxgl.Marker()
        .setLngLat([
          property.location.coordinates.longitude,
          property.location.coordinates.latitude,
        ])
        .addTo(map);

      try {
        const markerEl = marker.getElement();
        const path = markerEl.querySelector("path[fill='#3FB1CE']");
        if (path) (path as SVGPathElement).setAttribute("fill", "#000000");
      } catch {}
    })();

    return () => map?.remove();
  }, [property, isError, isLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !property) return <div>Property not Found</div>;

  return (
    <div className="py-16">
      <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
        Map and Location
      </h3>
      <div className="flex justify-between items-center text-sm text-primary-500 mt-2">
        <div className="flex items-center text-gray-500">
          <MapPin className="w-4 h-4 mr-1 text-gray-700" />
          Property Address:
          <span className="ml-2 font-semibold text-gray-700">
            {property.location?.address || "Address not available"}
          </span>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            property.location?.address || ""
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between items-center hover:underline gap-2 text-primary-600"
        >
          <Compass className="w-5 h-5" />
          Get Directions
        </a>
      </div>
      <div
        className="relative mt-4 h-[300px] rounded-lg overflow-hidden"
        ref={mapContainerRef}
      />
    </div>
  );
};

export default PropertyLocation;
