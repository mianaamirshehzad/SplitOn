import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Images } from "../assets/constants/images";
import GlobalStyles from "../styles/GlobalStyles";

const Corner = () => {
  return (
    <View style={styles.container}>
      <View style={styles.cornerTop}>
        <Image source={Images.corner} style={GlobalStyles.corner} />
      </View>
      <View style={styles.cornerbottom}>
        <Image source={Images.corner} style={GlobalStyles.corner} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },

  cornerTop: {
    left: -280,
    top: -400,
    position: "absolute",
  },
  cornerbottom: {
    right: -250,
    bottom: -480,
    position: "absolute",
  },
});

export default Corner;
