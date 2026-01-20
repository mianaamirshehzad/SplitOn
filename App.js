import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import RootNavigator from "./src/navigation/RootNavigator";
import GifSplash from "./src/components/GifSplash";

// Keep the native splash visible until we explicitly hide it (after GIF is loaded).
SplashScreen.preventAutoHideAsync?.().catch(() => {});

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <View style={styles.container}>
      {splashDone ? (
        <RootNavigator />
      ) : (
        <GifSplash onFinish={() => setSplashDone(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
