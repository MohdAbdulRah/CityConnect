// app/(main)/createPost.jsx
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import authApi from "../../components/authApi";
import CryptoJS from "crypto-js";

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

// Your Cloudinary config (add to .env or config file)
// const CLOUDINARY_CLOUD_NAME = "your-cloud-name";        // CHANGE THIS
// const CLOUDINARY_API_KEY = "1234567890";               // CHANGE THIS
// const CLOUDINARY_API_SECRET = "your-secret-here";      // CHANGE THIS (keep secret!)

export default function CreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    content: "",
    location: "",
    image: null,      // local URI
    imageUrl: null,   // Cloudinary URL after upload
  });

  // Pick Image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setForm({ ...form, image: result.assets[0].uri, imageUrl: null });
    }
  };

  // Upload to Cloudinary (Signed Upload)
  const uploadToCloudinary = async () => {
    if (!form.image) return null;

    setUploadingImage(true);
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const params = {
        timestamp: timestamp.toString(),
        folder: "community_posts",
      };

      const paramString = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&") + CLOUDINARY_API_SECRET;

      const signature = CryptoJS.SHA1(paramString).toString();

      const formData = new FormData();
      formData.append("file", {
        uri: form.image,
        type: "image/jpeg",
        name: "post.jpg",
      });
      formData.append("api_key", CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "community_posts");

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
      console.error("Upload error:", err);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Post
  const handleSubmit = async () => {
    if (!form.content.trim() || !form.location.trim() || !form.image) {
      Alert.alert("Missing", "Please add text, location, and a photo");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary();
      if (!imageUrl) throw new Error("Image upload failed");

      await authApi.post("/api/posts/add", {
        content: form.content.trim(),
        location: form.location.trim(),
        image: imageUrl, // Only send URL!
      });

      Alert.alert("Posted!", "Your post is now live", [
        { text: "Done", onPress: () =>{
            setForm({
            content: "",
            location: "",
            image: null,
            imageUrl: null,
            });
            router.replace("/(tabs)/community") 
        }},
      ]);
    } catch (err) {
      Alert.alert("Failed", err.message || "Could not post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1e1b4b", "#2e1065", "#4c1d95"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
            <TouchableOpacity onPress={() => router.replace("/(tabs)/community")} className="p-2">
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-2xl font-bold">Create Post</Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || uploadingImage}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Image Picker */}
            <View className="px-6">
              <TouchableOpacity
                onPress={pickImage}
                disabled={uploadingImage}
                className="bg-white/10 backdrop-blur-2xl rounded-3xl h-96 items-center justify-center border-2 border-dashed border-white/30 overflow-hidden"
              >
                {uploadingImage ? (
                  <View className="items-center">
                    <ActivityIndicator size="large" color="#c4b5fd" />
                    <Text className="text-white/70 mt-4">Uploading image...</Text>
                  </View>
                ) : form.image ? (
                  <Image
                    source={{ uri: form.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center py-20">
                    <Ionicons name="camera-outline" size={64} color="#a78bfa" />
                    <Text className="text-white/80 text-xl mt-5 font-medium">
                      Tap to add a photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="px-6 mt-8">
              <TextInput
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                value={form.content}
                onChangeText={(t) => setForm({ ...form, content: t })}
                multiline
                className="bg-white/10 backdrop-blur-2xl rounded-3xl px-6 py-5 text-white text-lg min-h-40"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Location */}
            <View className="px-6 mt-6">
              <View className="flex-row items-center bg-white/10 backdrop-blur-2xl rounded-3xl px-5 py-5">
                <Ionicons name="location-outline" size={24} color="#c4b5fd" />
                <TextInput
                  placeholder="Add location"
                  placeholderTextColor="#999"
                  value={form.location}
                  onChangeText={(t) => setForm({ ...form, location: t })}
                  className="text-white text-lg ml-3 flex-1"
                />
              </View>
            </View>

            <View className="h-40" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}