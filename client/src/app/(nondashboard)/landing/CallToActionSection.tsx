"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const CallToActionSection = () => {
  return (
    <div className="relative py-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100">
      {/* Overlay shapes or gradient effects can be added here for extra style */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left"
      >
        <div className="mb-6 md:mb-0 md:mr-10">
          <h2 className="text-xl sm:text-xl md:text-3xl font-normal text-black">
            Find Your Dream Rental Property
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-sm text-gray-400">
            Discover a wide range of rental properties in your preferred location and make your move effortless.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 justify-center md:justify-start">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-6 py-2 rounded-lg bg-black text-white text-xs sm:text-sm font-normal hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
          <Link
            href="/signup"
            scroll={false}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white text-xs sm:text-sm font-normal hover:bg-gray-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CallToActionSection;
