import React from "react";


import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import SelectUser from "../screens/Login/SelectUser";
import WelcomeScreen from "../screens/Welcome/WelcomeScreen"
import AddNewUser from "../screens/SignUp/AddNewUser";
import LoginScreen from "../screens/Login/loginScreen";
import MainScreen from "../screens/mainScreen/MainScreen";
import PasswordsScreen from "../screens/Categories/PasswordsScreen";
import NotesScreen from "../screens/Categories/NotesScreen";
import CardsScreen from "../screens/Categories/CardsScreen";
import EmailsScreen from "../screens/Categories/EmailsScreen";

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen name="SelectUser" component={SelectUser} options={{headerShown: false}}></Stack.Screen> */}

      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{headerShown: false}}></Stack.Screen>
    
      <Stack.Screen name="AddUser" component={AddNewUser} options={{headerShown: false}}></Stack.Screen>

      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}></Stack.Screen>

      <Stack.Screen name="Main" component={MainScreen} options={{headerShown: false}}></Stack.Screen>
      
      <Stack.Screen name="Passwords" component={PasswordsScreen} options={{headerShown: false}}></Stack.Screen>
      <Stack.Screen name="Notes" component={NotesScreen} options={{headerShown: false}}></Stack.Screen>
      <Stack.Screen name="Cards" component={CardsScreen} options={{headerShown: false}}></Stack.Screen>
      <Stack.Screen name="Emails" component={EmailsScreen} options={{headerShown: false}}></Stack.Screen>
    </Stack.Navigator>
  );
}