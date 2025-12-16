import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import authApi from "../../../components/authApi";
import FreeCard from "../../../components/FreeCard"; // import FreeCard

const MyRecvStuffs = () => {
    const {id} = useLocalSearchParams()
  const [stuffs, setStuffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGivenStuffs = async () => {
    try {
      const res = await authApi.get(`/api/stuff/stuffRecvByUser/${id}`);
      if (res.data.success) {
        setStuffs(res.data.stuffs);
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to fetch Recieved stuffs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  setStuffs([]);
  if (id) fetchGivenStuffs();
}, [id]);

useFocusEffect(
  useCallback(() => {
    if (id) fetchGivenStuffs();
  }, [id])
);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGivenStuffs().finally(() => setRefreshing(false));
  };

  const renderItem = ({ item }) => (
    <FreeCard
      key={item._id}
      _id={item._id}
      title={item.title}
      image={item.image} // make sure your stuff has an image field
      location={item.location || "Not specified"}
      owner={item.owner} // should include {name, profileImage}
      createdAt={item.createdAt}
      onInterestedPress={fetchGivenStuffs} // reload list on interest
      group={"OtherRecvStuff"}
      interested={item.interested}
      status={item.status}
      givenTo={item.givenTo}
    />
  );

  if (loading) {
    return (
      <LinearGradient
        colors={["#10b981", "#34d399", "#6ee7b7"]}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white text-xl font-bold mt-4">Loading your stuffs...</Text>
      </LinearGradient>
    );
  }

  if (stuffs.length === 0) {
    return (
      <LinearGradient
        colors={["#10b981", "#34d399", "#6ee7b7"]}
        className="flex-1 justify-center items-center px-6"
      >
        <Ionicons name="gift-outline" size={100} color="white" />
        <Text className="text-white text-3xl font-bold mt-4 text-center">
          No Recieved stuffs yet
        </Text>
        <Text className="text-white/80 text-lg mt-2 text-center">
          The User hasnt recieved any thing yet
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} className="flex-1">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <Text className="text-3xl font-extrabold text-white mb-4">Recieved Stuffs</Text>
        <FlatList
          data={stuffs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#fff"]}
              tintColor="#fff"
            />
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MyRecvStuffs;
