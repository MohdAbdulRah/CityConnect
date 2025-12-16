// app/(main)/(tabs)/posts.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import authApi from "../../../components/authApi";
import { useFocusEffect } from "@react-navigation/native";
import PostCard from "../../../components/PostCard";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPosts = async (isRefresh = false) => {
  try {
    if (!isRefresh) setLoading(true);

    const res = await authApi.get("/api/posts");

    if (res.data.success) {
      setPosts(res.data.data || []);
    }
  } catch (err) {
    console.error("Failed to load posts:", err);
    Alert.alert("Error", "Couldn't load posts. Pull to retry.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchPosts();
  }, []);
  useFocusEffect(
  useCallback(() => {
    fetchPosts(true);  // no loader screen while returning
  }, [])
);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(true);
  }, []);

  const goToCreatePost = () => {
    router.push("/(main)/createPost");
  };

  // Loading
  if (loading) {
    return (
      <LinearGradient colors={["#1e1b4b", "#2e1065", "#4c1d95"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#c4b5fd" />
          <Text className="text-white text-xl font-semibold mt-6">Loading posts...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Empty State
  if (posts.length === 0) {
    return (
      <LinearGradient colors={["#1e1b4b", "#2e1065", "#4c1d95"]} className="flex-1">
        <View className="flex-1 justify-center items-center px-10">
          <Ionicons name="newspaper-outline" size={90} color="#a78bfa" />
          <Text className="text-white text-3xl font-bold mt-8 text-center">
            No posts yet
          </Text>
          <Text className="text-white/70 text-lg mt-4 text-center">
            Share something with the community!
          </Text>
          <TouchableOpacity
            onPress={goToCreatePost}
            className="mt-10 bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-5 rounded-2xl shadow-2xl"
          >
            <Text className="text-white font-bold text-lg">Create First Post</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1e1b4b", "#2e1065", "#4c1d95"]} className="flex-1">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-4xl font-extrabold text-white tracking-tight">
            Community Posts
          </Text>
          <Text className="text-purple-200 text-lg mt-1">
            Connect • Share • Inspire
          </Text>
        </View>

        {/* Posts List */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#c4b5fd"]}
              tintColor="#c4b5fd"
            />
          }
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) => <PostCard post={item} />}
        />

        {/* FAB */}
        <TouchableOpacity
          onPress={goToCreatePost}
          className="absolute bottom-8 right-6 bg-yellow-600 rounded-full p-5 shadow-2xl shadow-purple-900"
        >
          <Ionicons name="create-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// Facebook-style Post Card
