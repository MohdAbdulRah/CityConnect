import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import authApi from "./authApi";

export default function FreeCard({
  title,
  image,
  location,
  owner,
  createdAt,
  _id,
  status = "available", // available | reserved | given
  givenTo = null, // user object if given
  onInterestedPress,
  group,
  interested = [],
}) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInterested, setShowInterested] = useState(false);

  const submitInterest = async () => {
    try {
      setLoading(true);
      const res = await authApi.post("/api/stuff/interested", {
        stuffId: _id,
        message,
      });

      if (res.data.success) {
        Alert.alert("Success", "Interest sent successfully");
        setShowModal(false);
        setMessage("");
        onInterestedPress?.();
      }
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const giveStuff = async (userId) => {
    Alert.alert(
      "Confirm",
      "Give this stuff to this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const res = await authApi.post("/api/stuff/giveStuff", {
                userid: userId,
                stuffid: _id,
              });

              if (res.data.success || res.data.message) {
                Alert.alert("Success", "Stuff successfully given");
                onInterestedPress?.();
              }
            } catch (err) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Failed to give stuff"
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const Avatar = ({ profileImage, name }) => (
    <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 mr-2">
      {profileImage ? (
        <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="w-full h-full bg-emerald-500 items-center justify-center">
          <Text className="text-white font-black text-lg">{name?.charAt(0).toUpperCase() || "U"}</Text>
        </View>
      )}
    </View>
  );

  const statusColor =
    status === "available" ? "#10b981" :
    status === "reserved" ? "#facc15" :
    "#ef4444"; // red for given

  return (
    <>
      <View className="mb-6">
        <View className="bg-white/8 backdrop-blur-3xl rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl">
          {/* Image */}
          <View className="relative">
            <Image source={{ uri: image }} className="w-full h-56" resizeMode="cover" />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} className="absolute inset-0" />

            {/* FREE badge */}
            <View className="absolute top-4 left-4">
              <LinearGradient colors={["#10b981", "#059669"]} className="px-5 py-2.5 rounded-full shadow-xl border border-emerald-400/50">
                <Text className="text-white font-black text-base tracking-wider">FREE</Text>
              </LinearGradient>
            </View>

            {/* Time and status */}
            <View className="absolute top-4 right-4 bg-black/60 px-4 py-2 rounded-full flex-row items-center">
              <Text className="text-emerald-300 text-xs font-bold mr-2">{timeAgo}</Text>
              {group !== "main" && (
              <View className="px-2 py-1 rounded-full" style={{ backgroundColor: statusColor }}>
                <Text className="text-white text-xs font-bold capitalize">{status}</Text>
              </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View className="p-5">
            <Text className="text-xl font-extrabold text-white" numberOfLines={2}>{title}</Text>

            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={18} color="#34d399" />
              <Text className="text-emerald-300 ml-1 font-semibold">{location}</Text>
            </View>

            {/* Owner */}
            {owner && group !== "myStuff" && (
              <View className="flex-row items-center mt-3">
                <Avatar profileImage={owner.profileImage} name={owner.name} />
                <Text className="text-white/80 ml-3 font-medium">by {owner.name || "Unknown"}</Text>
              </View>
            )}

            {/* Assigned to */}
            {status === "given" && givenTo && (
              <View className="flex-row items-center mt-3">
                <Avatar profileImage={givenTo.profileImage} name={givenTo.name} />
                <Text className="text-white/80 ml-3 font-medium">Assigned to {givenTo.name}</Text>
              </View>
            )}

            {/* Interested Button */}
            {group !== "myStuff" && group !== "myRecvStuff" && status === "available" && (
              <TouchableOpacity onPress={() => setShowModal(true)} className="mt-5">
                <LinearGradient colors={["#10b981", "#059669"]} className="py-4 rounded-2xl flex-row items-center justify-center shadow-xl border border-emerald-400/30">
                  <Ionicons name="hand-left" size={24} color="white" />
                  <Text className="text-white font-black text-lg ml-3">I'm Interested</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Interested Users Dropdown */}
            {group === "myStuff" && interested.length > 0 && (
              <View className="mt-5">
                <TouchableOpacity
                  onPress={() => setShowInterested(!showInterested)}
                  className="flex-row items-center justify-between bg-white/10 px-4 py-3 rounded-2xl"
                >
                  <Text className="text-white font-semibold">Interested Users ({interested.length})</Text>
                  <Ionicons name={showInterested ? "chevron-up" : "chevron-down"} size={20} color="white" />
                </TouchableOpacity>

                {showInterested && (
                  <View className="mt-3 bg-white/10 rounded-2xl p-3 max-h-40">
                    <FlatList
                      data={interested}
                      keyExtractor={(item, index) => item.user?._id || index.toString()}
                      renderItem={({ item }) => (
                        <View className="flex-row items-center mb-2 justify-between">
                          <View className="flex-row items-center">
                            <Avatar profileImage={item.user?.profileImage} name={item.user?.name} />
                            <View className="ml-2">
                              <Text className="text-white font-medium">{item.user?.name || "Unknown"}</Text>
                              {item.message && <Text className="text-white/70 text-sm mt-1">{item.message}</Text>}
                            </View>
                          </View>

                          {/* Give Stuff Icon only if available */}
                          {status === "available" && (
                            <TouchableOpacity onPress={() => giveStuff(item.user._id)}>
                              <Ionicons name="gift" size={24} color="#10b981" />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ================= MODAL ================= */}
      <Modal transparent animationType="fade" visible={showModal}>
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <View className="w-full bg-slate-900 rounded-3xl p-6 border border-emerald-500/30">
            <Text className="text-white text-xl font-extrabold mb-2">Send a message</Text>
            <Text className="text-emerald-300 mb-4">Let the owner know why you’re interested</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Hi, I'm interested in this item..."
              placeholderTextColor="#9ca3af"
              multiline
              className="bg-white/10 text-white rounded-2xl p-4 min-h-[100px] border border-white/10"
            />

            <View className="flex-row justify-between mt-6">
              <TouchableOpacity onPress={() => { setShowModal(false); setMessage(""); }} className="px-6 py-3 rounded-2xl bg-white/10">
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={submitInterest} disabled={loading || status !== "available"}>
                <LinearGradient colors={["#10b981", "#059669"]} className="px-8 py-3 rounded-2xl">
                  <Text className="text-white font-black">{loading ? "Sending..." : "Send"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
