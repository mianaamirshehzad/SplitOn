import { StyleSheet } from "react-native";
import { BACKGROUND_COLOR, BUTTON_COLOR, Colors } from "../assets/Colours";

export default styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
  },
  title: {
    color: Colors.BUTTON_COLOR,
    fontSize: 25,
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 30,
    margin: 10,
  },
  corner: {
    width: 150,
    height: 150,
  },
});
