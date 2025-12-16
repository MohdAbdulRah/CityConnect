// app/(main)/_layout.jsx
import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { TouchableOpacity } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function MainLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide top bar on these screens
  const hideTopBarScreens = ["give", "post-task","createPost","Chat","Show","Messages","UserList","MyGivenStuffs","MyRecvStuffs","MyGivenTasks","MyRecvTasks","MyPosts","OtherGivenStuffs","OtherRecvStuffs","OtherGivenTasks","OtherRecvTasks","OtherUserPosts"];
  const isSpecialScreen = hideTopBarScreens.some(screen => pathname.includes(screen));

  // Only show top bar on main tab screens
  const showTopBar = !isSpecialScreen;

  // For active tab detection (only on main tabs)
  const [lastActiveTab, setLastActiveTab] = React.useState(0);

const getActiveTab = () => {
  const path = pathname.toLowerCase();

  if (path.includes("freestuff")) {
    setLastActiveTab(0);
    return 0;
  }
  if (path.includes("tasks")) {
    setLastActiveTab(1);
    return 1;
  }
  if (path.includes("community")) {
    setLastActiveTab(2);
    return 2;
  }
  if (path.includes("cashswap") || path.includes("cash")) {
    setLastActiveTab(3);
    return 3;
  }
  if (path.includes("profile")) {
    setLastActiveTab(4);
    return 4;
  }

  // If pathname is "/" (root), return last active tab
  if (path === "/") {
    return lastActiveTab;
  }

  return 0;
};
  const activeIndex = getActiveTab();
  const routeToTab = {
    freeStuff: 0,
    tasks: 1,
    community : 2,
    cash : 3,
    cashSwap : 3,
    profile: 4,
  };
  // const activeIndex = routeToTab[currentRoute] ?? 0;

  const tabs = [
    { name: "(tabs)/freeStuff", title: "FreeStuff", icon: "gift" },
    { name: "(tabs)/tasks", title: "Tasks", icon: "hand-right" },
    { name: "(tabs)/community", title: "Community", icon: "people" },
    { name: "(tabs)/cash", title: "CashSwap", icon: "cash-outline" },
    { name: "(tabs)/profile", title: "Profile", icon: "person" },
  ];

  const handleTabPress = (routeName) => {
    router.replace(routeName);
  };

  return (
    <>
      {/* TOP BAR — Hidden on give & post-task */}
      {showTopBar && (
        <SafeAreaView edges={["top"]} className="bg-white">
          <View className="w-full flex-row items-center justify-between px-4 py-3">
        <Text className="text-3xl font-bold text-blue-600">CityConnect</Text>
        <TouchableOpacity
           onPress={() => router.push("/(main)/Messages")}
        >
        <MaterialCommunityIcons name="message-processing" size={28}
    color="#1877F2"  />
    </TouchableOpacity>
      </View>
          <View className="border-b border-gray-200">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center", paddingHorizontal: 16 }}
            >
              {tabs.map((tab, index) => {
                const isActive = activeIndex === index;

                return (
                  <Pressable
                    key={index}
                    onPress={() => handleTabPress(tab.name)}
                    className="items-center justify-center px-6 py-4 min-w-[110px]"
                  >
                    <Ionicons
                      name={tab.icon}
                      size={28}
                      color={isActive ? "#2563eb" : "#6b7280"}
                    />
                    <Text
                      className={`text-xs font-semibold mt-1 ${
                        isActive ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {tab.title}
                    </Text>
                    {isActive && (
                      <View className="absolute bottom-0 left-4 right-4 h-1 bg-blue-600 rounded-full" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}

      {/* Main Tabs — Bottom tab bar hidden by default */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // Bottom tab bar hidden
        }}
      >
        {/* Main Tab Screens */}
        <Tabs.Screen name="(tabs)/freeStuff" />
        <Tabs.Screen name="(tabs)/tasks" />
        <Tabs.Screen name="(tabs)/community" />
        <Tabs.Screen name="(tabs)/cash" />
        <Tabs.Screen name="(tabs)/profile" />

        {/* Full Screen Routes — No tab bar, no top bar */}
        <Tabs.Screen 
          name="give" 
          options={{ 
            href: "/(main)/give",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="post-task" 
          options={{ 
            href: "/(main)/post-task",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="createPost" 
          options={{ 
            href: "/(main)/createPost",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="Chat" 
          options={{ 
            href: "/(main)/(tabs)/Chat",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="Show" 
          options={{ 
            href: "/(main)/(tabs)/Show",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="Messages" 
          options={{ 
            href: "/(main)/Messages",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="UserList" 
          options={{ 
            href: "/(main)/UserList",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="MyGivenStuffs" 
          options={{ 
            href: "/(main)/(tabs)/MyGivenStuffs",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="MyRecvStuffs" 
          options={{ 
            href: "/(main)/(tabs)/MyRecvStuffs",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="MyGivenTasks" 
          options={{ 
            href: "/(main)/(tabs)/MyGivenTasks",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="MyRecvTasks" 
          options={{ 
            href: "/(main)/(tabs)/MyRecvTasks",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="MyPosts" 
          options={{ 
            href: "/(main)/(tabs)/MyPosts",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="OtherGivenStuffs" 
          options={{ 
            href: "/(main)/(tabs)/OtherGivenStuffs",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="OtherRecvStuffs" 
          options={{ 
            href: "/(main)/(tabs)/OtherRecvStuffs",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="OtherGivenTasks" 
          options={{ 
            href: "/(main)/(tabs)/OtherGivenTasks",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="OtherRecvTasks" 
          options={{ 
            href: "/(main)/(tabs)/OtherRecvTasks",
            tabBarVisible: false 
          }} 
        />
        <Tabs.Screen 
          name="OtherUserPosts" 
          options={{ 
            href: "/(main)/(tabs)/OtherUserPosts",
            tabBarVisible: false 
          }} 
        />
      </Tabs>
    </>
  );
}