import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import NavigationBar from "./navigationbar";
import { useTheme } from "./ThemeContext";
import UserImage from "../assets/user3.png";
import { Image } from "expo-image";

const Profile = ({ route, navigation }) => {
  const { theme } = useTheme();
  const [Profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const { email, refresh } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      title: "Profile",
      headerTitleAlign: "center",
    });
  }, [navigation]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const encodedEmail = encodeURIComponent(email);
        const response = await axios.get(
          `https://ea8394cc461f.ngrok-free.app/user/${encodedEmail}`
        );
        if (!response.data) throw new Error("User details not found");
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching your details:", error);
        Alert.alert("Error", "Failed to fetch your details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email, refresh]);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access gallery is needed."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
      });

      if (!result.canceled) {
        const originalUri = result.assets[0].uri;

        const manipulatedImage = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 200, height: 200 } }],
          {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        setProfileImage(manipulatedImage.uri); // show preview quickly

        await axios.post(
          `https://ea8394cc461f.ngrok-free.app/upload_profile_image`,
          {
            email,
            image_base64: manipulatedImage.base64,
          }
        );

        Alert.alert("Success", "Profile picture updated successfully.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload profile picture.");
    }
  };

  if (loading || !theme) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    );
  }

  if (!Profile) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          No details available.
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.background, theme.card]}
      style={styles.container}
    >
      <NavigationBar email={email} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Avatar and Name */}
          <View style={styles.header}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : Profile.profile_image
                    ? { uri: `data:image/jpeg;base64,${Profile.profile_image}` }
                    : UserImage
                }
                style={styles.avatar}
              />
              <Text
                style={{
                  color: theme.text,
                  fontSize: 14,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Tap to change photo
              </Text>
            </TouchableOpacity>
            <Text style={[styles.nameText, { color: theme.text }]}>
              {Profile.name}
            </Text>
            <Text style={[styles.emailText, { color: theme.text }]}>
              {Profile.email}
            </Text>
          </View>

          {/* Info Card */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <InfoItem
              icon="person"
              label="Gender"
              value={Profile.gender || "Not provided"}
              theme={theme}
            />
            <InfoItem
              icon="calendar"
              label="Age"
              value={Profile.age || "Not provided"}
              theme={theme}
            />
            <InfoItem
              icon="medkit"
              label="Medical History"
              value={
                Profile.medical_history?.length > 0
                  ? Profile.medical_history.map((mh) => `• ${mh}`).join("\n")
                  : "No medical history available"
              }
              theme={theme}
              multiline
            />
            <InfoItem
              icon="heart"
              label="Latest ECG Result"
              value={
                Profile.latest_ecg_result ||
                Profile.ecg_results?.at(-1)?.result ||
                "No result available"
              }
              theme={theme}
              valueColor="#22c55e"
            />
          </View>

          {/* ECG History Button */}
          <TouchableOpacity
            style={[
              styles.historyButton,
              { backgroundColor: theme.button || "#2563eb" },
            ]}
            onPress={() => navigation.navigate("ECGHistory", { email })}
          >
            <Text style={styles.historyButtonText}> View ECG History</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
  theme,
  multiline = false,
  valueColor,
}) => (
  <View style={styles.infoItem}>
    <View style={styles.iconLabel}>
      <Icon name={icon} size={20} color={theme.text} />
      <Text style={[styles.label, { color: theme.text }]}>{label}:</Text>
    </View>
    <Text
      style={[
        styles.value,
        {
          color: valueColor || theme.text,
          marginTop: 2,
        },
        multiline && { lineHeight: 22 },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  emailText: {
    fontSize: 16,
    color: "#6b7280",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    marginBottom: 18,
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  value: {
    fontSize: 16,
  },
  historyButton: {
    marginTop: 25,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  historyButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Profile;
