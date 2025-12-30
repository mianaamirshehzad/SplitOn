import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "../assets/Colours";

const Loading = ({ size = "large", color = Colors.BUTTON_COLOR }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loading;

