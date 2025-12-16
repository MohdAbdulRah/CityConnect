// frontend/app/(main)/(tabs)/Chat.jsx - ENHANCED STYLING
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from '@expo/vector-icons/AntDesign';
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import authApi from "../../../components/authApi";
import io from "socket.io-client";
import { API_BASE_URL } from "../../../config";
import { Linking, Image } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Chat() {
  const { myId, otherUserId, name } = useLocalSearchParams();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [isLoading, setIsLoading] = useState(true);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const navigation = useRouter();
  const socket = useRef(null);
  const flatListRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    if (!myId || !otherUserId) {
      console.log("My ID : ",myId, " UserId ",otherUserId)
      Alert.alert("Error", "Missing user information");
      return;
    }

    const initializeChat = async () => {
      try {
        console.log("Starting initialization...");
        console.log("API_BASE_URL:", API_BASE_URL);

        // Health check
        try {
          const healthRes = await fetch(`${API_BASE_URL}/health`);
          await healthRes.json();
        } catch (err) {
          Alert.alert("Error", "Cannot reach server. Check your tunnel URL.");
          setIsLoading(false);
          return;
        }

        // Create/get chat
        const chatRes = await authApi.post("/api/chats/create", {
          userIds: [myId, otherUserId],
        });
        const id = chatRes.data.chat._id;
        setChatId(id);

        // Load messages
        const msgRes = await authApi.get(`/api/chats/${id}/messages`);
        setMessages(msgRes.data.messages || []);

        // Load other user info
        try {
          const userRes = await authApi.get(`/api/users/${otherUserId}`);
          setOtherUserInfo(userRes.data.user);
        } catch (err) {
          console.log("Could not load user info:", err.message);
        }

        scrollToBottom();

        // Socket.IO Connection
        socket.current = io(API_BASE_URL, {
          path: "/socket.io/",
          transports: ["polling", "websocket"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
          timeout: 20000,
          autoConnect: true,
          forceNew: true,
        });

        socket.current.on("connect", () => {
          console.log("SOCKET CONNECTED");
          setSocketStatus("connected");
          reconnectAttempts.current = 0;
          socket.current.emit("joinChat", id);
          setIsLoading(false);
        });

        socket.current.on("connect_error", (err) => {
          console.log("CONNECT ERROR:", err.message);
          reconnectAttempts.current += 1;
          setSocketStatus("error");
          setIsLoading(false);
        });

        socket.current.on("disconnect", () => setSocketStatus("connecting"));

        socket.current.on("receiveMessage", (msg) => {
          setMessages((prev) => {
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
        });

      } catch (error) {
        Alert.alert("Error", "Could not load chat: " + error.message);
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [myId, otherUserId]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId) {
      console.log("Cannot send: empty text or no chatId");
      return;
    }

    if (socketStatus !== "connected") {
      Alert.alert("Error", "Not connected to chat server");
      return;
    }

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      sender: { _id: myId },
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    const messageText = text.trim();
    setText("");

    try {
      const res = await authApi.post(`/api/chats/${chatId}/message`, {
        senderId: myId,
        text: messageText,
      });

      if (res.data.success) {
        const realMessage = res.data.message;

        // Replace temp with real message
        setMessages(prev =>
          prev.map(m => (m._id === tempId ? realMessage : m))
        );

        // Broadcast via socket
        socket.current?.emit("sendMessage", {
          ...realMessage,
          chatId,
        });
      }
    } catch (err) {
      console.log("Send failed:", err);
      Alert.alert("Failed", "Message not sent");

      // Remove failed message
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setText(messageText); // Restore text
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
        <SafeAreaView className="flex-1 justify-center items-center">
          <View className="bg-white/10 rounded-full p-8 backdrop-blur-xl border border-white/20">
            <ActivityIndicator size="large" color="#a78bfa" />
          </View>
          <Text className="text-white text-lg font-semibold mt-6 tracking-wide">
            Loading chat...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
        >
          {/* === ENHANCED HEADER === */}
          <View className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-4">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => navigation.replace("/(main)/Messages")}
                className="bg-white/10 p-2 rounded-xl mr-3"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#a78bfa" />
              </TouchableOpacity>

              {/* Avatar with Glow Effect */}
              <View className="relative">
                <View className="absolute -inset-1 rounded-full bg-violet-500/30 blur-md" />
                {otherUserInfo?.profileImage ? (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.replace({
                        pathname: "/(tabs)/Show",
                        params: {
                          id : otherUserId
                        }
                      })
                    }}
                  >
                    <View className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-0.5">
                      <Image
                        source={{ uri: otherUserInfo.profileImage }}
                        className="w-full h-full rounded-full"
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.replace({
                        pathname: "/(tabs)/Show",
                        params: {
                          id : otherUserId
                        }
                      })
                    }}
                  >
                    <View className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 justify-center items-center">
                      <Text className="text-white text-xl font-bold">
                        {name?.[0]?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                <View className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-900 ${socketStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
              </View>

              {/* Name & Status */}
              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold text-white">{name || "Chat"}</Text>
                
                {otherUserInfo?.allowCall && otherUserInfo?.phone && (
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(`tel:${otherUserInfo.phone}`)}
                    className="flex-row items-center mt-1"
                  >
                    <Ionicons name="call" size={12} color="#60a5fa" />
                    <Text className="text-sm text-blue-400 font-medium ml-1">
                      {otherUserInfo.phone}
                    </Text>
                  </TouchableOpacity>
                )}

                <View className="flex-row items-center mt-1">
                  <View className={`w-2 h-2 rounded-full mr-2 ${socketStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <Text className="text-xs text-slate-400">
                    {socketStatus === "connected" ? "Active now" : "Connecting..."}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* === MESSAGES LIST === */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id.toString()}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isMe = item.sender._id === myId;

              return (
                <View
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    marginVertical: 4,
                    maxWidth: "80%",
                  }}
                >
                  {isMe ? (
                    <LinearGradient
                      colors={["#8b5cf6", "#7c3aed"]}
                      className="px-4 py-3 rounded-2xl rounded-tr-md"
                      style={{ shadowColor: "#8b5cf6", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                    >
                      <Text className="text-white text-base">
                        {item.text}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl rounded-tl-md">
                      <Text className="text-white text-base">
                        {item.text}
                      </Text>
                    </View>
                  )}

                  {/* Timestamp */}
                  <Text
                    className={`text-xs mt-1.5 ${isMe ? "text-violet-300 text-right" : "text-slate-400"}`}
                  >
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              );
            }}
          />

          {/* === INPUT BAR === */}
          <View className="bg-slate-900/50 backdrop-blur-xl border-t border-white/10 px-4 py-4">
            <View className="flex-row items-end">
              <View className="flex-1 mr-3">
                <TextInput
                  placeholder="Type a message..."
                  placeholderTextColor="#64748b"
                  value={text}
                  onChangeText={setText}
                  multiline
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-base text-white min-h-[44px] max-h-[120px]"
                  style={{ textAlignVertical: "center" }}
                />
              </View>

              <TouchableOpacity
                onPress={sendMessage}
                disabled={socketStatus !== "connected" || !text.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    socketStatus === "connected" && text.trim()
                      ? ["#8b5cf6", "#7c3aed"]
                      : ["#475569", "#334155"]
                  }
                  className="w-12 h-12 rounded-full justify-center items-center"
                  style={{ 
                    shadowColor: socketStatus === "connected" && text.trim() ? "#8b5cf6" : "transparent",
                    shadowOpacity: 0.5, 
                    shadowRadius: 12, 
                    shadowOffset: { width: 0, height: 4 } 
                  }}
                >
                  <AntDesign name="send" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}