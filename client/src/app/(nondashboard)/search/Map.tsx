"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import type { Property } from "@/types/prismaTypes";
import type { Map, Marker, NavigationControl } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

const FALLBACK_STYLE = "mapbox://styles/mapbox/streets-v11";

export default function MapComponent() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const mapboxRef = useRef<any>(null); // Mapbox module
  const markersRef = useRef<Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  const filters = useAppSelector((s) => s.global.filters);
  const { data: properties, isLoading, isError } = useGetPropertiesQuery(filters);

  const USER_STYLE = process.env.NEXT_PUBLIC_MAPBOX_STYLE || FALLBACK_STYLE;
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  /** Initialize Map */
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    const token = (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "").trim();
    if (!token) {
      setMapError("Missing Mapbox access token. Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local");
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const mapboxglModule = await import("mapbox-gl");
        const mapboxgl = (mapboxglModule as any).default ?? mapboxglModule;
        mapboxRef.current = mapboxgl;
        mapboxgl.accessToken = token;

        const center: [number, number] =
          Array.isArray(filters.coordinates) && filters.coordinates.length === 2
            ? [filters.coordinates[0], filters.coordinates[1]]
            : [-74.5, 40];

        const mapInstance: Map = new mapboxgl.Map({
          container: containerRef.current!,
          style: USER_STYLE,
          center,
          zoom: 9,
        });

        mapRef.current = mapInstance;

        mapInstance.on("error", (ev: any) => {
          console.warn("Mapbox error:", ev);
          if (ev?.error?.status === 404) {
            setMapError("Custom style not found. Falling back to default.");
            mapInstance.setStyle(FALLBACK_STYLE);
          } else if (ev?.error?.message) {
            setMapError(ev.error.message);
          }
        });

        mapInstance.on("styledata", () => {
          setMapError(null);
        });

        mapInstance.addControl(new mapboxgl.NavigationControl() as NavigationControl, "top-right");

        setTimeout(() => mapInstance.resize(), 300);
      } catch (err: any) {
        console.error("Mapbox initialization failed:", err);
        setMapError(err?.message ?? "Failed to initialize map");
      }
    })();

    return () => {
      mounted = false;
      // Cleanup
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
      }
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, [filters.coordinates]);

  /** Update markers */
  useEffect(() => {
    const m = mapRef.current;
    const mapbox = mapboxRef.current;
    if (!m || !mapbox) return;

    // Remove old markers
    markersRef.current.forEach((mk) => mk.remove());
    markersRef.current = [];

    if (!properties || isLoading || isError) return;

    (properties as Property[]).forEach((property) => {
      const coords = property?.location?.coordinates;
      if (!coords) return;
      const { longitude, latitude } = coords;
      if (typeof longitude !== "number" || typeof latitude !== "number") return;

      try {
        const marker = new mapbox.Marker()
          .setLngLat([longitude, latitude])
          .addTo(m);
        markersRef.current.push(marker);
      } catch (err) {
        console.error("Marker failed for property", property?.id, err);
      }
    });
  }, [properties, isLoading, isError]);

  /** Recenter map on filter change */
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    if (
      Array.isArray(filters.coordinates) &&
      filters.coordinates.length === 2 &&
      typeof filters.coordinates[0] === "number" &&
      typeof filters.coordinates[1] === "number"
    ) {
      m.setCenter([filters.coordinates[0], filters.coordinates[1]]);
    }
  }, [filters.coordinates]);

  return (
    <div className="relative">
      {/* Map container must remain empty */}
      <div
        ref={containerRef}
        className="w-full h-full rounded-xl min-h-[60vh] lg:min-h-[600px]"
        role="region"
        aria-label="Properties map"
      />
      {mapError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 border border-red-200 px-4 py-2 rounded-md z-50 max-w-md text-sm">
          <strong>Map error:</strong> {mapError}
        </div>
      )}
    </div>
  );
}
