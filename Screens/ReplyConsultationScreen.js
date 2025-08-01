import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { useTheme } from "../Screens/ThemeContext";

const SERVER_URL = "https://ea8394cc461f.ngrok-free.app";

const ReplyConsultationScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { email } = route.params;
  const [reply, setReply] = useState("");

  const submitReply = async () => {
    if (!reply) {
      Alert.alert("Error", "Reply cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(`${SERVER_URL}/reply_consultation`, {
        email,
        reply,
      });
      if (response.status === 200) {
        Alert.alert("Success", "Reply submitted!");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Reply error:", error);
      Alert.alert("Error", "Failed to submit reply.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>
        Write your reply:
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
        multiline
        numberOfLines={5}
        value={reply}
        onChangeText={setReply}
        placeholder="Type your response here..."
        placeholderTextColor={theme.placeholder}
      />
      <TouchableOpacity style={styles.button} onPress={submitReply}>
        <Text style={styles.buttonText}>Submit Reply</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  input: {
    height: 120,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default ReplyConsultationScreen;
