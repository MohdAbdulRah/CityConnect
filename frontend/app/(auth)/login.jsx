// app/(auth)/login.tsx  (or .jsx if you prefer)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../components/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", { email, password });
      await AsyncStorage.setItem("token", res.data.token);
      Alert.alert("Welcome back!", "Login successful");
      router.replace("/(main)");
    } catch (err) {
      const msg = err?.response?.data?.message;
  if (msg === "Email not verified") {
    // ⚡ Send userId instead of email
        const userId = err?.response?.data?.userId || err?.response?.data?.user?._id;
        const email = err?.response?.data?.email
        return Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in",
          [
            {
              text: "Verify Now",
              onPress: () =>
                router.push({
                  pathname: "/(auth)/verify",
                  params: { userId,email }, // ✅ Pass userId
                }),
            },
            { text: "Cancel" },
          ]
        );
      }

      Alert.alert("Login Failed", err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#6366f1", "#8b5cf6", "#d946ef"]}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-28 h-28 rounded-full bg-white/20 items-center justify-center shadow-2xl backdrop-blur-md border border-white/30">
                <Ionicons name="log-in-outline" size={moderateScale(54)} color="white" />
              </View>
              <Text className="text-4xl font-extrabold text-white mt-6 tracking-tight">
                Welcome Back
              </Text>
              <Text className="text-lg text-white/80 mt-2">
                Log in to continue
              </Text>
            </View>

            {/* Glassmorphic Form Card */}
            <View className="bg-white/10 rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
              {/* Email Field */}
              <View className="mb-5">
                <Text className="text-white/90 font-semibold mb-2">Email Address</Text>
                <View className="flex-row items-center bg-white/15 rounded-2xl px-5 py-4 border border-white/30">
                  <Ionicons name="mail-outline" size={moderateScale(20)} color="#e2e8f0" />
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 text-white ml-3 text-base"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View className="mb-8">
                <Text className="text-white/90 font-semibold mb-2">Password</Text>
                <View className="flex-row items-center bg-white/15 rounded-2xl px-5 py-4 border border-white/30">
                  <Ionicons name="lock-closed-outline" size={moderateScale(20)} color="#e2e8f0" />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    className="flex-1 text-white ml-3 text-base"
                  />
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <LinearGradient
                  colors={loading ? ["#64748b", "#94a3b8"] : ["#3b82f6", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-2xl py-5 flex-row justify-center items-center shadow-lg"
                >
                  <Text className="text-white font-bold text-lg mr-3">
                    {loading ? "Logging in..." : "Log In"}
                  </Text>
                  {!loading && (
                    <Ionicons name="arrow-forward" size={moderateScale(24)} color="white" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-8">
                <View className="flex-1 h-px bg-white/30" />
                <Text className="mx-4 text-white/60 font-medium">or</Text>
                <View className="flex-1 h-px bg-white/30" />
              </View>

              {/* Signup Link */}
              <View className="items-center">
                <Text className="text-white/70 text-base">
                  Don't have an account?{" "}
                  <Text
                    onPress={() => router.push("/(auth)/signup")}
                    className="text-white font-bold underline"
                  >
                    Create Account
                  </Text>
                </Text>
              </View>
            </View>

            {/* Footer */}
            <Text className="text-white/50 text-center mt-10 text-xs">
              Secured by end-to-end encryption
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}