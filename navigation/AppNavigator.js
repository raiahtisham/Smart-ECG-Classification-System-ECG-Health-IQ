import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../Screens/LoginScreen";
import SignupScreen from "../Screens/SignupScreen";
import HomeScreen from "../Screens/HomeScreen";
import WelcomeScreen from "../Screens/WelcomeScreen";
import Profile from "../Screens/Profile";
import ECGHistoryScreen from "../Screens/ECGHistoryScreen";
import ConsultDoctorScreen from "../Screens/ConsultDoctorScreen";
import ConsultationsHistoryScreen from "../Screens/ConsultationsHistoryScreen";
import ResetPassword from "../Screens/ResetPasswords";
import ECGChartScreen from "../Screens/ECGChartScreen";
import SettingsScreen from "../Screens/SettingsScreen";
import DoctorLoginScreen from "../Screens/DoctorLoginScreen";
import DoctorHomeScreen from "../Screens/DoctorHomeScreen";
import DoctorRegisterScreen from "../Screens/DoctorRegistrationScreen";
import ReplyConsultationScreen from "../Screens/ReplyConsultationScreen";
import DoctorProfile from "../Screens/DoctorProfile";
import FileUploadScreen from "../Screens/FileUploadScreen";

import SimulateECGScreen from "../Screens/SimulateECGScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerTitle: "Home",
        }}
      />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfile} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="ECGChart" component={ECGChartScreen} />
      <Stack.Screen name="ECGHistory" component={ECGHistoryScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="DoctorLoginScreen" component={DoctorLoginScreen} />
      <Stack.Screen name="DoctorHomeScreen" component={DoctorHomeScreen} />
      <Stack.Screen name="FileUploadScreen" component={FileUploadScreen} />
      <Stack.Screen name="SimulateECG" component={SimulateECGScreen} />

      <Stack.Screen
        name="DoctorRegisterScreen"
        component={DoctorRegisterScreen}
      />
      <Stack.Screen
        name="ConsultDoctor"
        component={ConsultDoctorScreen}
        options={{ title: "Consult a Doctor" }}
      />
      <Stack.Screen
        name="ConsultationsHistory"
        component={ConsultationsHistoryScreen}
        options={{ title: "My Consultations" }}
      />
      <Stack.Screen
        name="ReplyConsultation"
        component={ReplyConsultationScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
