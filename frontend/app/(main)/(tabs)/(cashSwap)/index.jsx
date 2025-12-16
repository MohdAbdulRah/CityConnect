import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import authApi from "../../../../components/authApi";
import { useRouter } from "expo-router";

const CashSwap = () => {
  if (Platform.OS === "web") {
    return <Text>Map not supported on web</Text>;
  }

  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [myId, setMyId] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [contains, setContains] = useState("cash");
  const [amount, setAmount] = useState("");

  const [createdSwapId, setCreatedSwapId] = useState(null);
  const [nearestSwap, setNearestSwap] = useState(null);
  const [isMatching, setIsMatching] = useState(false); // Prevent double matching
  const pollingInterval = useRef(null); // Store interval reference
  const navigation = useRouter();

  useEffect(() => {
    getLocation();
    fetchAllSwaps();
    getMyProfile();

    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const getMyProfile = async () => {
    try {
      const res = await authApi.get("/api/me");
      if (res.data.success) {
        setMyId(res.data.user._id);
      }
    } catch (e) {
      console.log("Profile error:", e.message);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Enable location access");
        return;
      }

      const gps = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      console.log("GPS:", gps.coords);

      setCurrentLocation({
        latitude: gps.coords.latitude,
        longitude: gps.coords.longitude,
      });

      setLoading(false);
    } catch (err) {
      Alert.alert("Error", err.message);
      setLoading(false);
    }
  };

  const handleCreateSwap = async () => {
    if (!amount) return Alert.alert("Enter amount");

    try {
      const res = await authApi.post("/api/swaps/new", {
        contains,
        amount,
      });

      if (res.data.success) {
        const id = res.data.swap._id;
        console.log("✅ Swap created with ID:", id);
        
        setCreatedSwapId(id);
        setModalVisible(false);
        fetchAllSwaps();
        
        // Wait for state to update before starting polling
        setTimeout(() => {
          fetchNearestSwap(id);
          startPolling(id);
        }, 100);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    }
  };

  const fetchAllSwaps = async () => {
    try {
      const res = await authApi.get("/api/location/all");
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.log("Fetch all swaps error:", err);
    }
  };

  const fetchNearestSwap = async (swapId) => {
    try {
      const res = await authApi.get(`/api/swaps/getSwaps/${swapId}`);
      if (res.data.success && res.data.nearestSwaps.length > 0) {
        setNearestSwap(res.data.nearestSwaps[0]);
      }
    } catch (err) {
      console.log("Fetch nearest error:", err);
    }
  };

  const cancelSwap = async () => {
    try {
      // Stop polling first
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }

      const res = await authApi.delete(`/api/swaps/cancel/${createdSwapId}`);

      if (res.data.success) {
        Alert.alert("Cancelled", "Swap cancelled successfully");
        setCreatedSwapId(null);
        setNearestSwap(null);
        setModalVisible(true);
        setAmount("");
        setIsMatching(false);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    }
  };

  const handleMatch = async (matched, currentSwapId) => {
    // 🔥 CRITICAL: Prevent double matching
    if (isMatching) {
      console.log("⚠️ Already matching, skipping...");
      return;
    }

    // Validate we have the swap ID
    if (!currentSwapId) {
      console.log("❌ No swap ID available for matching");
      return;
    }

    setIsMatching(true);

    try {
      console.log("🔄 Attempting to match swaps...");
      console.log("   My Swap ID:", currentSwapId);
      console.log("   Their Swap ID:", matched._id);

      const matchRes = await authApi.post("/api/swaps/recieve-swap", {
        senderSwapId: currentSwapId,
        recieverSwapId: matched._id,
      });

      if (matchRes.data.success) {
        console.log("✅ Match successful!");
        Alert.alert("Match Found", "Successfully matched with a user!");

        // Stop polling
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }

        // Navigate to chat
        navigation.replace({
          pathname: "/(main)/(tabs)/Chat",
          params: {
            name: matched.user.name,
            myId,
            otherUserId: matched.user._id,
          },
        });
      }
    } catch (error) {
      console.log("❌ Match failed:", error.response?.data || error.message);
      
      const errorData = error.response?.data;
      const isAlreadyMatched = errorData?.alreadyMatched === true;
      
       if (isAlreadyMatched) {
  console.log("🎉 Match already completed (by you or them)!");

  // Stop polling
  if (pollingInterval.current) {
    clearInterval(pollingInterval.current);
    pollingInterval.current = null;
  }

  // Fetch the actual matched swap to get user info
  // Or just reload from /getOneSwap/:id which returns matchedSwap
  const res = await authApi.get(`/api/swaps/getOneSwap/${currentSwapId}`);
  if (res.data.success && res.data.matchedSwap) {
    const matched = res.data.matchedSwap;

    Alert.alert("Match Found!", "You’ve been matched!");

    navigation.replace({
      pathname: "/(main)/(tabs)/Chat",
      params: {
        name: matched.user.name,
        myId,
        otherUserId: matched.user._id,
      },
    });
  }
} else {
        // Other errors (network, server, etc.)
        Alert.alert("Error", errorData?.message || "Failed to match swap");
        setIsMatching(false);
      }
    }
  };

  const startPolling = (swapId) => {
    if (!swapId) {
      console.log("❌ Cannot start polling without swap ID");
      return;
    }

    console.log("🔄 Starting polling for swap:", swapId);

    // Clear any existing interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    pollingInterval.current = setInterval(async () => {
      // Skip if currently matching
      if (isMatching) {
        console.log("⏸️ Polling paused - matching in progress");
        return;
      }

      try {
        console.log("🔍 Polling for matches...");
        const res = await authApi.get(`/api/swaps/getOneSwap/${swapId}`);

        if (!res.data.success) return;

        // 🟢 1️⃣ Already matched (receiver or sender)
        if (res.data.matchedSwap) {
          console.log("✅ Already matched!");
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
          handleMatch(res.data.matchedSwap, swapId);
          return;
        }

        // 🔵 2️⃣ Nearest available match -> attempt to match
        if (res.data.nearestSwaps?.length > 0) {
          const nearest = res.data.nearestSwaps[0];
          console.log("🎯 Found nearest swap:", nearest._id);
          
          // Update UI to show the match
          setNearestSwap(nearest);
          
          // Attempt to match
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
          await handleMatch(nearest, swapId);
        } else {
          console.log("⏳ No matches yet...");
        }
      } catch (err) {
        console.log("Polling error:", err.message);
      }
    }, 3000);
  };

  if (loading || !currentLocation) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Finding your location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔥 SWAP MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-xl w-80">
            <Text className="text-lg font-bold mb-3">Cash / Online Swap</Text>

            <Text>Have:</Text>
            <View className="flex-row justify-between my-2">
              <TouchableOpacity
                onPress={() => setContains("cash")}
                className={`p-3 rounded ${
                  contains === "cash" ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <Text className="text-white">Cash</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setContains("online")}
                className={`p-3 rounded ${
                  contains === "online" ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <Text className="text-white">Online</Text>
              </TouchableOpacity>
            </View>

            <Text>Amount:</Text>
            <TextInput
              className="border p-2 rounded mt-2"
              placeholder="Enter amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              onPress={handleCreateSwap}
              className="bg-blue-600 p-3 mt-4 rounded"
            >
              <Text className="text-center text-white text-lg">Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.replace("/(tabs)/freeStuff")}
              className="bg-gray-400 p-3 mt-4 rounded"
            >
              <Text className="text-center text-white text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {createdSwapId && (
        <TouchableOpacity
          onPress={cancelSwap}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            backgroundColor: "red",
            padding: 10,
            borderRadius: 8,
            zIndex: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Cancel Swap</Text>
        </TouchableOpacity>
      )}

      {/* 🔥 MAP */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        zoomControlEnabled
        showsUserLocation
      >
        {/* 📍 YOUR CURRENT LOCATION MARKER */}
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="You are here"
          pinColor="blue"
        />

        {/* 🔴 ALL USERS FROM DB */}
        {users.map((u, i) => (
          <Marker
            key={i}
            coordinate={{
              latitude: u.coordinates.coordinates[1],
              longitude: u.coordinates.coordinates[0],
            }}
            title={u.name}
            pinColor="red"
          />
        ))}

        {/* 🟢 NEAREST MATCH */}
        {nearestSwap && (
          <Marker
            coordinate={{
              latitude: nearestSwap.swapCoordinates.coordinates[1],
              longitude: nearestSwap.swapCoordinates.coordinates[0],
            }}
            title="Match Found"
            description={`Amount: ₹${nearestSwap.amount}`}
            pinColor="green"
            onPress={() => {
              navigation.replace({
                pathname: "/(main)/(tabs)/Chat",
                params: {
                  name: nearestSwap.user.name,
                  myId,
                  otherUserId: nearestSwap.user._id,
                },
              });
            }}
          />
        )}
      </MapView>

      <View className="absolute left-4 top-24 bg-white p-3 rounded-lg shadow-lg z-50 w-40">
        <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 rounded-full mr-3 bg-blue-600" />
          <Text className="text-sm">You</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 rounded-full mr-3 bg-green-500" />
          <Text className="text-sm">Match Found</Text>
        </View>

        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full mr-3 bg-red-500" />
          <Text className="text-sm">Other Users</Text>
        </View>
      </View>

      {/* Loading indicator when matching */}
      {isMatching && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -50 }, { translateY: -50 }],
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: 20,
            borderRadius: 10,
            zIndex: 100,
          }}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: "white", marginTop: 10 }}>Matching...</Text>
        </View>
      )}
    </View>
  );
};

export default CashSwap;