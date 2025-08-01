import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Text,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../Screens/ThemeContext";
import Icon from "react-native-vector-icons/Feather";

import Home22Image from "../assets/home22.png";
import User33Image from "../assets/user33.png";
import LogoutImage from "../assets/logout44.png";

const DoctorNavigationBar = ({ email }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const isActive = (screenName) => route.name === screenName;

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
    <View style={styles.navbar}>
      {/* Home */}
      <TouchableOpacity
        onPress={() => navigation.navigate("DoctorHomeScreen", { email })}
        style={[
          styles.iconContainer,
          isActive("DoctorHomeScreen") && styles.activeIcon,
        ]}
      >
        <Image source={Home22Image} style={styles.icon} />
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        onPress={() => navigation.navigate("DoctorProfile", { email })}
        style={[
          styles.iconContainer,
          isActive("DoctorProfile") && styles.activeIcon,
        ]}
      >
        <Image source={User33Image} style={styles.icon} />
      </TouchableOpacity>

      {/* Theme Toggle */}
      <TouchableOpacity onPress={toggleTheme} style={styles.iconContainer}>
        <Icon
          name={isDarkMode ? "sun" : "moon"}
          size={26}
          color={isDarkMode ? "#FFD700" : "#111111"}
        />
      </TouchableOpacity>

      {/* Settings / Logout */}
      <TouchableOpacity
        style={[styles.button, styles.logout]}
        onPress={handleLogout}
      >
        <Image source={LogoutImage} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "rgba(5, 1, 37, 0.12)",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 10,
  },
  activeIcon: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderRadius: 10,
  },
  icon: {
    width: 26,
    height: 26,
  },
});

export default DoctorNavigationBar;
