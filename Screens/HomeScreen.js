import React, { useState, useCallback, useLayoutEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import NavigationBar from "../Screens/navigationbar";
import { useTheme } from "../Screens/ThemeContext";
import Icon from "react-native-vector-icons/Feather";

const SERVER_URL = "https://ea8394cc461f.ngrok-free.app";
const PAGE_SIZE = 5;

const HomeScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const [ecgData, setEcgData] = useState([]);
  const [allEcgData, setAllEcgData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const email = route.params?.email || "";

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => null });
  }, [navigation]);

  const fetchECGData = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${SERVER_URL}/get_ecg_data?email=${email}`
      );
      const reversed = response.data.ecg_data.reverse();
      setAllEcgData(reversed);
      setEcgData(reversed.slice(0, PAGE_SIZE));
      setPage(1);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch ECG data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async () => {
    if (!email) return;
    try {
      const response = await axios.get(`${SERVER_URL}/user/${email}`);
      setUserName(response.data?.name || "");
    } catch (error) {
      console.error("Username fetch error:", error);
    }
  };

  const classifyECG = async (ecg_signal, recordId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${SERVER_URL}/classify`, {
        email,
        ecg_signal,
        record_id: recordId,
      });
      const classification = response.data.classification;

      const updated = allEcgData.map((item) =>
        item._id === recordId ? { ...item, test_result: classification } : item
      );
      setAllEcgData(updated);
      setEcgData(updated.slice(0, page * PAGE_SIZE));

      Alert.alert("Prediction Result", `Condition: ${classification}`);
    } catch (error) {
      console.error("Classification error:", error);
      Alert.alert("Error", "Classification failed.");
    } finally {
      setLoading(false);
    }
  };

  const deleteECGRecord = async (recordId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this ECG?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.post(`${SERVER_URL}/delete_ecg`, {
                record_id: recordId,
              });
              if (response.status === 200) {
                Alert.alert("Deleted", "ECG record deleted successfully");
                fetchECGData();
              } else {
                Alert.alert(
                  "Error",
                  response.data?.error || "Failed to delete"
                );
              }
            } catch (error) {
              console.error("Deletion error:", error);
              Alert.alert("Error", "Failed to delete ECG");
            }
          },
        },
      ]
    );
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const nextData = allEcgData.slice(0, nextPage * PAGE_SIZE);
    setEcgData(nextData);
    setPage(nextPage);
  };

  const renderItem = useCallback(
    ({ item }) => (
      <View>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => deleteECGRecord(item._id)}
          >
            <Icon name="trash-2" size={18} color="red" />
          </TouchableOpacity>

          <Text style={[styles.email, { color: theme.text }]}>
            {item.email}
          </Text>
          <Text style={{ color: theme.text }}>{item.timestamp}</Text>
          <Text numberOfLines={1} style={{ color: theme.text }}>
            ECG: {JSON.stringify(item.ecg_signal)}
          </Text>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: theme.button }]}
            onPress={() => classifyECG(item.ecg_signal, item._id)}
          >
            <Icon name="play-circle" size={18} color="#fff" />
            <Text style={styles.buttonText}>Test ECG</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: "#2196F3", marginTop: 10 },
            ]}
            onPress={() => {
              setLoading(true);
              setTimeout(() => {
                navigation.navigate("ECGChart", {
                  ecgSignal: item.ecg_signal,
                  heartRate: item.heart_rate || "N/A",
                });
                setLoading(false);
              }, 100);
            }}
          >
            <Icon name="bar-chart-2" size={18} color="#fff" />
            <Text style={styles.buttonText}>View ECG Chart</Text>
          </TouchableOpacity>

          {item.test_result && (
            <Text
              style={{ marginTop: 8, fontWeight: "bold", color: "#FF5722" }}
            >
              Test Result: {item.test_result}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: "#FF9800", marginTop: 10 },
            ]}
            onPress={() =>
              navigation.navigate("ConsultDoctor", {
                ecgSignal: item.ecg_signal,
                email: item.email,
                testResult: item.test_result || "Unknown abnormality",
              })
            }
          >
            <Icon name="user-check" size={18} color="#fff" />
            <Text style={styles.buttonText}>Consult Doctor</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: "#f9f9f9" }]}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            Doctor’s Response:
          </Text>
          <Text
            style={{ fontStyle: item.doctor_response ? "normal" : "italic" }}
          >
            {item.doctor_response || "No response from doctor yet."}
          </Text>
        </View>
      </View>
    ),
    [theme]
  );

  useFocusEffect(
    useCallback(() => {
      fetchUserName();
      fetchECGData();
    }, [email])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <NavigationBar email={email} />
      <View style={{ flex: 1, padding: 20 }}>
        {userName ? (
          <Text style={[styles.greetingText, { color: "#4CAF50" }]}>
            Hello, {userName}
          </Text>
        ) : null}

        <Text style={[styles.title, { color: theme.text }]}>ECG Records</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.button} />
        ) : ecgData.length === 0 ? (
          <Text style={[styles.noDataText, { color: theme.text }]}>
            No ECG records found.
          </Text>
        ) : (
          <FlatList
            data={ecgData}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />
        )}

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.button }]}
          onPress={fetchECGData}
        >
          <Icon name="refresh-ccw" size={18} color="#fff" />
          <Text style={styles.buttonText}>Refresh ECG Data</Text>
        </TouchableOpacity>
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
  greetingText: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  noDataText: { textAlign: "center", fontSize: 16, marginTop: 20 },
  card: { padding: 14, borderRadius: 10, marginVertical: 8, elevation: 3 },
  email: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  testButton: {
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  refreshButton: {
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  deleteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    zIndex: 10,
  },
});

export default HomeScreen;
