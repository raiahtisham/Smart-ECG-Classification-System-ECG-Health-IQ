import React, { useState } from "react";
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
import { useTheme } from "../Screens/ThemeContext"; // Correct import for useTheme

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const { theme } = useTheme(); // Access theme using the useTheme hook

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !age || !gender) {
      Alert.alert("Signup Error", "Please fill in all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Signup Error", "Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ea8394cc461f.ngrok-free.app/register",
        {
          name,
          email,
          password,
          age,
          gender,
          medical_history: medicalHistory.split(",").map((item) => item.trim()),
        }
      );
      console.log("Signup response:", response.data);
      Alert.alert("Signup Success", response.data.message);
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || "An error occurred";

      if (errorMessage.includes("email")) {
        Alert.alert(
          "Signup Error",
          "Email already exists. Please use another email."
        );
      } else {
        Alert.alert("Signup Error", errorMessage);
      }
    }
  };

  if (!theme) return <Text>Loading Theme...</Text>;

  return (
    <LinearGradient
      colors={[theme.background, theme.card]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            Create an Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Fill in the details below to create your account.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Enter your name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Age</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Enter your age"
              placeholderTextColor="#aaa"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Gender
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Enter your gender (Male/Female)"
              placeholderTextColor="#aaa"
              value={gender}
              onChangeText={setGender}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Medical History
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Enter medical history (comma-separated)"
              placeholderTextColor="#aaa"
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>Signup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("LoginScreen")}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: theme.button }]}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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

export default SignupScreen;
