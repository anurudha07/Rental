"use client";

import dynamic from "next/dynamic";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import FiltersBar from "./FiltersBar";
import FiltersFull from "./FiltersFull";
import { cleanParams } from "@/lib/utils";
import { setFilters, toggleFiltersFullOpen } from "@/state";
import Listings from "./Listings";

const Map = dynamic(() => import("./Map"), { ssr: false });

const SearchPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else {
          acc[key] = value === "any" ? null : value;
        }

        return acc;
      },
      {}
    );

    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /*
    Responsive strategy used below (keeps laptop/desktop behaviour unchanged):
    - On large screens (lg and up) the layout is identical to before: left FiltersFull (w-3/12 when open), center Map (flex-1), right Listings (basis-4/12).
    - On small screens we switch to a stacked column layout: FiltersBar -> Map -> Listings.
      * FiltersFull becomes a full-width overlay/drawer when open (absolute positioned) so it is usable on small devices without changing behaviour on desktop.
  */

  // class names are computed to keep JSX tidy and make the responsive rules explicit
  // NOTE: changed overlay inset on mobile to full screen (inset-0) but kept old behaviour for lg
  const filtersClass = isFiltersFullOpen
    ? "h-full overflow-auto transition-all duration-300 ease-in-out lg:static lg:block lg:w-3/12 lg:opacity-100 lg:visible w-full opacity-100 visible absolute inset-0 lg:inset-16 p-4 lg:p-3 bg-white z-50 rounded-md shadow-md"
    : "h-full overflow-auto transition-all duration-300 ease-in-out lg:static lg:block lg:w-0 lg:opacity-0 lg:invisible hidden lg:block";

  // map min-height: taller on mobile for usability (60vh), same 600px on lg and up
  const mapClass =
    "flex-1 min-h-[60vh] lg:min-h-[600px] rounded-md overflow-hidden";

  // listings: keep scrollable; slightly higher mobile max height so map/listings balance fine
  const listingsClass =
    "overflow-y-auto lg:overflow-y-auto lg:basis-4/12 w-full lg:w-auto max-h-[55vh] lg:max-h-full rounded-md";

  return (
    <div
      className="w-full mx-auto px-5 flex flex-col"
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      {/* Top filters bar (keeps previous behaviour) */}
      <FiltersBar />

      {/* Mobile floating FAB to open filters when closed */}
      <button
        className="lg:hidden fixed bottom-5 right-4 z-50 bg-primary-700 text-white p-3 rounded-full shadow-lg focus:ring focus:ring-primary-300"
        aria-label="Open filters"
        onClick={() => dispatch(toggleFiltersFullOpen())}
        title="Filters"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 3H2" />
          <path d="M16 12H8" />
          <path d="M18 21H6" />
        </svg>
      </button>

      {/* Main area: stacked on mobile (column), row on lg+ */}
      <div className="flex-1 mb-5 min-h-[600px] flex flex-col lg:flex-row gap-3">
        {/* Filters full panel
            - On lg it takes up a side column (w-3/12 when open)
            - On small screens it becomes a full overlay drawer when open (inset-0)
        */}
        <div className={filtersClass} aria-hidden={!isFiltersFullOpen}>
          <FiltersFull />
        </div>

        {/* Map: center piece. On mobile it sits above listings with a taller min-height for usability. */}
        <div className={mapClass}>
          <Map />
        </div>

        {/* Listings: on lg it's the right column (basis-4/12). On mobile it appears below the map and is scrollable. */}
        <div className={listingsClass}>
          <Listings />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
