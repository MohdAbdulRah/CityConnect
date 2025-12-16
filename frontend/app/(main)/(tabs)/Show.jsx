import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import authApi from "../../../components/authApi";
import ProfileAvatar from "../../../components/ProfileAvatar";
import StarRating from "../../../components/Rating";

export default function Show() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await authApi.get(`/api/users/${id}`);
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        Alert.alert("Error", "User not found");
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      Alert.alert("Error", "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [id])
  );

  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#a78bfa" />
          <Text className="text-white text-lg font-semibold mt-6 tracking-wide">
            Loading user...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-white text-xl font-bold mt-4">User not found</Text>
          <TouchableOpacity
            onPress={() => fetchUser()}
            className="mt-8 bg-violet-500 px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-semibold text-base">Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="px-5 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back-sharp" size={34} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">Profile</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header Section */}
          <View className="px-6 pt-8 pb-6">
            <View className="items-center">
              <View className="relative">
                <View className="absolute -inset-4 rounded-full bg-violet-500/20 blur-2xl" />
                
                <View className="relative">
                  <View className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-1">
                    <View className="w-full h-full rounded-full bg-slate-900 items-center justify-center overflow-hidden">
                      <ProfileAvatar
                        profileImage={user.profileImage}
                        onImageUpdate={(url) => {
                          setUser(prev => ({ ...prev, profileImage: url }));
                        }}
                        isVerified={user.isVerified}
                      />
                    </View>
                  </View>
                  
                  {user.isVerified && (
                    <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-10 h-10 rounded-full border-4 border-slate-900 items-center justify-center shadow-lg">
                      <Ionicons name="checkmark-sharp" size={20} color="white" />
                    </View>
                  )}
                </View>
              </View>

              <Text className="text-3xl font-bold text-white mt-6 tracking-tight">
                {user.name}
              </Text>
              <Text className="text-slate-400 text-base mt-2 font-medium">
                {user.email}
              </Text>
              
              <View className="flex-row items-center mt-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Ionicons name="location-outline" size={16} color="#94a3b8" />
                <Text className="text-slate-400 text-sm ml-2">
                  {user.location || "Not Set"}
                </Text>
              </View>

              {user.allowCall === true && (
                <View className="flex-row items-center mt-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Ionicons name="call-outline" size={16} color="#94a3b8" />
                  <Text className="text-slate-400 text-sm ml-2">
                    {user.phone ? user.phone : "No phone number"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats Grid */}
          <View className="px-6 mt-6">
            <Text className="text-white text-lg font-bold mb-4">Activity</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
                onPress={() => router.push({
                  pathname: "/(main)/(tabs)/OtherGivenStuffs",
                  params: { id: id }
                })}
              >
                <View className="bg-violet-500/20 w-12 h-12 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="gift-outline" size={24} color="#a78bfa" />
                </View>
                <Text className="text-3xl font-bold text-white">
                  {user.givenCount || user.given?.length || 0}
                </Text>
                <Text className="text-slate-400 text-sm mt-1 font-medium">Given Stuff</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
                onPress={() => router.replace({
                  pathname: "/(main)/(tabs)/OtherRecvStuffs",
                  params: { id: id }
                })}
              >
                <View className="bg-emerald-500/20 w-12 h-12 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="gift-outline" size={24} color="#34d399" />
                </View>
                <Text className="text-3xl font-bold text-white">
                  {user.receivedCount || user.received?.length || 0}
                </Text>
                <Text className="text-slate-400 text-sm mt-1 font-medium">Received Stuff</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="mt-3 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
              onPress={() => router.push({
                pathname: "/(main)/(tabs)/OtherUserPosts",
                params: { id: id }
              })}
            >
              <View className="flex-row items-center">
                <View className="bg-cyan-500/20 w-12 h-12 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="newspaper-outline" size={24} color="#22d3ee" />
                </View>
                <View>
                  <Text className="text-3xl font-bold text-white">
                    {user.postsCount || user.posts?.length || 0}
                  </Text>
                  <Text className="text-slate-400 text-sm mt-1 font-medium">Posts Created</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View className="mt-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-slate-300 text-sm font-medium mb-1">Current Rating</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={28} color="#fbbf24" />
                    <Text className="text-4xl font-bold text-white ml-2">
                      {user.rating?.toFixed(1) || "0.0"}
                    </Text>
                  </View>
                </View>
                <View className="bg-amber-500/20 px-4 py-2 rounded-xl">
                  <Text className="text-amber-400 font-bold text-sm">
                    {user.rating >= 4.5 ? "Excellent" : user.rating >= 3.5 ? "Good" : "Average"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tasks Section */}
          <View className="px-6 mt-8">
            <Text className="text-white text-lg font-bold mb-4">Tasks</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10"
                onPress={() => router.push({
                  pathname: "/(main)/(tabs)/OtherGivenTasks",
                  params: { id: id }
                })}
              >
                <View className="bg-blue-500/20 w-12 h-12 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="hand-left-outline" size={24} color="#60a5fa" />
                </View>
                <Text className="text-2xl font-bold text-white">
                  {user.givenTasks?.length || 0}
                </Text>
                <Text className="text-slate-400 text-sm mt-1 font-medium">Given Tasks</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10"
                onPress={() => router.push({
                  pathname: "/(main)/(tabs)/OtherRecvTasks",
                  params: { id: id }
                })}
              >
                <View className="bg-fuchsia-500/20 w-12 h-12 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="hand-right-outline" size={24} color="#e879f9" />
                </View>
                <Text className="text-2xl font-bold text-white">
                  {user.receivedTasks?.length || 0}
                </Text>
                <Text className="text-slate-400 text-sm mt-1 font-medium">Received Tasks</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating Section */}
          <View className="px-6 mt-8">
            <View className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <Text className="text-white text-lg font-bold mb-2 text-center">
                Rate This User
              </Text>
              <Text className="text-slate-400 text-sm mb-4 text-center">
                Share your experience with {user.name}
              </Text>
              
              <StarRating
                userId={user._id}
                initialRating={user.rating}
                onRated={(newRating) => setUser((prev) => ({ ...prev, rating: newRating }))}
              />
            </View>
          </View>

          {/* Footer */}
          <View className="items-center mt-12">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-slate-500 text-xs font-medium">
                Secured & Encrypted
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}