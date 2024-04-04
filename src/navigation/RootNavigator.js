import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screens } from "../assets/constants/screens";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import AuthenticationStack from ".";
import BottomTab from "./BottomTab";
import { Text, View } from "react-native";

const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // New state variable for initialization status

  const auth = getAuth();

  const checkLoginStatus = async () => {
    try {
      const userLoggedIn = await AsyncStorage.getItem("userLoggedIn");
      if (userLoggedIn) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error(
        "Error reading user login status from AsyncStorage:",
        error
      );
    }
  };

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setIsLoggedIn(true);
      console.log("User is logged: " + isLoggedIn);
      try {
        await AsyncStorage.setItem("userLoggedIn", "true");
      } catch (error) {
        console.error(
          "Error setting user login status in AsyncStorage:",
          error
        );
      }
    } else {
      setIsLoggedIn(false);
      try {
        await AsyncStorage.removeItem("userLoggedIn");
      } catch (error) {
        console.error(
          "Error removing user login status from AsyncStorage:",
          error
        );
      }
    }
  });

  useEffect(() => {
    checkLoginStatus();
    unsubscribe();
    // return () => unsubscribe();
  }, [isLoggedIn]);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {isLoggedIn ? <BottomTab /> : <AuthenticationStack />}
      </NavigationContainer>
    </View>
  );
};

export default RootNavigator;
