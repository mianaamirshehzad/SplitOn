import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../assets/Colours";
import { Strings } from "../assets/constants/strings";
import { Screens } from "../assets/constants/screens";

const Tab = createBottomTabNavigator();

function BottomTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name={Strings.HOME}
        component={Screens.HOME_SCREEN}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="home"
              color={focused ? Colors.BUTTON_COLOR : Colors.BRIGHT}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name={Strings.ADD_AMOUNT}
        component={Screens.ADD_AMOUNT_SCREEN}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="plus"
              color={focused ? Colors.BUTTON_COLOR : Colors.BRIGHT}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name={Strings.ACCOUNT}
        component={Screens.ACCOUNT_SCREEN}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="account"
              color={focused ? Colors.BUTTON_COLOR : Colors.BRIGHT}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTab;
