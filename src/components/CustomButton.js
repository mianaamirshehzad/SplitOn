import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { BUTTON_COLOR, Colors } from "../assets/Colours";

export default function CustomButton(props) {
  const isDisabled = props.disabled || false;
  
  return (
    <TouchableOpacity 
      onPress={() => !isDisabled && props.onPress()} 
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        props.style
      ]}
      disabled={isDisabled}
    >
      {/* Spread Operators will help to add more styles than default ones  */}
      <Text style={[
        styles.buttonText,
        isDisabled && styles.buttonTextDisabled
      ]}>
        {props.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.BUTTON_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    width: "80%",
    alignSelf: "center",
    padding: 15,
    margin: 5,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: "bold",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 15,
    color: "white",
  },
  buttonTextDisabled: {
    color: "#888888",
  },
});
