import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Strings } from "../assets/constants/strings";
import { Screens } from "../assets/constants/screens";
import { NavigationContainer } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name={Strings.ADD_AMOUNT}
          component={Screens.ADD_AMOUNT_SCREEN}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name={Strings.ACCOUNT}
          component={Screens.ACCOUNT_SCREEN}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name={Strings.LOGIN}
          component={Screens.LOGIN_SCREEN}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default BottomTabs;
