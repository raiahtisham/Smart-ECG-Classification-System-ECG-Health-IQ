import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const ECGHistoryScreen = ({ route }) => {
  const { email } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://ea8394cc461f.ngrok-free.app/user/${email}/ecg-history`)
      .then((res) => {
        setHistory(res.data.history.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, [email]);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#0ea5e9"
        style={{ marginTop: 50 }}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ECG History</Text>
      {history.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.result}>{item.result}</Text>
          <Text style={styles.confidence}>
            Confidence: {(item.confidence * 100).toFixed(1)}%
          </Text>
          <Text style={styles.time}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f1f5f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  result: {
    fontSize: 18,
    fontWeight: "bold",
  },
  confidence: {
    fontSize: 14,
    color: "#475569",
  },
  time: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});

export default ECGHistoryScreen;
