import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Strings } from "../assets/constants/strings";
import { Screens } from "../assets/constants/screens";

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen
          name={Strings.BOTTOM_TABS}
          component={Screens.BOTTOM_TABS}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name={Strings.HOME}
          component={Screens.HOME_SCREEN}
          options={{ headerShown: false }}
        />
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
          name={Strings.ACCOUNT}
          component={Screens.ACCOUNT_SCREEN}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;
