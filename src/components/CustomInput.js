import React, { useState, forwardRef } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { BUTTON_COLOR } from "../assets/Colours";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { Images } from "../assets/constants/images";

const CustomInput = forwardRef((props, ref) => {
  
  return (
    <View style={styles.container}>
      {props.showTitle && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{props.title}</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        {props.showDatePicker ? (
          <View style={[styles.dateContainer, styles.input, { padding: 0 }]}>
            <View style={styles.date}>
              <Text>{props.date}</Text>
            </View>
            <TouchableOpacity
              onPress={props.showDatePicker}
              style={styles.calendarButton}
            >
              <Image
                source={Images.calendar}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            ref={ref}
            placeholder={props.placeholder}
            style={styles.input}
            secureTextEntry={props.secureTextEntry}
            onChangeText={(t) => props.onChangeText(t)}
            value={props.value}
            keyboardType={props.keyboardType}
            returnKeyType={props.returnKeyType}
            onSubmitEditing={props.onSubmitEditing}
            blurOnSubmit={props.blurOnSubmit}
            autoCapitalize={props.autoCapitalize}
          />
        )}
      </View>
     
    </View>
  );
});

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    padding: 5,
    alignSelf: "center",
  },
  dataContainer: {
    position: "absolute",
    top: "100%", // Position the calendar below the input field
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF", // Background to make it visually separate
    zIndex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BUTTON_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    padding: 10,
  },
  textContainer: {
    paddingLeft: 5,
  },
  text: {
    color: Colors.BUTTON_COLOR,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  input: {
    flex: 1,
    borderColor: BUTTON_COLOR,
    borderWidth: 0.5,
    borderRadius: 10,
    height: 50,
    padding: 15,
    margin: 5,
  },
  calendarButton: {
    padding: 15,
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  date: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});