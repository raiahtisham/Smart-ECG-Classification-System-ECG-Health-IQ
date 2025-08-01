import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { useTheme } from "../Screens/ThemeContext";
import DoctorNavigationBar from "../Screens/navigationbar2";

const SERVER_URL = "https://ea8394cc461f.ngrok-free.app";

const DoctorHomeScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorName, setDoctorName] = useState("");

  const email = route.params?.email || "";

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${SERVER_URL}/get_consultations`, {
        params: { doctor_email: email },
      });
      setConsultations(response.data.consultations || []);
    } catch (error) {
      console.error("Failed to fetch consultations:", error);
      Alert.alert("Error", "Failed to fetch consultation requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorName = async () => {
    if (!email) return;
    try {
      const response = await axios.get(`${SERVER_URL}/user/${email}`);
      setDoctorName(response.data?.name || "");
    } catch (error) {
      console.error("Failed to fetch doctor name:", error);
    }
  };

  useEffect(() => {
    fetchDoctorName();
    fetchConsultations();
  }, [email]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <DoctorNavigationBar email={email} role="doctor" />

      <View style={{ flex: 1, padding: 20 }}>
        {doctorName && (
          <Text style={[styles.greetingText, { color: "#4CAF50" }]}>
            Hello, Dr. {doctorName}
          </Text>
        )}

        <Text style={[styles.title, { color: theme.text }]}>
          Consultation Requests
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.button || "#4CAF50"} />
            <Text style={{ color: theme.text, marginTop: 10 }}>Loading...</Text>
          </View>
        ) : consultations.length === 0 ? (
          <Text style={[styles.noDataText, { color: theme.text }]}>
            No consultations found.
          </Text>
        ) : (
          <FlatList
            data={consultations}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.patientName, { color: theme.text }]}>
                  Name: {item.name}
                </Text>
                <Text style={[styles.timestamp, { color: theme.text }]}>
                  Age: {item.age}
                </Text>
                <Text style={[styles.timestamp, { color: theme.text }]}>
                  Phone: {item.phone}
                </Text>
                <Text style={[styles.timestamp, { color: theme.text }]}>
                  Message: {item.message}
                </Text>
                <Text style={[styles.timestamp, { color: theme.text }]}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>

                {item.doctor_reply ? (
                  <Text style={[styles.reply, { color: theme.text }]}>
                    🩺 Doctor Reply: {item.doctor_reply}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#e67e22" }]}
                  onPress={() =>
                    navigation.navigate("ReplyConsultation", {
                      email: item.email,
                    })
                  }
                >
                  <Text style={styles.buttonText}>Reply</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#4CAF50" }]}
                  onPress={() => {
                    setLoading(true);
                    setTimeout(() => {
                      navigation.navigate("ECGChart", {
                        ecgSignal: item.ecg_signal || [],
                      });
                      setLoading(false);
                    }, 500);
                  }}
                >
                  <Text style={styles.buttonText}>View ECG Chart</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 5,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 14,
    marginTop: 4,
  },
  reply: {
    marginTop: 6,
    fontStyle: "italic",
    fontSize: 14,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DoctorHomeScreen;
