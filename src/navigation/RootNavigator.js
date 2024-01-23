import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Screens } from "../assets/constants/screens";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import AuthenticationStack from ".";
import BottomTab from "./BottomTab";
import { Text, View } from "react-native";

const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Listen for changes in the authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setIsLoggedIn(true);
        console.log("User is logged: " + isLoggedIn);
      } else {
        // User is signed out
        setIsLoggedIn(false);
      }
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  }, [isLoggedIn]);

  return (
    <View style = {{flex: 1}} >
      <NavigationContainer>
        {isLoggedIn ? <AuthenticationStack /> : <BottomTab />}
      </NavigationContainer>
    </View>
  );
};

export default RootNavigator;
