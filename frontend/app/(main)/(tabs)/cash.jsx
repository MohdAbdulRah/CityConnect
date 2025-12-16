// app/(main)/(tabs)/cash.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Redirect } from "expo-router";
import authApi from "../../../components/authApi";

export default function Cash() {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocationPermissionAndSave();
  }, []);

  const requestLocationPermissionAndSave = async () => {
    try {
      // 1. Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      setHasPermission(true);

      // 2. Get location with high accuracy + timeout
      let location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000, // 15 seconds max
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Location timeout")), 15000)
        ),
      ]);

      const { latitude, longitude } = location.coords;

      // 3. Reverse geocode with fallback
      let address = null;
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        address = results[0];
      } catch (err) {
        console.log("Reverse geocoding failed, using coordinates only");
      }

      const city = address?.city || address?.subregion || address?.region || "Your Area";
      const country = address?.country || "Earth";
      const locationString = `${city}, ${country}`.replace(", ,", ",").trim();

      // 4. Save to backend
      await authApi.post("/api/me/update-location", {
        location: locationString === "Your Area, Earth" ? "Location Detected" : locationString,
        coordinates: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      });

    } catch (err) {
      console.error("Location error:", err);
      Alert.alert("Location Error", "Using approximate location");
      // Save fallback
      await authApi.post("/api/me/update-location", {
        location: "Location Detected",
        coordinates: { type: "Point", coordinates: [0, 0] },
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b"]} className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-white text-xl font-medium mt-6 text-center px-8">
          Getting your location...
        </Text>
      </LinearGradient>
    );
  }

  // Permission denied
  if (!hasPermission) {
    return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} className="flex-1">
      <SafeAreaView className="flex-1 justify-center items-center px-10">
        <View className="items-center">
          <View className="bg-emerald-500/20 p-8 rounded-3xl mb-10 border border-emerald-400/30">
            <Ionicons name="location" size={80} color="#10b981" />
          </View>
          <Text className="text-white text-4xl font-black text-center mb-4">
            Location Required
          </Text>
          <Text className="text-white/70 text-lg text-center">
            We need your location to show nearby cash deals
          </Text>
          <TouchableOpacity
            onPress={requestLocationPermissionAndSave}
            className="mt-12 bg-emerald-500 px-12 py-5 rounded-2xl"
          >
            <Text className="text-white text-xl font-bold">Enable Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
  }

  // SUCCESS → redirect
  return <Redirect href="/(cashSwap)" />;
}