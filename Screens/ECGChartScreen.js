import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { useTheme } from "../Screens/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { Buffer } from "buffer";
const screenWidth = Dimensions.get("window").width;

const ECGChartScreen = ({ route }) => {
  const { theme } = useTheme();
  const { ecgSignal } = route.params || {};

  const [imageUri, setImageUri] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (!Array.isArray(ecgSignal) || ecgSignal.length === 0) {
          console.warn(" ECG signal is empty or not an array.");
          setLoadingImage(false);
          return;
        }

        const response = await axios.post(
          "https://ea8394cc461f.ngrok-free.app/generate_ecg_image", // Replace with your backend
          { ecg_signal: ecgSignal },
          { responseType: "arraybuffer" }
        );

        const base64 = Buffer.from(response.data, "binary").toString("base64");
        const imageUrl = `data:image/png;base64,${base64}`;
        setImageUri(imageUrl);
      } catch (error) {
        console.error(
          " Failed to load ECG image:",
          error.response?.data || error.message
        );
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
  }, [ecgSignal]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          <MaterialIcons name="bar-chart" size={24} color={theme.text} /> Full
          ECG Chart
        </Text>

        {loadingImage ? (
          <ActivityIndicator
            size="large"
            color="#4CAF50"
            style={{ marginTop: 20 }}
          />
        ) : imageUri ? (
          <ScrollView horizontal>
            <Image
              source={{ uri: imageUri }}
              style={{
                width: 900,
                height: 260,
                resizeMode: "contain",
                borderRadius: 12,
              }}
            />
          </ScrollView>
        ) : (
          <Text style={{ color: theme.text, marginTop: 20 }}>
            No ECG data or failed to load chart.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default ECGChartScreen;
