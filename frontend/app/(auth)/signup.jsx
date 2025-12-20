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
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/auth/signup", { name, email, password });
      router.push({
  pathname: "/(auth)/verify",
  params: { userId: res.data.userId, email },
});
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Signup failed");
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
                <Ionicons name="sparkles" size={scale(50)} color="white" />
              </View>
              <Text className="text-4xl font-extrabold text-white mt-6 tracking-tight">
                Create Account
              </Text>
              <Text className="text-lg text-white/80 mt-2">
                Join us and start your journey
              </Text>
            </View>

            {/* Glassmorphic Form Card */}
            <View className="bg-white/10 rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
              {/* Name Field */}
              <View className="mb-5">
                <Text className="text-white/90 font-semibold mb-2">Full Name</Text>
                <View className="flex-row items-center bg-white/15 rounded-2xl px-5 py-4 border border-white/30">
                  <Ionicons name="person-outline" size={moderateScale(20)} color="#e2e8f0" />
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                    className="flex-1 text-white ml-3 text-base"
                    autoCapitalize="words"
                  />
                </View>
              </View>

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
                    className="flex-1 text-white ml-3 text-base"
                  />
                </View>
              </View>

              {/* Gradient Signup Button */}
              <TouchableOpacity onPress={handleSignup} disabled={loading}>
                <LinearGradient
                  colors={loading ? ["#64748b", "#94a3b8"] : ["#10b981", "#34d399"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-2xl py-5 flex-row justify-center items-center shadow-lg"
                >
                  <Text className="text-white font-bold text-lg mr-3">
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Text>
                  {!loading && (
                    <Ionicons name="arrow-forward" size={moderateScale(24)} color="white" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View className="items-center mt-8">
                <Text className="text-white/70 text-base">
                  Already have an account?{" "}
                  <Text
                    onPress={() => router.push("/login")}
                    className="text-white font-bold underline"
                  >
                    Log in
                  </Text>
                </Text>
              </View>
            </View>

            {/* Optional Footer */}
            <Text className="text-white/50 text-center mt-10 text-xs">
              By signing up, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}