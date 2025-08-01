import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../Screens/ThemeContext"; // Correct import for useTheme
import Logo from "../assets/logo.png";
const WelcomeScreen = ({ navigation }) => {
  const { theme } = useTheme(); // Get theme from context

  console.log("Theme:", theme); // Log the theme object

  if (!theme) {
    return <Text>Loading Theme...</Text>; // Show loading while theme is loading
  }

  return (
    <LinearGradient
      colors={[theme.background, theme.card]} // Ensure theme is not undefined
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={Logo} // Ensure this path is correct
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: theme.text }]}>WELCOME</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          ECG-HealthIQ
        </Text>
        <Text style={[styles.description, { color: theme.text }]}>
          We help you to track your Heart rate by detecting ECG signals.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={styles.buttonText}>Join Us Now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    width: "60%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 55,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default WelcomeScreen;
