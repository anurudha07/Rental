"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";

const HeroSection = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: trimmedQuery,
            coordinates: [lng, lat],
          })
        );
        const params = new URLSearchParams({
          location: trimmedQuery,
          lat: lat.toString(),
          lng: lng,
        });
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("error search location:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-gray-50 via-gray-100 to-gray-600 flex items-center justify-center font-sans py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center w-full px-4"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900 font-normal">
            Rental 
          </h1>

          <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">
            Explore our wide range of rental properties tailored to fit your lifestyle and needs!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-0 mt-3">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, neighborhood or address"
              className="w-full sm:max-w-lg rounded-none rounded-l-xl border-none bg-white h-9 sm:h-10 text-xs placeholder-gray-500 focus:bg-gray-200 transition-colors"
            />
            <Button
              onClick={handleLocationSearch}
              className="bg-black text-white rounded-none rounded-r-xl border-none h-9 sm:h-10 text-xs hover:bg-gray-800 transition-colors"
            >
              Search
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs md:text-xs text-gray-600 mt-1">
            Use our filters to quickly narrow down the homes that fit your needs.
          </p>

          {/* Beautiful Paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="bg- p-4 sm:p-6 mt-4 text-gray-800 text-[10px] sm:text-xs md:text-sm shadow-md border border-gray-200"
          >
            🏡 <strong>Why choose us?</strong> We provide a seamless rental experience with advanced search filters, verified listings, and personalized recommendations to help you find the perfect home quickly and confidently.
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
