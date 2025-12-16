import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskCard from "../../../components/TaskCard";
import authApi from "../../../components/authApi";
import { Ionicons } from "@expo/vector-icons";


const OtherGivenTasks = () => {
    const {id} = useLocalSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyGivenTasks = async () => {
  const res = await authApi.get(`/api/tasks/getGivenTaskByOwner/${id}`);
  return res.data;
};
  const loadTasks = async () => {
    try {
      const data = await fetchMyGivenTasks();
      setTasks(data.tasks);
    } catch (err) {
      console.log("Load given tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks().finally(() => setRefreshing(false));
  };

  // 🔄 Loading state (same UX as tasks page)
  if (loading) {
    return (
      <LinearGradient colors={["#10b981", "#34d399"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4 font-bold text-lg">
            Loading your given tasks...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#10b981", "#34d399"]} className="flex-1">
      <SafeAreaView className="flex-1">
        {/* HEADER */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-4xl font-extrabold text-white">
            Given Tasks
          </Text>
          <Text className="text-white/90 text-lg mt-1">
            Tasks User have posted
          </Text>
        </View>

        {/* EMPTY STATE */}
        {tasks.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons name="hand-right-outline" size={64} color="white" className="mb-4" />
            <Text className="text-white text-xl font-bold">
              No tasks posted yet
            </Text>
            <Text className="text-white/80 text-sm mt-2 text-center">
              User hasnt posted any tasks yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 80,
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
                onApplySuccess={loadTasks} // 🔥 auto-refresh after actions
                group={"OtherGivenTasks"}
              />
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OtherGivenTasks;
