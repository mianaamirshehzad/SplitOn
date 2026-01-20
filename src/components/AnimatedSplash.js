import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, UIManager, View } from "react-native";
import LottieView from "lottie-react-native";
import * as SplashScreen from "expo-splash-screen";
import { Colors } from "../assets/Colours";

const splashAnimation = require("../../assets/splash.json");

/**
 * Shows a Lottie JSON animation as an in-app splash screen.
 * Native splash must still be a static image (PNG/JPG) via app.json.
 */
export default function AnimatedSplash({ onFinish }) {
  const lottieRef = useRef(null);

  const hasNativeLottie = useMemo(() => {
    try {
      // If this is missing, LottieView will crash when it tries to call Commands.
      const cfg =
        typeof UIManager.getViewManagerConfig === "function"
          ? UIManager.getViewManagerConfig("LottieAnimationView")
          : UIManager.LottieAnimationView;
      return !!cfg;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Keep native splash visible until this component is mounted.
    SplashScreen.preventAutoHideAsync?.().catch(() => {});
  }, []);

  useEffect(() => {
    // If the native Lottie view manager isn't available (e.g. Expo Go),
    // skip the animation instead of crashing.
    if (!hasNativeLottie) {
      SplashScreen.hideAsync?.().catch(() => {});
      if (typeof onFinish === "function") onFinish();
    }
  }, [hasNativeLottie, onFinish]);

  const onLayoutRootView = useCallback(() => {
    // Hide native splash once our JS splash is ready to render.
    SplashScreen.hideAsync?.().catch(() => {});
  }, []);

  if (!hasNativeLottie) {
    return <View style={styles.container} onLayout={onLayoutRootView} />;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <LottieView
        ref={lottieRef}
        source={splashAnimation}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          if (typeof onFinish === "function") onFinish();
        }}
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors?.WHITE || "#ffffff",
  },
  lottie: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});


