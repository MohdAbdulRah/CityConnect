import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  TextInput 
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import authApi from "../../../components/authApi";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


const UserList = () => {
  const navigation = useRouter();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [myId, setMyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch logged-in user ID from /api/me
  const fetchMyId = async () => {
    try {
      const res = await authApi.get("/api/me");
      setMyId(res.data.user._id);
    } catch (err) {
      console.log("Fetch my ID error:", err.response?.data || err);
    }
  };

  // Fetch all users except current user
  const fetchUsers = async () => {
    try {
      const res = await authApi.get("/api/users/all/users");
      const filtered = res.data.users.filter((u) => u._id !== myId);
      setUsers(filtered);
      setFilteredUsers(filtered);
    } catch (err) {
      console.log("Fetch users error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchMyId();
    };
    load();
  }, []);

  // Refetch users after we know myId
  useEffect(() => {
    if (myId) fetchUsers();
  }, [myId]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const startChat = async (otherUserId, name) => {
    try {
      const res = await authApi.post("/api/chats/create", {
        userIds: [myId, otherUserId],
      });

      navigation.replace({
        pathname: "/(main)/(tabs)/Chat",
        params: {
          name,
          otherUserId,
          myId,
          chatId: res.data.chat._id,
        },
      });
    } catch (err) {
      console.log("Start chat error:", err.response?.data || err);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <View className="bg-white/10 rounded-full p-8 backdrop-blur-xl border border-white/20">
            <ActivityIndicator size="large" color="#a78bfa" />
          </View>
          <Text className="text-white text-lg font-semibold mt-6 tracking-wide">
            Loading users...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center justify-between mb-6">

           
            <View className="mr-4">
              <TouchableOpacity
                  onPress={() => navigation.replace("/(main)/Messages")}
                  activeOpacity={0.7}
                >
                  <View className="relative">
                    {/* Glow */}
                    <View className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-40 blur-md" />

                    {/* Button */}
                    <View className="relative bg-slate-900/60 border border-white/20 rounded-2xl p-3">
                      <Ionicons name="arrow-back-sharp" size={22} color="#a78bfa" />
                    </View>
                  </View>
                </TouchableOpacity>
            </View>
            <View>
              <Text className="text-3xl font-bold text-white tracking-tight">
                Start New Chat
              </Text>
              <Text className="text-slate-400 text-sm mt-1">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} available
              </Text>
            </View>
             </View>
            <View className="bg-violet-500/20 p-3 rounded-2xl">
              <Ionicons name="chatbubbles" size={28} color="#a78bfa" />
            </View>
          </View>

          {/* Search Bar */}
          <View className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users by name or email..."
              placeholderTextColor="#64748b"
              className="flex-1 text-white text-base ml-3"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                className="bg-white/10 p-1.5 rounded-full"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User List */}
        {filteredUsers.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <Ionicons name="search-outline" size={64} color="#64748b" />
            </View>
            <Text className="text-white text-xl font-bold mt-6">No users found</Text>
            <Text className="text-slate-400 text-center mt-2 px-8">
              {searchQuery ? `No results for "${searchQuery}"` : "No users available at the moment"}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={clearSearch}
                className="mt-6 bg-violet-500 px-6 py-3 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                className="mb-3"
                onPress={() => startChat(item._id, item.name)}
                activeOpacity={0.7}
              >
                <View className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex-row items-center">
                  {/* Profile Image with Glow */}
                  <View className="relative">
                    <View className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-30 blur-md" />
                    <View className="relative w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-0.5">
                      <Image
                        source={{
                          uri:
                            item.profileImage ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 999,
                        }}
                      />
                    </View>
                    {/* Online Indicator */}
                    <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  </View>

                  {/* User Info */}
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center">
                      <Text className="text-white text-lg font-bold">
                        {item.name}
                      </Text>
                      {item.isVerified && (
                        <View className="ml-2 bg-blue-500/20 px-2 py-0.5 rounded-full">
                          <Ionicons name="checkmark-circle" size={14} color="#60a5fa" />
                        </View>
                      )}
                    </View>
                    <Text className="text-slate-400 text-sm mt-1" numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>

                  {/* Message Icon */}
                  <View className="bg-violet-500/20 p-3 rounded-xl">
                    <Ionicons name="chatbubble-ellipses" size={20} color="#a78bfa" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View className="h-0" />}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default UserList;