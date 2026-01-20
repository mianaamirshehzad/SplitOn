import { useEffect, useState } from "react";
import { View } from "react-native";
import BottomTab from "./BottomTab";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { AuthenticationStack } from "../navigation/index";
import { registerAndSavePushTokenAsync } from "../utils/pushNotifications";
import { auth } from "../firebase";

const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      if (user?.email) {
        // Best-effort: don't block UI if this fails
        registerAndSavePushTokenAsync(user.email).catch(() => {});
      }
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
