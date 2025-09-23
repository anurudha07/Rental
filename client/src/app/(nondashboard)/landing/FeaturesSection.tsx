"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetAuthUserQuery } from "@/state/api";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeaturesSection = () => {
  const router = useRouter();
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  const features = [
    {
      imageSrc: "/landing-search3.png",
      title: "Trustworthy and Verified Listings",
      description:
        "Discover the best rental options with user reviews and ratings.",
    },
    {
      imageSrc: "/landing-search2.png",
      title: "Browse Rental Listings with Ease",
      description:
        "Get access to user reviews and ratings for a better understanding of rental options.",
      linkText: "Let's Go",
      linkHref: "/search",
    },
    {
      imageSrc: "/landing-search1.png",
      title: "Simplify Your Rental Search",
      description:
        "Find trustworthy and verified rental listings to ensure a hassle-free experience.",
    },
  ];

  const handleCTA = (href?: string) => {
    // If auth state still loading, do nothing (or you could show a spinner)
    if (!authUser && !isLoading) {
      router.push("/signin");
      return;
    }
    router.push(href ?? "/search");
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-24 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white"
      style={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div className="max-w-4xl xl:max-w-6xl mx-auto">
        <motion.h2
          variants={itemVariants}
          className="text-sm sm:text-base text-center mb-12 w-full sm:w-2/3 mx-auto"
        >
          Quickly find the home you want using our effective search filters!
        </motion.h2>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard
                {...feature}
                showButton={index === 1}
                onCTAClick={() => handleCTA(feature.linkHref)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile button at the end */}
        <div className="mt-6 md:hidden text-center">
          <button
            onClick={() => handleCTA("/search")}
            className="inline-block border border-gray-300 rounded px-6 py-3 text-base font-medium hover:bg-gray-100 transition-colors"
            type="button"
          >
            {"Let's Go"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
  showButton,
  onCTAClick,
}: {
  imageSrc: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  showButton?: boolean;
  onCTAClick?: () => void;
}) => (
  <div className="text-center">
    <div className="p-4 rounded-lg mb-4 flex items-center justify-center h-48">
      <Image
        src={imageSrc}
        width={400}
        height={400}
        className="w-full h-full object-contain"
        alt={title}
      />
    </div>
    <h3 className="text-base font-normal mb-1">{title}</h3>
    <p className="text-xs text-gray-700 mb-6">{description}</p>

    {/* Desktop button */}
    {showButton && linkHref && linkText && (
      <div className="hidden md:block">
        <button
          onClick={onCTAClick}
          className="inline-block border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors mt-4"
          type="button"
        >
          {linkText}
        </button>
      </div>
    )}
  </div>
);

export default FeaturesSection;
