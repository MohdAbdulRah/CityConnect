import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css"

export default function Index() {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          // If token exists → go to home or main app screens
          router.replace("(main)"); // change to your home screen
        } else {
          // No token → go to login
          router.replace("(auth)/login"); 
        }
      } catch (err) {
        router.replace("(auth)/login");
      }
    };

    checkLogin();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
