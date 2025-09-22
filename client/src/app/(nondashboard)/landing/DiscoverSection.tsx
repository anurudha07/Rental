"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DiscoverSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={containerVariants}
      className="py-12 bg-white mb-16 w-full"
      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }}
    >
      <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div variants={itemVariants} className="my-12 text-center px-2 sm:px-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-gray-800">
            Discover
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Find your dream rental property today!
          </p>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Searching for your dream rental property has never been easier. Use our user-friendly search feature to quickly find the perfect home that meets all your needs. Start your search today and discover your dream rental property!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center px-2 sm:px-0">
          {[
            {
              imageSrc: "/landing-icon-wand.png",
              title: "Search for Properties",
              description:
                "Browse through our extensive collection of rental properties in your desired location.",
            },
            {
              imageSrc: "/landing-icon-calendar.png",
              title: "Book Your Rental",
              description:
                "Once you've found the perfect rental property, easily book it online with just a few clicks.",
            },
            {
              imageSrc: "/landing-icon-heart.png",
              title: "Enjoy Your New Home",
              description:
                "Move into your new rental property and start enjoying your dream home.",
            },
          ].map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <DiscoverCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const DiscoverCard = ({
  imageSrc,
  title,
  description,
}: {
  imageSrc: string;
  title: string;
  description: string;
}) => (
  <div className="px-4 py-6 md:py-8 shadow-md rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 ease-in-out cursor-pointer w-full">
    <div className="bg-gray-800 p-2 rounded-full mb-4 h-10 w-10 mx-auto flex items-center justify-center">
      <Image src={imageSrc} width={24} height={24} alt={title} />
    </div>
    <h3 className="mt-2 text-sm md:text-base font-medium text-gray-800">{title}</h3>
    <p className="mt-1 text-xs md:text-sm text-gray-600">{description}</p>
  </div>
);

export default DiscoverSection;
