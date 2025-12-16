import React, { useState } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import authApi from "./authApi";

export default function StarRating({ userId, initialRating, onRated }) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleRate = (star) => {
    if (!hasRated) {
      setRating(star);
    }
  };

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.post("/api/me/add-rating", { 
        userId, 
        rating 
      });
      
      if (res.data.success) {
        setHasRated(true);
        onRated?.(res.data.newRating);
        Alert.alert("Success", "Rating submitted successfully!");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mt-4">
      {/* Stars Container */}
      <View className="flex-row justify-center items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRate(star)}
            disabled={loading || hasRated}
            activeOpacity={0.7}
            className="mx-1"
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={40}
              color="#fbbf24"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
      {!hasRated && (
        <TouchableOpacity
          onPress={submitRating}
          disabled={loading || rating === 0}
          activeOpacity={0.8}
          className="mx-6"
        >
          <LinearGradient
            colors={rating > 0 ? ["#fbbf24", "#f59e0b"] : ["#475569", "#334155"]}
            className="py-4 rounded-2xl flex-row items-center justify-center"
            style={{
              shadowColor: rating > 0 ? "#fbbf24" : "transparent",
              shadowOpacity: 0.4,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 }
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text className="text-white text-base font-bold ml-2">
                  Submit Rating
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Success Message */}
      {hasRated && (
        <View className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-3 mx-6">
          <View className="flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" size={20} color="#34d399" />
            <Text className="text-emerald-400 font-semibold ml-2">
              Rating submitted successfully!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}