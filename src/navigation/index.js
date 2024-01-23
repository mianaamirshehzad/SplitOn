import * as React from "react";
import { NavigationContainer } from "@react-navigation/native"; 
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Strings } from "../assets/constants/strings";
import { Screens } from "../assets/constants/screens";

const Stack = createNativeStackNavigator();

const AuthenticationStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Strings.SIGNUP}
        component={Screens.SIGNUP_SCREEN}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Strings.FORGOT}
        component={Screens.FORGOT_SCREEN}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Strings.LOGIN}
        component={Screens.LOGIN_SCREEN}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Strings.ROOT_NAVIGATOR}
        component={Screens.ROOT_NAVIGATOR}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticationStack;
