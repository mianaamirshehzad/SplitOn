import { useEffect, useState } from "react";
import { View } from "react-native";
import BottomTab from "./BottomTab";
import { NavigationContainer } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AuthenticationStack } from "../navigation/index";

const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
    });
    // Return the cleanup function to unsubscribe
    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {isLoggedIn ? <BottomTab /> : <AuthenticationStack />}
      </NavigationContainer>
    </View>
  );
};

export default RootNavigator;