// app/(main)/(tabs)/profile.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Touchable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authApi from "../../../components/authApi";
import ProfileAvatar from "../../../components/ProfileAvatar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [allowCall, setAllowCall] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.get("/api/me");
      setUser(res.data.user);
      // Set phone data if exists
      if (res.data.user.phone) {
        setPhone(res.data.user.phone);
        setAllowCall(res.data.user.allowCall || false);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSavePhone = async () => {
    if (!phone || phone.trim() === "") {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    try {
      setSavingPhone(true);
      const res = await authApi.post("/api/me/add-number", {
        phone: phone.trim(),
        allowCall,
      });

      if (res.data.success) {
        setUser(res.data.data);
        setShowPhoneModal(false);
        Alert.alert("Success", "Phone number updated successfully");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update phone number"
      );
    } finally {
      setSavingPhone(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove location from server (privacy!)
              await authApi.get("/api/location/remove").catch(() => {
                // Silent fail if offline or server down
                console.log("Location already cleared or offline");
              });

              // Clear local token
              await AsyncStorage.removeItem("token");

              // Redirect to login
              router.replace("/(auth)/login");
            } catch (err) {
              console.error("Logout error:", err);
              // Still log out locally even if server fails
              await AsyncStorage.removeItem("token");
              router.replace("/(auth)/login");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading && !user) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <View className="bg-white/10 rounded-full p-8 backdrop-blur-xl border border-white/20">
            <ActivityIndicator size="large" color="#a78bfa" />
          </View>
          <Text className="text-white text-lg font-semibold mt-6 tracking-wide">
            Loading profile
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
          <Text className="text-white text-xl font-bold mt-4">
            Failed to load profile
          </Text>
          <TouchableOpacity
            onPress={fetchProfile}
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
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header Section */}
          <View className="px-6 pt-8 pb-6">
            {/* Profile Avatar */}
            <View className="items-center">
              <View className="relative">
                {/* Glow Effect */}
                <View className="absolute -inset-4 rounded-full bg-violet-500/20 blur-2xl" />
                
                {/* Avatar Container */}
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
                  
                  {/* Verified Badge */}
                  {user.isVerified && (
                    <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-10 h-10 rounded-full border-4 border-slate-900 items-center justify-center shadow-lg">
                      <Ionicons name="checkmark-sharp" size={20} color="white" />
                    </View>
                  )}
                </View>
              </View>

              {/* User Info */}
              <Text className="text-3xl font-bold text-white mt-6 tracking-tight">
                {user.name}
              </Text>
              <Text className="text-slate-400 text-base mt-2 font-medium">
                {user.email}
              </Text>
              
              {/* Location */}
              <View className="flex-row items-center mt-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Ionicons name="location-outline" size={16} color="#94a3b8" />
                <Text className="text-slate-400 text-sm ml-2">
                  {user.location === "Not set" ? "Add your location in CashSwap Section" : user.location}
                </Text>
              </View>

              {/* Phone Number */}
              <TouchableOpacity
                onPress={() => setShowPhoneModal(true)}
                className="flex-row items-center mt-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={16} color="#94a3b8" />
                <Text className="text-slate-400 text-sm ml-2">
                  {user.phone ? user.phone : "Add your phone number"}
                </Text>
                <Ionicons name="pencil" size={14} color="#94a3b8" className="ml-2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="px-6 mt-6">
            <Text className="text-white text-lg font-bold mb-4">Activity</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
  className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
  onPress={() => router.push("/(main)/(tabs)/MyGivenStuffs")}
>
  <View className="bg-violet-500/20 w-12 h-12 rounded-xl items-center justify-center mb-3">
    <Ionicons name="gift-outline" size={24} color="#a78bfa" />
  </View>
  <Text className="text-3xl font-bold text-white">
    {user.givenCount || user.given?.length || 0}
  </Text>
  <Text className="text-slate-400 text-sm mt-1 font-medium">Given Stuff</Text>
</TouchableOpacity>

              <TouchableOpacity className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
                onPress={() => router.push("/(main)/(tabs)/MyRecvStuffs")}
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
            {/* Posts Card */}
            <TouchableOpacity className="mt-3 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
               onPress={() =>  router.push("/(main)/(tabs)/MyPosts")}
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
            {/* Rating Card */}
            <View className="mt-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-slate-300 text-sm font-medium mb-1">Your Rating</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={28} color="#fbbf24" />
                    <Text className="text-4xl font-bold text-white ml-2">
                      {user.rating?.toFixed(1) || "4.9"}
                    </Text>
                  </View>
                </View>
                <View className="bg-amber-500/20 px-4 py-2 rounded-xl">
                  <Text className="text-amber-400 font-bold text-sm">Excellent</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tasks Section */}
          <View className="px-6 mt-8">
            <Text className="text-white text-lg font-bold mb-4">Tasks</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10"
              onPress={() =>  router.push("/(main)/(tabs)/MyGivenTasks")}
              >
                <View className="bg-blue-500/20 w-12 h-12 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="hand-left-outline" size={24} color="#60a5fa" />
                </View>
                <Text className="text-2xl font-bold text-white">
                  {user.givenTasks?.length || 0}
                </Text>
                <Text className="text-slate-400 text-sm mt-1 font-medium">Given Tasks</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10"
               onPress={() =>  router.push("/(main)/(tabs)/MyRecvTasks")}
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

          {/* Logout Button */}
          <View className="px-6 mt-10">
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
              <LinearGradient
                colors={["#ef4444", "#dc2626"]}
                className="py-4 rounded-2xl flex-row items-center justify-center shadow-xl"
              >
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text className="text-white text-base font-bold ml-3 tracking-wide">
                  Logout
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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

      {/* Phone Number Modal */}
      <Modal
        visible={showPhoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-slate-900 rounded-t-3xl px-6 py-8 border-t border-white/10">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-2xl font-bold">
                {user.phone ? "Edit Phone Number" : "Add Phone Number"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPhoneModal(false)}
                className="bg-white/10 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Phone Input */}
            <View className="mb-5">
              <Text className="text-slate-400 text-sm font-medium mb-2">
                Phone Number
              </Text>
              <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-3 flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#94a3b8" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  className="flex-1 text-white text-base ml-3"
                />
              </View>
            </View>

            {/* Allow Call Toggle */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setAllowCall(!allowCall)}
                className="bg-white/5 rounded-xl border border-white/10 px-4 py-4 flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View className="bg-violet-500/20 p-2 rounded-lg">
                    <Ionicons name="call" size={20} color="#a78bfa" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-white text-base font-semibold">
                      Allow Phone Calls
                    </Text>
                    <Text className="text-slate-400 text-xs mt-1">
                      Others can contact you via phone
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-12 h-6 rounded-full p-1 ${
                    allowCall ? "bg-violet-500" : "bg-slate-700"
                  }`}
                >
                  <View
                    className={`w-4 h-4 rounded-full bg-white ${
                      allowCall ? "ml-auto" : ""
                    }`}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Privacy Note */}
            <View className="bg-blue-500/10 rounded-xl px-4 py-3 mb-6 border border-blue-500/20">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#60a5fa" />
                <Text className="text-blue-300 text-xs ml-2 flex-1">
                  Your phone number will be visible to other users when you create posts or tasks
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSavePhone}
              disabled={savingPhone}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                className="py-4 rounded-xl flex-row items-center justify-center"
              >
                {savingPhone ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text className="text-white text-base font-bold ml-2">
                      Save Phone Number
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}