// app/(main)/post-task.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker"; // npm install @react-native-community/datetimepicker
import { useRouter } from "expo-router";
import authApi from "../../components/authApi";

const PostTaskScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [urgency, setUrgency] = useState("anytime");
  const [address, setAddress] = useState("");
  const [expiryAt, setExpiryAt] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const urgencyOptions = ["now", "today", "this_week", "anytime"];

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryAt(selectedDate);
    }
  };

  const handlePost = async () => {
    if (!title || !amount || !address) {
      Alert.alert("Missing fields", "Title, Amount, and Address are required.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        title,
        description: description || undefined,
        amount: Number(amount),
        urgency,
        address,
        expiryAt: expiryAt ? expiryAt.toISOString().split("T")[0] : undefined,
      };

      const res = await authApi.post("/api/tasks/add", body);

      if (res.data.success) {
        Alert.alert("Success", "Task posted successfully!", [
          { text: "Done", onPress: () => router.push("/(main)/post-task") },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to post task");
    } finally {
      setTitle("")
      setDescription("")
      setAmount("")
      setAddress("")
      setUrgency("anytime")
      setExpiryAt(null)
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#10b981", "#34d399", "#6ee7b7"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center px-6 pt-4 pb-6">
            <TouchableOpacity onPress={() => router.replace("/(main)/(tabs)/tasks")}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text className="text-3xl font-extrabold text-white ml-4">
              Post a Task
            </Text>
          </View>

          {/* Title */}
          <View className="px-6">
            <Text className="text-white/90 text-lg font-semibold mb-3">
              Task Title *
            </Text>
            <TextInput
              placeholder="e.g., Fix my laptop, Deliver groceries..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 text-white text-lg"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="px-6 mt-6">
            <Text className="text-white/90 text-lg font-semibold mb-3">
              Description (optional)
            </Text>
            <TextInput
              placeholder="Add details about the task..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={5}
              className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 text-white text-base"
              style={{ textAlignVertical: "top" }}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Amount */}
          <View className="px-6 mt-6">
            <Text className="text-white/90 text-lg font-semibold mb-3">
              Amount (₹) *
            </Text>
            <TextInput
              placeholder="e.g., 300"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="numeric"
              className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 text-white text-lg"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Urgency */}
          <View className="px-6 mt-6">
            <Text className="text-white/90 text-lg font-semibold mb-3">
              Urgency
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {urgencyOptions.map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUrgency(u)}
                  className={`px-5 py-3 rounded-full ${
                    urgency === u ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <Text
                    className={`font-semibold capitalize ${
                      urgency === u ? "text-emerald-600" : "text-white"
                    }`}
                  >
                    {u.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View className="px-6 mt-6">
            <Text className="text-white/90 text-lg font-semibold mb-3">
              Pickup / Task Location *
            </Text>
            <TextInput
              placeholder="e.g., Banjara Hills, Hyderabad"
              placeholderTextColor="rgba(255,255,255,0.5)"
              className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 text-white text-lg"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Expiry Date with Calendar */}
          <View className="px-6 mt-6">
            <Text className="text-white/90 text-lg font-semibold mb-3">
              Expiry Date (optional)
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 flex-row items-center justify-between"
            >
              <Text className="text-white text-lg">
                {expiryAt
                  ? expiryAt.toLocaleDateString("en-IN")
                  : "Tap to select date"}
              </Text>
              <Ionicons name="calendar" size={24} color="white" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={expiryAt || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Submit Button */}
          <View className="px-6 mt-10 mb-10">
            <TouchableOpacity
              onPress={handlePost}
              disabled={loading}
              className="bg-white rounded-3xl py-5 items-center shadow-2xl"
            >
              {loading ? (
                <ActivityIndicator size="large" color="#10b981" />
              ) : (
                <Text className="text-emerald-600 text-xl font-bold">
                  Post Task
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PostTaskScreen;