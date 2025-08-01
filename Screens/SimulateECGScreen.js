// Screens/SimulateECGScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "./ThemeContext";

const SERVER_URL = "https://ea8394cc461f.ngrok-free.app";
// ← Replace with your IP

const SimulateECGScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const email = route.params?.email || "";
  const [inputText, setInputText] = useState("");

  const handleSubmit = async () => {
    if (!email || !inputText) {
      Alert.alert(
        "Missing",
        "Please enter ECG signal and make sure you're logged in."
      );
      return;
    }

    try {
      const signalArray = inputText
        .split(",")
        .map((val) => parseFloat(val.trim()))
        .filter((val) => !isNaN(val));

      const response = await fetch(`${SERVER_URL}/simulate_ecg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          ecg_signal: signalArray,
        }),
      });

      const data = await response.json();
      Alert.alert("Success", data.message || "ECG signal saved.");
    } catch (error) {
      console.error("Error saving ECG:", error);
      Alert.alert("Error", "Failed to send ECG signal.");
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme?.background || "#fff",
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          color: theme?.text,
        }}
      >
        Enter ECG Signal (comma separated)
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#fff", color: theme?.text }]}
        multiline
        placeholder="0.01, -0.02, 0.03, ..."
        value={inputText}
        onChangeText={setInputText}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Send to Server
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#8e44ad", marginTop: 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 150,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default SimulateECGScreen;
