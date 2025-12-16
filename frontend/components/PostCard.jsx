import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { formatDistanceToNow } from "date-fns";

function PostCard({ post ,isNew}) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <View className="bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Header */}
      <View className="flex-row items-center p-4 pb-3">
        
        {/* Avatar */}
        <View className="relative">
            {post.owner?.profileImage ? (
                <Image
                source={{ uri: post.owner.profileImage }}
                className="w-16 h-16 rounded-full border-2 border-white/40"
                />
            ) : (
                <View className="w-16 h-16 rounded-full bg-green-600 border-2 border-white/40 items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                    {post.owner?.name?.charAt(0).toUpperCase()}
                </Text>
                </View>
            )}
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-white font-bold text-lg">{post.owner?.name || "User"}</Text>
          <Text className="text-white/60 text-sm">
            {timeAgo} • {post.location}
          </Text>
        </View>

        {/* Ellipsis future menu */}
        {/* <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#ddd" />
        </TouchableOpacity> */}
      </View>

      {/* Content */}
      <View className="px-4 pb-3">
        <Text className="text-white text-base leading-6">{post.content}</Text>
      </View>

      {/* Image */}
      {post.image && (
        <Image
          source={{ uri: post.image }}
          className="w-full h-96"
          resizeMode="cover"
        />
      )}

      {/* Footer (future actions) */}
      {/* 
      <View className="flex-row justify-around py-4 border-t border-white/10">
        <TouchableOpacity className="flex-row items-center gap-2">
          <Ionicons name="heart-outline" size={26} color="#e11d48" />
          <Text className="text-white/80">Like</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center gap-2">
          <Ionicons name="chatbubble-outline" size={26} color="#60a5fa" />
          <Text className="text-white/80">Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center gap-2">
          <Ionicons name="share-social-outline" size={26} color="#34d399" />
          <Text className="text-white/80">Share</Text>
        </TouchableOpacity>
      </View>
      */}
    </View>
  );
}

export default PostCard;
