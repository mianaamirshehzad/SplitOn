import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Strings } from "../assets/constants/strings";
import { Screens } from "../assets/constants/screens";

const Stack = createNativeStackNavigator();

export const AuthenticationStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Strings.LOGIN}
        component={Screens.LOGIN_SCREEN}
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
    </Stack.Navigator>
  );
};

 export const GroupsStack = () => {
  return (
    <Stack.Navigator
    >
      <Stack.Screen
        name={Strings.GROUPS}
        component={Screens.GROUPS_SCREEN}
        options={{ headerShown: false }}

      />
      <Stack.Screen
        name={Strings.GROUP_DETAILS}
        component={Screens.GROUP_DETAILS}
        options={({ route }) => ({
          tabBarStyle: { display: 'none' }, // Hide bottom tab bar on GroupDetails screen
          headerShown: true, // Show header for GroupDetails
        })}
      />
    </Stack.Navigator>
  );
};
