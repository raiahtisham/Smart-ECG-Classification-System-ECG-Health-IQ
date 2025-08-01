import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import NavigationBar from "../Screens/navigationbar";
import { useTheme } from "../Screens/ThemeContext";
import Icon from "react-native-vector-icons/Feather";
import * as FileSystem from "expo-file-system";

export default function FileUploadScreen({ route }) {
  const { theme } = useTheme();
  const email = route?.params?.email || "";

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [triggering, setTriggering] = useState(false);

  // Function to pick and upload the CSV file
  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      console.log(" File Picker Result:", result);

      if (result.canceled || !result.assets || !result.assets[0]) {
        Alert.alert("Cancelled", "No file selected.");
        return;
      }

      const file = result.assets[0];
      setFile(file);
      setUploading(true);

      if (file.mimeType !== "text/csv") {
        throw new Error("Please select a valid CSV file.");
      }

      const fileUri = file.uri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      if (!fileContent.trim()) {
        throw new Error("File is empty.");
      }

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: file.name,
        type: file.mimeType || "text/csv",
      });
      formData.append("email", email);

      const response = await fetch(
        "https://ea8394cc461f.ngrok-free.app/upload_csv",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Upload response:", data);

      setUploading(false);
      if (response.ok) {
        setUploadSuccess(true);
        Alert.alert("Upload Successful", "ECG CSV uploaded and classified!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setUploading(false);
      Alert.alert("Error", err.message || "Something went wrong.");
    }
  };

  // Function to trigger ECG from Device B
  const triggerECGFromDeviceB = async () => {
    setTriggering(true); // Show loading indicator while triggering
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout

    try {
      console.log("Triggering with email:", email);

      const response = await fetch("http://10.4.36.172:5000/trigger_ecg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // Send only the email
        signal: controller.signal, // Attach abort signal for timeout
      });

      clearTimeout(timeoutId); // Clear timeout if request completes

      const data = await response.json(); // Get the response as JSON
      console.log(" ECG Trigger Response:", data);

      setTriggering(false);
      if (response.ok && data.ecg_signal) {
        // Process the ECG signal data
        setUploadSuccess(true);
        setFile({ name: "ECG Triggered from Device B" });

        // Now store the ECG signal in your main backend records (MongoDB)
        const storeResponse = await fetch(
          "https://ea8394cc461f.ngrok-free.app/store_ecg_signal",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              ecg_signal: data.ecg_signal, // Pass the received ECG signal here
            }),
          }
        );

        const storeData = await storeResponse.json();

        if (storeResponse.ok) {
          Alert.alert(
            "Success",
            "ECG signal received and stored successfully!"
          );
        } else {
          Alert.alert(
            "Error",
            storeData.error || "Failed to store ECG signal."
          );
        }
      } else {
        const errMsg = data.error || "ECG trigger failed.";
        Alert.alert("Error", errMsg);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setTriggering(false);
      console.error("Trigger Error:", err);
      Alert.alert(
        "Error",
        "Failed to send ECG from Device B. Please try again."
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <NavigationBar email={email} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Upload New ECG CSV
        </Text>

        <TouchableOpacity
          onPress={pickAndUpload}
          style={[styles.button, { backgroundColor: theme.button }]}
        >
          <Icon name="upload-cloud" size={20} color="#fff" />
          <Text style={styles.buttonText}>Pick & Upload CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={triggerECGFromDeviceB}
          style={[
            styles.button,
            { backgroundColor: theme.button, marginTop: 20 },
          ]}
        >
          <Icon name="send" size={20} color="#fff" />
          <Text style={styles.buttonText}>Trigger ECG From Device B</Text>
        </TouchableOpacity>

        {uploading || triggering ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            size="large"
            color={theme.button}
          />
        ) : null}

        {uploadSuccess && file && (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              🎉 File Added!
            </Text>
            <Text style={[styles.cardText, { color: theme.text }]}>
              {file.name}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  card: {
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardText: { marginTop: 4, fontSize: 16 },
});
