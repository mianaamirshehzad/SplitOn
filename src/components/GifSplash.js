import React, { useEffect, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Colors } from "../assets/Colours";

/**
 * In-app splash using a GIF. Note: native splash (app.json) must still be a static PNG/JPG.
 */
export default function GifSplash({ onFinish, durationMs = 2500 }) {
  const didHideNativeSplash = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof onFinish === "function") onFinish();
    }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onFinish]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/splash.gif")}
        style={styles.image}
        resizeMode="contain"
        onLoadEnd={() => {
          // Hide native splash only after the GIF is ready to render
          if (didHideNativeSplash.current) return;
          didHideNativeSplash.current = true;
          SplashScreen.hideAsync?.().catch(() => {});
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});


