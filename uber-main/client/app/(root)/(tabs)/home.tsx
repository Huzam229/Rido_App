import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/type";
import { StatusBar } from "expo-status-bar";

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const BASE_URL = "https://rido-app-beta.vercel.app";

  // FIXED: Provide empty string as fallback instead of null
  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(
      `${BASE_URL}/api/ride/getUserRide/${user?.id || ""}`
  );

  // Add debug logging
  useEffect(() => {
    console.log("=== DEBUG INFO ===");
    console.log("User ID:", user?.id);
    console.log("Recent Rides:", recentRides);
    console.log("Loading:", loading);
    console.log("Error:", error);
  }, [user?.id, recentRides, loading, error]);

  useEffect(() => {
    console.log("=== HOME USEEFFECT STARTED ===");

    const requestLocation = async () => {
      try {
        console.log("Requesting location permission...");

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Location permission denied");
          setHasPermission(false);
          return;
        }

        console.log("Permission granted, fetching location...");
        setHasPermission(true);

        let location;
        try {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          console.log("Location received from GPS:", location.coords);
        } catch (locationError) {
          console.log("Could not get GPS location, using fallback for emulator");
          // FALLBACK FOR EMULATOR - Lahore coordinates
          location = {
            coords: {
              latitude: 31.5204,
              longitude: 74.3587,
              altitude: null,
              accuracy: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          };
          console.log("Using fallback location:", location.coords);
        }

        if (!location.coords) {
          console.error("No coordinates in location response");
          return;
        }

        let formattedAddress = "Current Location";
        try {
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          console.log("Address received:", address[0]);
          formattedAddress = address[0]
              ? `${address[0].name}, ${address[0].region}`
              : "Current Location";
        } catch (geocodeError) {
          console.log("Geocoding failed, using default address");
        }

        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: formattedAddress,
        };

        console.log("Setting location in store:", locationData);
        setUserLocation(locationData);
        console.log("✅ Location successfully set in store");
      } catch (error) {
        console.error("❌ Error getting location:", error);
      }
    };

    requestLocation();
  }, []);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  return (
      <SafeAreaView className="bg-general-500">
        <StatusBar style="light" backgroundColor="#000000" />
        <FlatList
            data={recentRides?.slice(0, 5)}
            renderItem={({ item }) => <RideCard ride={item} />}
            keyExtractor={(item, index) => index.toString()}
            className="px-5"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            ListEmptyComponent={() => (
                <View className="flex flex-col items-center justify-center">
                  {!loading ? (
                      <>
                        <Image
                            source={images.noResult}
                            className="w-40 h-40"
                            alt="No recent rides found"
                            resizeMode="contain"
                        />
                        <Text className="text-sm">No recent rides found</Text>
                        {error && (
                            <Text className="text-sm text-red-500 mt-2">
                              Error: {error}
                            </Text>
                        )}
                      </>
                  ) : (
                      <ActivityIndicator size="small" color="#000" />
                  )}
                </View>
            )}
            ListHeaderComponent={
              <>
                <View className="flex flex-row items-center justify-between my-5">
                  <Text className="text-2xl font-JakartaExtraBold">
                    Welcome {user?.firstName ?? "Guest"}👋
                  </Text>
                  <TouchableOpacity
                      onPress={handleSignOut}
                      className="justify-center items-center w-10 h-10 rounded-full bg-white"
                  >
                    <Image source={icons.out} className="w-4 h-4" />
                  </TouchableOpacity>
                </View>

                <GoogleTextInput
                    icon={icons.search}
                    containerStyle="bg-white shadow-md shadow-neutral-300"
                    handlePress={handleDestinationPress}
                />

                <>
                  <Text className="text-xl font-JakartaBold mt-5 mb-3">
                    Your current location
                  </Text>
                  <View className="flex flex-row items-center bg-transparent h-[300px]">
                    <Map />
                  </View>
                </>

                <Text className="text-xl font-JakartaBold mt-5 mb-3">
                  Recent Rides
                </Text>
              </>
            }
        />
      </SafeAreaView>
  );
};

export default Home;