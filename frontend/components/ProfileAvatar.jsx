// components/ProfileAvatar.jsx
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import {
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../config";

export default function ProfileAvatar({
  profileImage,
  onImageUpdate,
  isVerified = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) return;

    setUploading(true);

    try {
      const timestamp = Math.round(Date.now() / 1000);
      const params = {
        folder: "cityconnect_profiles",
        timestamp: timestamp.toString(),
      };

      const sortedParams = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");

      const signature = CryptoJS.SHA1(`${sortedParams}${CLOUDINARY_API_SECRET}`).toString();

      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${result.assets[0].base64}`);
      formData.append("api_key", CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "cityconnect_profiles");

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const imageUrl = uploadRes.data.secure_url;

      const token = await AsyncStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/api/me/profile/image`, // or /api/users/profile/image
        { profileImageUrl: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      onImageUpdate(imageUrl);
      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Upload error:", err.response?.data || err);
      Alert.alert("Failed", err.response?.data?.error?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const showOptions = () => {
    if (profileImage) {
      Alert.alert(
        "Profile Picture",
        "",
        [
          { text: "View Photo", onPress: () => setModalVisible(true) },
          { text: "Change Photo", onPress: pickAndUpload },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    } else {
      pickAndUpload();
    }
  };

  return (
    <>
      <TouchableOpacity onPress={showOptions} activeOpacity={0.8} className="relative">
        {/* Glow */}
        <View className="absolute -inset-4 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 blur-xl opacity-70" />

        {/* Avatar */}
        <View className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-2xl border-4 border-white/30 shadow-2xl overflow-hidden items-center justify-center">
          {uploading ? (
            <ActivityIndicator size="large" color="white" />
          ) : profileImage ? (
            <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Ionicons name="person" size={70} color="white" />
          )}
        </View>

        {/* Verified Badge */}
        {isVerified && (
          <View className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-purple-900 items-center justify-center">
            <Ionicons name="checkmark" size={24} color="white" />
          </View>
        )}

        {/* Camera Icon */}
        {/* <View className="absolute bottom-2 right-2 bg-white/40 backdrop-blur-md rounded-full p-2 border border-white/50">
          <Ionicons name="camera-outline" size={20} color="white" />
        </View> */}
      </TouchableOpacity>

      {/* Full-Screen Image Viewer */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/95 justify-center items-center">
            <TouchableWithoutFeedback>
              <Image
                source={{ uri: profileImage }}
                className="w-96 h-96 rounded-3xl"
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="absolute top-12 right-6 bg-white/20 backdrop-blur-md rounded-full p-3"
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}