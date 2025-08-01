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
import { LinearGradient } from "expo-linear-gradient";

const ResetPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      Alert.alert("Error", "Please enter your email and new password.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ea8394cc461f.ngrok-free.app/reset-password",
        { email, new_password: newPassword }
      );

      Alert.alert("Success", response.data.message);
      navigation.navigate("LoginScreen"); // Redirect to login after reset
    } catch (error) {
      console.error(
        "Reset Password Error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to reset password."
      );
    }
  };

  return (
    <LinearGradient colors={["#141e30", "#243b55"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          placeholderTextColor="#aaa"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ResetPassword;
