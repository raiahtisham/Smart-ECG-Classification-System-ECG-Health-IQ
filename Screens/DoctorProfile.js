import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useTheme } from "./ThemeContext";
import DoctorNavigationBar from "./navigationbar2";
import UserImage from "../assets/user3.png";

const SERVER_URL = "https://ea8394cc461f.ngrok-free.app";

const DoctorProfile = ({ route, navigation }) => {
  const { theme } = useTheme();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const { email, refresh } = route.params;

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const encodedEmail = encodeURIComponent(email);
        const response = await axios.get(`${SERVER_URL}/user/${encodedEmail}`);
        if (!response.data) throw new Error("Doctor details not found");
        setDoctorData(response.data);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        Alert.alert("Error", "Failed to fetch doctor profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorData();
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
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);

        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await axios.post(`${SERVER_URL}/upload_profile_image`, {
          email,
          image_base64: base64Data,
        });

        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  if (loading || !theme) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    );
  }

  if (!doctorData) {
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
      <DoctorNavigationBar email={email} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : doctorData.profile_image
                    ? {
                        uri: `data:image/jpeg;base64,${doctorData.profile_image}`,
                      }
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
              {doctorData.name}
            </Text>
            <Text style={[styles.emailText, { color: theme.text }]}>
              {doctorData.email}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <InfoItem
              icon="person"
              label="Gender"
              value={doctorData.gender || "Not provided"}
              theme={theme}
            />
            <InfoItem
              icon="calendar"
              label="Age"
              value={doctorData.age || "Not provided"}
              theme={theme}
            />
            <InfoItem
              icon="briefcase"
              label="Specialization"
              value={doctorData.specialization || "Not provided"}
              theme={theme}
            />
            <InfoItem
              icon="call"
              label="Contact Number"
              value={doctorData.phone || "Not provided"}
              theme={theme}
              valueColor="#22c55e"
            />
          </View>

          {/*  View Consultation History Button */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() =>
              navigation.navigate("ConsultationsHistory", { email })
            }
          >
            <Text style={styles.historyButtonText}>
              View Consultation History
            </Text>
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
        { color: valueColor || theme.text, marginTop: 2 },
        multiline && { lineHeight: 22 },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16 },
  header: { alignItems: "center", marginBottom: 25 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  nameText: { fontSize: 22, fontWeight: "bold" },
  emailText: { fontSize: 16, color: "#6b7280" },
  card: { borderRadius: 20, padding: 20, elevation: 4 },
  infoItem: { marginBottom: 18 },
  iconLabel: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  label: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  value: { fontSize: 16 },
  historyButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  historyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DoctorProfile;
