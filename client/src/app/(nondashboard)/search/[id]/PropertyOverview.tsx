"use client";
import { useGetPropertyQuery } from "@/state/api";
import { MapPin, Star } from "lucide-react";
import React from "react";

type PropertyOverviewProps = {
  propertyId: number;
};

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const { data: property, isError, isLoading } = useGetPropertyQuery(propertyId);

  if (isLoading) return <>Loading...</>;
  if (isError || !property) {
    return <>Property not Found</>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          {property.location?.country} / {property.location?.state} /{" "}
          <span className="font-semibold text-gray-600">
            {property.location?.city}
          </span>
        </div>

        {/* Title: slightly smaller on very small screens, same on md+ */}
        <h1 className="text-2xl md:text-3xl font-bold my-5">{property.name}</h1>

        {/* Location + rating: stack on mobile, unchanged on md+ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <span className="flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-gray-700" />
            {property.location?.city}, {property.location?.state},{" "}
            {property.location?.country}
          </span>

          <div className="flex items-center gap-3">
            <span className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {property.averageRating.toFixed(1)} ({property.numberOfReviews}{" "}
              Reviews)
            </span>
            <span className="text-green-600">Verified Listing</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="border border-primary-200 rounded-xl p-6 mb-6">
        {/* Stack stats vertically on mobile, keep horizontal layout on md+ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 md:px-5">
          <div className="w-full md:w-auto flex justify-between md:block">
            <div className="text-sm text-gray-500">Monthly Rent</div>
            <div className="font-semibold">
              ${property.pricePerMonth.toLocaleString()}
            </div>
          </div>

          {/* separator only visible on md+ so desktop remains identical */}
          <div className="hidden md:block border-l border-gray-300 h-10" />

          <div className="w-full md:w-auto flex justify-between md:block">
            <div className="text-sm text-gray-500">Bedrooms</div>
            <div className="font-semibold">{property.beds} bd</div>
          </div>

          <div className="hidden md:block border-l border-gray-300 h-10" />

          <div className="w-full md:w-auto flex justify-between md:block">
            <div className="text-sm text-gray-500">Bathrooms</div>
            <div className="font-semibold">{property.baths} ba</div>
          </div>

          <div className="hidden md:block border-l border-gray-300 h-10" />

          <div className="w-full md:w-auto flex justify-between md:block">
            <div className="text-sm text-gray-500">Square Feet</div>
            <div className="font-semibold">
              {property.squareFeet.toLocaleString()} sq ft
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="my-8 md:my-16">
        <h2 className="text-xl font-semibold mb-5">About {property.name}</h2>
        <p className="text-gray-500 leading-7 text-sm md:text-base">
          {property.description}
          Experience resort style luxury living at Seacrest Homes, where the
          ocean and city are seamlessly intertwined. Our newly built community
          features sophisticated two and three-bedroom residences, each complete
          with high end designer finishes, quartz counter tops, stainless steel
          whirlpool appliances, office nook, and a full size in-unit washer and
          dryer. Find your personal escape at home beside stunning swimming
          pools and spas with poolside cabanas. Experience your very own oasis
          surrounded by lavish landscaped courtyards, with indoor/outdoor
          entertainment seating. By day, lounge in the BBQ area and experience
          the breath taking unobstructed views stretching from the Palos Verdes
          Peninsula to Downtown Los Angeles, or watch the beauty of the South
          Bay skyline light up by night. Start or end your day with a workout in
          our full-size state of the art fitness club and yoga studio. Save the
          commute and plan your next meeting in the business centers conference
          room, adjacent to our internet and coffee lounge. Conveniently located
          near beautiful local beaches with easy access to the 110, 405 and 91
          freeways, exclusive shopping at the largest mall in the Western United
          States “The Del Amo Fashion Center” to the hospital of your choice,
          Kaiser Hospital, UCLA Harbor Medical Center, Torrance Memorial Medical
          Center, and Providence Little Company of Mary Hospital Torrance rated
          one of the top 10 Best in Los Angeles. Contact us today to tour and
          embrace the Seacrest luxury lifestyle as your own. Seacrest Homes
          Apartments is an apartment community located in Los Angeles County and
          the 90501 ZIP Code. This area is served by the Los Angeles Unified
          attendance zone.
        </p>
      </div>
    </div>
  );
};

export default PropertyOverview;
