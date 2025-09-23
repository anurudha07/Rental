"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";
import { CircleCheckBig, Download, File, Hospital } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "manager",
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  const handleStatusChange = async (id: number, status: string) => {
    await updateApplicationStatus({ id, status });
  };

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  const filteredApplications = applications?.filter((application) => {
    if (activeTab === "all") return true;
    return application.status.toLowerCase() === activeTab;
  });

  return (
    <div className="dashboard-container">
      <Header
        title="Applications"
        subtitle="View and manage applications for your properties"
      />
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full my-5"
      >
        {/* TabsList: scrollable on mobile, grid on md+ */}
        <TabsList className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide p-1 md:grid md:grid-cols-4 md:gap-0 md:p-0 w-full">
          <TabsTrigger value="all" className="flex-shrink-0 md:flex-shrink md:px-4">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-shrink-0 md:flex-shrink md:px-4">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-shrink-0 md:flex-shrink md:px-4">
            Approved
          </TabsTrigger>
          <TabsTrigger value="denied" className="flex-shrink-0 md:flex-shrink md:px-4">
            Denied
          </TabsTrigger>
        </TabsList>

        {["all", "pending", "approved", "denied"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5 w-full">
            {filteredApplications
              .filter(
                (application) =>
                  tab === "all" || application.status.toLowerCase() === tab
              )
              .map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  userType="manager"
                >
                  {/* Footer: stack on mobile, row on md+ */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full pb-4 px-4">
                    {/* Colored Section Status - full width on mobile */}
                    <div
                      className={`p-4 text-green-700 w-full md:grow rounded-md ${
                        application.status === "Approved"
                          ? "bg-green-100"
                          : application.status === "Denied"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <File className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                          Application submitted on{" "}
                          {new Date(
                            application.applicationDate
                          ).toLocaleDateString()}
                          .
                        </span>

                        <CircleCheckBig className="w-5 h-5 mr-2 flex-shrink-0" />

                        <span
                          className={`font-semibold text-sm ${
                            application.status === "Approved"
                              ? "text-green-800"
                              : application.status === "Denied"
                              ? "text-red-800"
                              : "text-yellow-800"
                          }`}
                        >
                          {application.status === "Approved" &&
                            "This application has been approved."}
                          {application.status === "Denied" &&
                            "This application has been denied."}
                          {application.status === "Pending" &&
                            "This application is pending review."}
                        </span>
                      </div>
                    </div>

                    {/* Right Buttons - full width stacked on mobile, inline on md+ */}
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-stretch md:items-center">
                      <Link
                        href={`/managers/properties/${application.property.id}`}
                        className={`bg-white border border-gray-300 text-gray-700 py-2 px-4 
                          rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50 w-full md:w-auto`}
                        scroll={false}
                      >
                        <Hospital className="w-5 h-5 mr-2" />
                        Property Details
                      </Link>

                      {application.status === "Approved" && (
                        <button
                          className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                          rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50 w-full md:w-auto`}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download Agreement
                        </button>
                      )}

                      {application.status === "Pending" && (
                        <>
                          <button
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-500 w-full md:w-auto"
                            onClick={() =>
                              handleStatusChange(application.id, "Approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-500 w-full md:w-auto"
                            onClick={() =>
                              handleStatusChange(application.id, "Denied")
                            }
                          >
                            Deny
                          </button>
                        </>
                      )}

                      {application.status === "Denied" && (
                        <button
                          className={`bg-gray-800 text-white py-2 px-4 rounded-md flex items-center
                          justify-center hover:bg-secondary-500 hover:text-primary-50 w-full md:w-auto`}
                        >
                          Contact User
                        </button>
                      )}
                    </div>
                  </div>
                </ApplicationCard>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Applications;
