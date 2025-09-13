/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "../api";
import { useUpdateProfile } from "./user";

// Get location from IP
const getLocationFromIP = async () => {
  try {
    const { data } = await api.get("auth/location");

    if (!data) {
      throw new Error("Failed to get location from IP");
    }

    return data.location;
  } catch (error) {
    console.error("IP location error:", error);
    return null;
  }
};

// Get precise location using browser geolocation
const getPreciseLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get address
          const locationData = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            ...locationData,
          });
        } catch (error) {
          resolve({
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
          });
        }
      },
      (error) => {
        let errorMessage = "Location access denied";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timeout";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Reverse geocoding using a free service
const reverseGeocode = async (lat: any, lng: any) => {
  try {
    const { data } = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&limit=1`
    );

    console.log(data);
    if (!data) {
      throw new Error("Geocoding failed");
    }

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        formatted: result.formatted,
        city:
          result.components.city ||
          result.components.town ||
          result.components.village,
        state: result.components.state,
        country: result.components.country,
        countryCode: result.components.country_code?.toUpperCase(),
        timezone: result.annotations?.timezone?.name,
      };
    }

    return {};
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {};
  }
};

// Detect and update location
export function useDetectAndUpdateLocation() {
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const detectAndUpdateLocation = async () => {
    try {
      let location;
      try {
        location = await getPreciseLocation();
      } catch (error: any) {
        console.log(
          "Precise location failed, falling back to IP:",
          error.message
        );
        location = await getLocationFromIP();
      }

      if (location) {
        const locationString =
          `${location.state || ""}, ${location.country || ""}` ||
          location.formatted.replace(/^,\s*|,\s*$/g, "");

        if (locationString) {
          await updateProfile({ location: locationString });
          return { success: true, location: locationString };
        }
      }

      return { success: false, error: "Could not determine location" };
    } catch (error: any) {
      console.error("Location detection error:", error);
      return { success: false, error: error.message };
    }
  };

  return { detectAndUpdateLocation };
}
