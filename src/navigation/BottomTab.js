import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Strings } from "../assets/constants/strings";
import { Screens } from "../assets/constants/screens";

const Tab = createBottomTabNavigator();

function BottomTab() {
  return (
    <Tab.Navigator>
      <Tab.Screen name = {Strings.HOME} 
      component={Screens.HOME_SCREEN}
      options={{ headerShown: false}} />
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
   
    </Tab.Navigator>
  );
}

export default BottomTab;
