import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API from "../../components/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Verify() {
  const { userId, email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!otp) return;

    setLoading(true);
    try {
      const res = await API.post("/api/auth/verify-email", { userId, otp });
      await AsyncStorage.setItem("token", res.data.token);
      Alert.alert("Success", "Email Verified");
      router.replace("/(main)");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    await API.post("/api/auth/resend-otp", { email });
    Alert.alert("OTP Resent", "Please check your email");
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
        Verify Email
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Enter the 6-digit code sent to: {email}
      </Text>

      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        style={{ borderWidth: 1, padding: 15, borderRadius: 10, marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        style={{
          backgroundColor: loading ? "gray" : "#10b981",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resendCode} style={{ marginTop: 15 }}>
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
}
