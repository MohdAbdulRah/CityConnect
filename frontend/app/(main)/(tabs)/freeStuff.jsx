import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FreeCard from "../../../components/FreeCard";
import authApi from "../../../components/authApi";
import { useRouter } from "expo-router";

export default function FreeStuff() {
  const [freeItems, setFreeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  // ================= FETCH ITEMS =================
  const fetchFreeItems = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const response = await authApi.get("/api/stuff");
      if (response.data.success) {
        setFreeItems(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFreeItems();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFreeItems(true);
  }, []);

  // 🔥 CALLED AFTER INTEREST IS SENT
  const handleInterestSuccess = useCallback(() => {
    fetchFreeItems(true);
  }, []);

  const goToGiveScreen = useCallback(() => {
    router.push("/(main)/give");
  }, [router]);

  // ================= LOADING =================
  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-6 text-lg">
            Finding free treasures...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} className="flex-1">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-4xl font-extrabold text-white">
            Free Stuff
          </Text>
          <Text className="text-white/80 mt-2">
            Give • Get • Help • Save
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={freeItems}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 80,
            paddingTop: 16,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
          renderItem={({ item }) => (
            <FreeCard
              _id={item._id}
              title={item.title}
              image={item.image}
              location={item.location}
              owner={item.owner}
              createdAt={item.createdAt}
              onInterestedPress={handleInterestSuccess} // 🔥 key line
              group={"main"}
            />
          )}
        />

        {/* FAB */}
        <TouchableOpacity
          onPress={goToGiveScreen}
          className="absolute bottom-8 right-6 bg-white rounded-full p-5 shadow-2xl"
        >
          <Ionicons name="add" size={32} color="#10b981" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
