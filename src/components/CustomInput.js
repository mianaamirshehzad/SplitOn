import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
// import DateTimePickerModal from "react-native-modal-datetime-picker";
import DateTimePicker from "react-native-ui-datepicker";
import { BUTTON_COLOR } from "../assets/Colours";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { Images } from "../assets/constants/images";
import GlobalStyles from "../styles/GlobalStyles";

export default function CustomInput(props) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState();

  // const showDatePicker = () => {
  //   setDatePickerVisibility(!isDatePickerVisible);
  // };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    hideDatePicker();
    props.onDateSelected(date);
    setDate(date.toDateString());
  };

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
              <Text>{date}</Text>
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
            placeholder={props.placeholder}
            style={styles.input}
            secureTextEntry={props.secureTextEntry}
            onChangeText={(t) => props.onChangeText(t)}
            value={props.value}
            keyboardType={props.keyboardType}
          />
        )}
      </View>
      {isDatePickerVisible && (
        <View style={styles.dataContainer}>
          <DateTimePicker
            mode="single"
            date={date}
            // onChange={(params) => setDate(params.date)}
          />
        </View>
      )}
    </View>
  );
}

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

// {props.showDatePicker && (
//   <DateTimePickerModal
//     isVisible={isDatePickerVisible}
//     mode="date"
//     onConfirm={handleDateConfirm}
//     onCancel={hideDatePicker}
//   />
// )}
