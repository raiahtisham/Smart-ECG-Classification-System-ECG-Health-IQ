import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import Icon from "react-native-vector-icons/Feather";

const SettingsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { toggleTheme, isDarkMode, theme } = useTheme(); //  Added theme
  const email = route?.params?.email || "";

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => navigation.navigate("LoginScreen"),
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Settings</Text>

      {/* Upload ECG CSV */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#27ae60" }]}
        onPress={() => navigation.navigate("FileUploadScreen", { email })}
      >
        <Icon name="upload-cloud" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Upload ECG CSV</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.button, styles.logout]}
        onPress={handleLogout}
      >
        <Icon name="log-out" size={18} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logout: {
    backgroundColor: "#e53935",
  },
});

export default SettingsScreen;
