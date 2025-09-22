"use client"
import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import {
  Application,
  Lease,
  Manager,
  Payment,
  Property,
  Tenant,
} from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FiltersState } from ".";

type AuthUser = {
  cognitoInfo: { userId: string };
  userInfo: Tenant | Manager | { name?: string; email?: string; phoneNumber?: string };
  userRole: string; // "tenant" | "manager" | etc.
};
const TOKEN_STORAGE_KEY = "token";

/** Parse JWT payload without external dep (returns payload object or null) */
function parseJwtPayload(token?: string) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = JSON.parse(
      decodeURIComponent(
        atob(payload)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      )
    );
    return decoded;
  } catch (err) {
    console.warn("Failed to parse JWT payload", err);
    return null;
  }
}

/**
 * NOTE: prefer NEXT_PUBLIC_API_URL in .env (you already have NEXT_PUBLIC_API_URL)
 * The API base becomes <PUBLIC_BASE>/api so endpoint strings like "properties" map to /api/properties
 */
const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const API_PREFIXED_BASE = `${PUBLIC_BASE.replace(/\/$/, "")}/api`;

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: API_PREFIXED_BASE,
    prepareHeaders: async (headers) => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (err) {
        console.warn("prepareHeaders: localStorage unavailable", err);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "Managers",
    "Tenants",
    "Properties",
    "PropertyDetails",
    "Leases",
    "Payments",
    "Applications",
  ],
  endpoints: (build) => ({
    /**
     * getAuthUser
     * This calls the backend protected /api/auth/me endpoint when a token is present.
     * Returns the same AuthUser shape used across the app.
     */
    getAuthUser: build.query<AuthUser, void>({
      // custom queryFn because we first need to check for token presence
      async queryFn(_, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
          if (!token) {
            return { error: { status: 401, data: "No auth token" } as any };
          }

          // baseUrl already contains /api, so call "auth/me"
          const result = await fetchWithBQ("auth/me");

          // fetchWithBQ returns { data } or { error }
          if ((result as any).error) {
            // If backend returns 404 or 401, try to parse token and fallback to minimal data
            const err = (result as any).error;
            // 401 -> token invalid or expired
            if (err.status === 401) {
              return { error: err } as any;
            }

            // 404 or other -> try to decode token and return a minimal auth object
            const payload = parseJwtPayload(token);
            if (!payload) {
              return { error: { status: 401, data: "Invalid token" } as any };
            }
            const userId = payload.sub as string;
            const userRole = (payload.role as string) || (payload["custom:role"] as string) || "";

            // attempt to fetch tenant/manager record directly if possible
            const endpoint = userRole === "manager" ? `managers/${userId}` : `tenants/${userId}`;
            const direct = await fetchWithBQ(endpoint);

            if ((direct as any).data) {
              return {
                data: {
                  cognitoInfo: { userId },
                  userInfo: (direct as any).data,
                  userRole,
                },
              } as { data: AuthUser };
            }

            // fallback to minimal
            return {
              data: {
                cognitoInfo: { userId },
                userInfo: { name: payload.name ?? "", email: payload.email ?? "" },
                userRole,
              },
            } as { data: AuthUser };
          }

          // success: backend returned { authUser }
          const responseData = (result as any).data;
          // Accept either { authUser } or direct authUser in body
          const authUser = responseData?.authUser ?? responseData;

          return { data: authUser } as { data: AuthUser };
        } catch (error: any) {
          return { error: { status: "CUSTOM_ERROR", data: error.message || "Could not fetch user data" } } as any;
        }
      },
      // don't cache too long; auth state updates should revalidate
      // (you can configure extra options at call sites)
    }),

    // ------ properties endpoints (no changes to queries) ------
    getProperties: build.query<Property[], Partial<FiltersState> & { favoriteIds?: number[] }>(
      {
        query: (filters) => {
          const params = cleanParams({
            location: filters.location,
            priceMin: filters.priceRange?.[0],
            priceMax: filters.priceRange?.[1],
            beds: filters.beds,
            baths: filters.baths,
            propertyType: filters.propertyType,
            squareFeetMin: filters.squareFeet?.[0],
            squareFeetMax: filters.squareFeet?.[1],
            amenities: filters.amenities?.join(","),
            availableFrom: filters.availableFrom,
            favoriteIds: filters.favoriteIds?.join(","),
            latitude: filters.coordinates?.[1],
            longitude: filters.coordinates?.[0],
          });

          return { url: "properties", params };
        },
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ id }) => ({ type: "Properties" as const, id })),
                { type: "Properties", id: "LIST" },
              ]
            : [{ type: "Properties", id: "LIST" }],
        async onQueryStarted(_, { queryFulfilled }) {
          await withToast(queryFulfilled, {
            error: "Failed to fetch properties.",
          });
        },
      }
    ),

    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load property details.",
        });
      },
    }),

    // tenant endpoints...
    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load tenant profile.",
        });
      },
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch current residences.",
        });
      },
    }),

    updateTenantSettings: build.mutation<Tenant, { cognitoId: string } & Partial<Tenant>>({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    addFavoriteProperty: build.mutation<Tenant, { cognitoId: string; propertyId: number }>({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Added to favorites!!",
          error: "Failed to add to favorites",
        });
      },
    }),

    removeFavoriteProperty: build.mutation<Tenant, { cognitoId: string; propertyId: number }>({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Removed from favorites!",
          error: "Failed to remove from favorites.",
        });
      },
    }),

    // manager endpoints...
    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `managers/${cognitoId}/properties`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load manager profile.",
        });
      },
    }),

    updateManagerSettings: build.mutation<Manager, { cognitoId: string } & Partial<Manager>>({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        { type: "Managers", id: result?.manager?.id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),

    // leases, payments, applications ...
    getLeases: build.query<Lease[], number>({
      query: () => "leases",
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases`,
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch property leases.",
        });
      },
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payment info.",
        });
      },
    }),

    getApplications: build.query<Application[], { userId?: string; userType?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) {
          queryParams.append("userId", params.userId.toString());
        }
        if (params.userType) {
          queryParams.append("userType", params.userType);
        }

        return `applications?${queryParams.toString()}`;
      },
      providesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),

    updateApplicationStatus: build.mutation<Application & { lease?: Lease }, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application status updated successfully!",
          error: "Failed to update application settings.",
        });
      },
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application created successfully!",
          error: "Failed to create applications.",
        });
      },
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useCreatePropertyMutation,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
} = api;
