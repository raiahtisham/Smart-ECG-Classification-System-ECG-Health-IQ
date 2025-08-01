import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useTheme } from "../Screens/ThemeContext";

const SERVER_URL = "https://ea8394cc461f.ngrok-free.app";

const ConsultationsHistoryScreen = ({ route }) => {
  const { theme } = useTheme();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { email } = route.params;

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/get_consultations`, {
        params: { doctor_email: email },
      });
      if (response.status === 200) {
        setConsultations(response.data.consultations);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
      <Text style={{ color: theme.text }}>Age: {item.age}</Text>
      <Text style={{ color: theme.text }}>Phone: {item.phone}</Text>
      <Text style={{ color: theme.text, marginTop: 5 }}>{item.message}</Text>
      <Text style={[styles.timestamp, { color: theme.placeholder }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={consultations}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 20,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ConsultationsHistoryScreen;
