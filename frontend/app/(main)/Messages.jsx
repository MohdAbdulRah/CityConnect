// screens/Messages.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import authApi from "../../components/authApi";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useRouter();

  const fetchChats = async () => {
    try {
      const res = await authApi.get("/api/chats/my-chats");
      setChats(res.data.chats);
      setUserId(res.data.userId);
    } catch (err) {
      console.log("Fetch chats error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchChats();
  }, [isFocused]);

  const renderItem = ({ item }) => {
    const user = item.participants[0];

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.replace({
            pathname: "/(main)/(tabs)/Chat",
            params: {
              name: user.name,
              myId: userId,
              otherUserId: user._id,
            },
          })
        }
        activeOpacity={0.7}
        className="mb-3"
      >
        <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex-row items-center">
          {/* Avatar */}
          <View className="relative">
            <View className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-30 blur-md" />
            <Image
              source={{
                uri:
                  user?.profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              className="w-14 h-14 rounded-full"
            />
            <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </View>

          {/* Info */}
          <View className="flex-1 ml-4">
            <Text className="text-white text-lg font-bold">
              {user?.name}
            </Text>
            <Text
              className="text-slate-400 text-sm mt-1"
              numberOfLines={1}
            >
              {item.lastMessage ? item.lastMessage.text : "No messages yet"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#a78bfa"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#334155"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            onPress={() => navigation.replace("/(main)/(tabs)/profile")}
            activeOpacity={0.7}
            className="mr-4"
          >
            <View className="relative">
              <View className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-40 blur-md" />
              <View className="relative bg-slate-900/60 border border-white/20 rounded-2xl p-3">
                <Ionicons
                  name="arrow-back-sharp"
                  size={22}
                  color="#a78bfa"
                />
              </View>
            </View>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-white tracking-tight">
            Messages
          </Text>
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#a78bfa" />
            <Text className="text-slate-400 mt-4">
              Loading your chats...
            </Text>
          </View>
        ) : chats.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={64}
              color="#64748b"
            />
            <Text className="text-white text-xl font-bold mt-6">
              No chats yet
            </Text>
            <Text className="text-slate-400 text-center mt-2">
              Start a conversation by messaging someone.
            </Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Add Button */}
       {/* Floating Add Button */}
<TouchableOpacity
  onPress={() => navigation.push("/(main)/(tabs)/UserList")}
  activeOpacity={0.85}
  className="absolute bottom-12 right-6 z-50"
>
  <View className="items-center justify-center">
    {/* Outer glow (larger, softer shadow for glow effect) */}
    <View className="absolute w-20 h-20 rounded-full bg-violet-500 shadow-lg shadow-violet-500/70" />

    {/* Inner glow (slightly smaller for depth) */}
    <View className="absolute w-18 h-18 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />

    {/* Main Button */}
    <View className="w-16 h-16 rounded-full bg-violet-500 justify-center items-center shadow-2xl shadow-black/50">
      <Ionicons name="add" size={32} color="white" />
    </View>
  </View>
</TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Messages;
