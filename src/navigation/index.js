import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import Signup from "../screens/Signup";
import Forgot from "../screens/Forgot";
import Home from "../screens/Home";
import Account from "../screens/Account";

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Strings.LOGIN}
        component={Screens.LOGIN_SCREEN}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Strings.FORGOT}
        component={Screens.FORGOT_SCREEN}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Strings.SIGNUP}
        component={Screens.SIGNUP_SCREEN}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MyStack;
