import React, { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView, // Import ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../Screens/ThemeContext"; // Import the useTheme hook

const DoctorRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [contact, setContact] = useState("");
  const [age, setAge] = useState(""); // Added Age field
  const [gender, setGender] = useState(""); // Added Gender field
  const { theme } = useTheme(); // Access theme using the useTheme hook
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !contact ||
      !age ||
      !gender
    ) {
      Alert.alert("Registration Error", "Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Signup Error", "Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ea8394cc461f.ngrok-free.app/doctor_register", // Correct endpoint
        { name, email, password, specialization, contact, age, gender }
      );

      // Check if the response contains the necessary user data
      if (response.data && response.data.user) {
        Alert.alert("Registration Success", response.data.message); // Display the message returned from the backend
        navigation.navigate("DoctorLoginScreen"); // Redirect to the login screen after successful registration
      } else {
        Alert.alert(
          "Registration Error",
          "User data not found in the response."
        );
      }
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data || error.message
      );
      // Handle specific errors like 404 or 500
      if (error.response) {
        // Display a more specific error based on the response code
        if (error.response.status === 404) {
          Alert.alert("Error", "Endpoint not found");
        } else if (error.response.status === 400) {
          Alert.alert("Error", "Invalid input. Please check your data.");
        } else {
          Alert.alert(
            "Registration Error",
            error.response?.data?.error || "An error occurred"
          );
        }
      } else {
        Alert.alert("Error", "Network or server issue");
      }
    }
  };

  if (!theme) {
    return <Text>Loading Theme...</Text>;
  }

  return (
    <LinearGradient
      colors={[theme.background, theme.card]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Doctor Registration
        </Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Register as a doctor
        </Text>

        {/* Form Inputs for Registration */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Enter your full name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
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
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Specialization
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Enter your specialization"
            placeholderTextColor="#aaa"
            value={specialization}
            onChangeText={setSpecialization}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Contact Number
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Enter your contact number"
            placeholderTextColor="#aaa"
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
          />
        </View>

        {/* Added Age Field */}
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

        {/* Added Gender Field */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Gender</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Enter your gender"
            placeholderTextColor="#aaa"
            value={gender}
            onChangeText={setGender}
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Link to Login Screen */}
        <TouchableOpacity
          onPress={() => navigation.navigate("DoctorLoginScreen")}
          style={styles.link}
        >
          <Text style={[styles.linkText, { color: theme.button }]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default DoctorRegisterScreen;
