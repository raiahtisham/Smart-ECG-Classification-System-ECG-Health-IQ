import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import axios from "axios";
import RNPickerSelect from "react-native-picker-select";
import { useTheme } from "../Screens/ThemeContext";
import { Buffer } from "buffer"; //  For base64 conversion

const SERVER_URL = "https://ea8394cc461f.ngrok-free.app"; // Replace with your backend

const ConsultDoctorScreen = ({ route }) => {
  const { theme } = useTheme();
  const { ecgSignal, email, testResult } = route.params || {};

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    testResult
      ? `Detected ECG signal indicating: ${testResult}`
      : "Detected ECG irregularity."
  );
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/get_doctors`);
        if (res.data && res.data.doctors) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        Alert.alert("Error", "Could not load doctor list.");
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchECGImage = async () => {
      if (!ecgSignal || ecgSignal.length === 0) return;

      try {
        const response = await axios.post(
          `${SERVER_URL}/generate_ecg_image`,
          { ecg_signal: ecgSignal },
          { responseType: "arraybuffer" }
        );
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        const imageUrl = `data:image/png;base64,${base64}`;
        setImageUri(imageUrl);
      } catch (error) {
        console.error("Failed to load ECG image:", error);
      }
    };
    fetchECGImage();
  }, [ecgSignal]);

  const handleSubmit = async () => {
    if (!name || !age || !phone) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!selectedDoctor) {
      Alert.alert("Error", "Please select a doctor.");
      return;
    }

    if (!ecgSignal || !Array.isArray(ecgSignal) || ecgSignal.length === 0) {
      Alert.alert("Error", "No ECG signal data found.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${SERVER_URL}/consult_doctor`, {
        name,
        age,
        phone,
        email,
        message,
        ecg_signal: ecgSignal,
        doctor_email: selectedDoctor,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Your request has been submitted!");
        setName("");
        setAge("");
        setPhone("");
        setMessage("");
        setSelectedDoctor(null);
      } else {
        Alert.alert("Error", "Failed to submit. Please try again later.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Failed to submit. Please check your connection.");
    }
    setLoading(false);
  };

  const selectedDoctorInfo = doctors.find(
    (doc) => doc.email === selectedDoctor
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.heading, { color: theme.text }]}>
          Consult a Doctor
        </Text>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: Dimensions.get("window").width - 40,
              height: 250,
              borderRadius: 12,
              marginBottom: 20,
            }}
          />
        )}

        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Full Name"
          placeholderTextColor={theme.placeholder}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Age"
          placeholderTextColor={theme.placeholder}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Phone Number"
          placeholderTextColor={theme.placeholder}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <View style={{ marginBottom: 15 }}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedDoctor(value)}
            placeholder={{ label: "Select a Doctor...", value: null }}
            useNativeAndroidPickerStyle={false}
            items={doctors.map((doc) => ({
              label: `${doc.name} (${doc.specialization})`,
              value: doc.email,
            }))}
            value={selectedDoctor}
            style={{
              inputIOS: {
                fontSize: 16,
                padding: 15,
                borderRadius: 10,
                backgroundColor: theme.card,
                color: theme.text,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: theme.border || "#ccc",
              },
              inputAndroid: {
                fontSize: 16,
                padding: 15,
                borderRadius: 10,
                backgroundColor: theme.card,
                color: theme.text,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: theme.border || "#ccc",
              },
              placeholder: { color: theme.placeholder || "#999" },
            }}
          />
        </View>

        {selectedDoctorInfo && (
          <Text style={{ marginBottom: 15, color: theme.text }}>
            Specialization: {selectedDoctorInfo.specialization}
          </Text>
        )}

        <TextInput
          style={[
            styles.messageBox,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Describe your issue"
          placeholderTextColor={theme.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: { padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  messageBox: {
    padding: 15,
    borderRadius: 10,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default ConsultDoctorScreen;
