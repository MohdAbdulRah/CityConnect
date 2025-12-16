import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import authApi from "./authApi";

const TaskCard = ({ task, onApplySuccess, group }) => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [showApplicants, setShowApplicants] = useState(false);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "now":
        return "bg-red-500";
      case "today":
        return "bg-orange-500";
      case "this_week":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "open":
        return { bg: "bg-emerald-100", text: "text-emerald-700" };
      case "assigned":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "in_progress":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "completed":
        return { bg: "bg-gray-200", text: "text-gray-700" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  /* -------------------- APPLY -------------------- */
  const submitApplication = async () => {
    try {
      setLoading(true);
      const res = await authApi.post(`/api/tasks/apply/${task._id}`, {
        message,
      });
      Alert.alert("Success", "Applied successfully");
      setShowModal(false);
      setMessage("");
      onApplySuccess?.();
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- ASSIGN TASK WITH CONFIRM -------------------- */
  const confirmAssignTask = (userId, userName) => {
    Alert.alert(
      "Confirm Assign Task",
      `Are you sure you want to give this task to ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => assignTask(userId),
        },
      ]
    );
  };

  const assignTask = async (userId) => {
    try {
      setAssigningUserId(userId);
      await authApi.post("/api/tasks/giveTasks", {
        userid: userId,
        taskid: task._id,
      });
      Alert.alert("Success", "Task assigned successfully");
      onApplySuccess?.(); // refresh list
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to assign task"
      );
    } finally {
      setAssigningUserId(null);
    }
  };

  /* -------------------- AVATARS -------------------- */
  const renderAvatar = (user, size = 12, bgColor = "bg-purple-600") => {
    if (user?.profileImage) {
      return <Image source={{ uri: user.profileImage }} className={`w-${size} h-${size} rounded-full`} />;
    }
    return (
      <View className={`w-${size} h-${size} rounded-full ${bgColor} items-center justify-center`}>
        <Text className="text-white font-bold">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </Text>
      </View>
    );
  };

  const statusStyle = getStatusStyle(task.status);

  return (
    <>
      <View className="bg-white rounded-3xl p-5 mb-5 shadow-xl">
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            {renderAvatar(task.user)}
            <View className="ml-3">
              <Text className="font-bold">{task?.user?.name}</Text>
              <Text className="text-xs text-gray-500">{task?.user?.location || "Nearby"}</Text>
            </View>
          </View>
          
          <View>
            <View className={`${getUrgencyColor(task.urgency)} px-3 py-1 rounded-full mb-2 self-start`}>
  <Text className="text-white text-xs font-bold">
    {task.urgency?.toUpperCase() || "ANYTIME"}
  </Text>
</View>
          <View className={`${statusStyle.bg} px-3 py-1 rounded-full`}>
            <Text className={`${statusStyle.text} text-xs font-bold`}>
              {task.status.toUpperCase()}
            </Text>
          </View>

          </View>
        </View>

        <Text className="text-xl font-extrabold mb-2">{task.title}</Text>
        {task.description && <Text className="text-gray-600 text-sm mb-4">{task.description}</Text>}

        <View className="flex-row items-center mb-4">
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text className="text-gray-700 text-sm ml-1">{task.address || "Location hidden"}</Text>
        </View>

        {/* SHOW ASSIGNED TO */}
        {task.assignedTo && (
          <View className="flex-row items-center mb-4">
            <Text className="font-bold mr-2 text-gray-700">Assigned to:</Text>
            {renderAvatar(task.assignedTo, 10, "bg-emerald-500")}
            <Text className="ml-2 font-semibold">{task.assignedTo?.name}</Text>
          </View>
        )}

        {/* FOOTER */}
        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-emerald-600 text-lg">₹{task.amount}</Text>

          {group !== "MyGivenTasks" && task.status === "open" && (
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="bg-purple-600 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">Apply</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ================= APPLICANTS ================= */}
        {group === "MyGivenTasks" && task.applicants?.length > 0 && (
          <View className="mt-5 border-t pt-4">
            <TouchableOpacity
              onPress={() => setShowApplicants(!showApplicants)}
              className="flex-row justify-between items-center"
            >
              <Text className="font-bold">
                Applicants ({task.applicants.length})
              </Text>
              <Ionicons name={showApplicants ? "chevron-up" : "chevron-down"} size={22} />
            </TouchableOpacity>

            {showApplicants &&
              task.applicants.map((item) => {
                const isAssigned = task.assignedTo && item.user?._id === task.assignedTo?._id;

                return (
                  <View key={item._id} className="flex-row items-center mt-3 p-3 bg-gray-50 rounded-2xl">
                    {renderAvatar(item.user, 10, "bg-indigo-500")}
                    <View className="ml-3 flex-1">
                      <Text className="font-bold">{item.user?.name}</Text>
                      {item.message && <Text className="text-xs text-gray-600">{item.message}</Text>}
                    </View>

                    {/* ASSIGN ICON */}
                    {task.status === "open" && !isAssigned && (
                      <TouchableOpacity
                        onPress={() => confirmAssignTask(item.user._id, item.user?.name)}
                        disabled={assigningUserId === item.user._id}
                      >
                        {assigningUserId === item.user._id ? (
                          <ActivityIndicator />
                        ) : (
                          <Ionicons name="checkmark-circle" size={30} color="#10b981" />
                        )}
                      </TouchableOpacity>
                    )}

                    {isAssigned && (
                      <View className="bg-emerald-600 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">ASSIGNED</Text>
                      </View>
                    )}
                  </View>
                );
              })}
          </View>
        )}
      </View>

      {/* APPLY MODAL */}
      <Modal transparent visible={showModal}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white p-6 rounded-3xl">
            <TextInput
              placeholder="Message (optional)"
              value={message}
              onChangeText={setMessage}
              className="border p-4 rounded-xl h-28"
            />
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="mr-4 font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={submitApplication}>
                {loading ? <ActivityIndicator /> : <Text className="font-bold text-emerald-600">Send</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TaskCard;
