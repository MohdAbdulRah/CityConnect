// app/(main)/(tabs)/tasks.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import TaskCard from "../../../components/TaskCard";
import authApi from "../../../components/authApi";

const fetchTasks = async () => {
  const res = await authApi.get("/api/tasks");
  return res.data;
};

const TaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.log("Load task error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks().finally(() => setRefreshing(false));
  };

  const goToAddScreen = () => {
    router.push("/(main)/post-task");
  };

  if (loading) {
    return (
      <LinearGradient colors={["#10b981", "#34d399"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4 font-bold text-lg">
            Finding tasks nearby...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#10b981", "#34d399"]} className="flex-1">
      <View className="flex-1">
        <View className="px-6 pt-6 pb-4">
          <Text className="text-4xl font-extrabold text-white">
            Tasks Nearby
          </Text>
          <Text className="text-white/90 text-lg mt-1">
            Help • Earn • Connect
          </Text>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onApplySuccess={loadTasks} // 🔥 IMPORTANT
              group={"main"}
            />
          )}
        />

        <TouchableOpacity
          onPress={goToAddScreen}
          className="absolute bottom-8 right-6 bg-purple-500 p-5 rounded-full shadow-2xl"
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default TaskScreen;
