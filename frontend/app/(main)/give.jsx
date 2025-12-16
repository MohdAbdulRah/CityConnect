// app/(main)/give.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import authApi from "../../components/authApi";
import { LinearGradient } from "expo-linear-gradient";
import CryptoJS from "crypto-js";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../../config";

export default function Give() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    image: null, // local URI
    imageUrl: null, // Cloudinary URL
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setForm({ ...form, image: result.assets[0].uri, imageUrl: null });
    }
  };

  const uploadToCloudinary = async () => {
    if (!form.image) return null;

    setUploadingImage(true);
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const params = {
        timestamp: timestamp.toString(),
        folder: "cityconnect_stuff",
      };

      // Sort params alphabetically and create signature string
      const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");

      const signatureString = `${sortedParams}${CLOUDINARY_API_SECRET}`;
      const signature = CryptoJS.SHA1(signatureString).toString();

      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${await getBase64(form.image)}`);
      formData.append("api_key", CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "cityconnect_stuff");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Cloudinary error:", err);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  // Helper to get base64 from URI
  const getBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location || !form.image) {
      Alert.alert("Missing fields", "Please fill all fields and add a photo");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload image to Cloudinary (signed)
      const imageUrl = await uploadToCloudinary();
      if (!imageUrl) throw new Error("Image upload failed");

      // 2. Send only data + URL to backend
      await authApi.post("/api/stuff/add", {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        image: imageUrl, // Only URL!
      });

      Alert.alert("Success!", "Your item is now live for free!", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#6366f1", "#8b5cf6", "#ec4899"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center px-6 pt-4 pb-6">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <Text className="text-3xl font-extrabold text-white ml-4">
                Give Something Away
              </Text>
            </View>

            {/* Image */}
            <View className="px-6">
              <Text className="text-white/90 text-lg font-semibold mb-3">
                Photo of Item *
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                disabled={uploadingImage}
                className="bg-white/20 backdrop-blur-xl rounded-3xl h-64 items-center justify-center border-2 border-dashed border-white/40 relative"
              >
                {uploadingImage ? (
                  <View className="items-center">
                    <ActivityIndicator size="large" color="white" />
                    <Text className="text-white/80 mt-3">Uploading...</Text>
                  </View>
                ) : form.image ? (
                  <Image
                    source={{ uri: form.image }}
                    className="w-full h-full rounded-3xl"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera" size={48} color="white" />
                    <Text className="text-white/80 text-lg mt-3 font-medium">
                      Tap to add photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View className="px-6 mt-8">
              <Text className="text-white/90 text-lg font-semibold mb-3">Title *</Text>
              <TextInput
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                placeholder="e.g., Old Laptop, Bookshelf..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 text-white text-lg"
              />
            </View>

            {/* Description */}
            <View className="px-6 mt-6">
              <Text className="text-white/90 text-lg font-semibold mb-3">Description *</Text>
              <TextInput
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Condition, size, any details..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={5}
                className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 text-white text-lg"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Location */}
            <View className="px-6 mt-6">
              <Text className="text-white/90 text-lg font-semibold mb-3">Pickup Location *</Text>
              <TextInput
                value={form.location}
                onChangeText={(t) => setForm({ ...form, location: t })}
                placeholder="e.g., Andheri West, Mumbai"
                placeholderTextColor="rgba(255,255,255,0.5)"
                className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-5 text-white text-lg"
              />
            </View>

            {/* Submit */}
            <View className="px-6 mt-10 mb-10">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || uploadingImage}
                className="bg-white rounded-3xl py-5 items-center shadow-2xl opacity-100"
              >
                {loading ? (
                  <ActivityIndicator color="#6366f1" size="large" />
                ) : (
                  <Text className="text-indigo-600 text-xl font-bold">
                    Post for Free
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}