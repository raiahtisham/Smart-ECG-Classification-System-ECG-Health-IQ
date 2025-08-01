import * as SecureStore from "expo-secure-store";
import React, { useState, useLayoutEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../Screens/ThemeContext";

const DoctorLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme } = useTheme();
  const currentRole = "doctor";

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Login Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ea8394cc461f.ngrok-free.app/doctor_login",
        { email, password }
      );

      const { message, doctor, specialization } = response.data;

      if (!doctor) {
        Alert.alert("Login Error", "User data not found in the response.");
        return;
      }

      await SecureStore.setItemAsync(
        "userToken",
        JSON.stringify({ email, doctor, specialization })
      );

      Alert.alert("Login Success", message);
      navigation.navigate("DoctorHomeScreen", { email, doctor });
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      Alert.alert(
        "Login Error",
        error.response?.data?.error || "An error occurred"
      );
    }
  };

  if (!theme) return <Text>Loading Theme...</Text>;

  return (
    <LinearGradient
      colors={[theme.background, theme.card]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={60}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.roleButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                {
                  backgroundColor:
                    currentRole === "patient" ? "transparent" : theme.button,
                  borderColor:
                    currentRole === "patient" ? theme.button : "transparent",
                },
              ]}
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  { color: currentRole === "patient" ? "green" : "#fff" },
                ]}
              >
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                {
                  backgroundColor:
                    currentRole === "doctor" ? "transparent" : theme.button,
                  borderColor:
                    currentRole === "doctor" ? theme.button : "transparent",
                },
              ]}
              onPress={() => navigation.navigate("DoctorLoginScreen")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  { color: currentRole === "doctor" ? "green" : "#fff" },
                ]}
              >
                Doctor
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Doctor Login
          </Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Login to your doctor account.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Password
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Enter your password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("DoctorRegisterScreen")}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: theme.button }]}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 100,
  },
  roleButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  roleButton: {
    width: "45%",
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  roleButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});

export default DoctorLoginScreen;
