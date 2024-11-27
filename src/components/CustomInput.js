import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BUTTON_COLOR } from "../assets/Colours";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { Images } from "../assets/constants/images";
import GlobalStyles from "../styles/GlobalStyles";

export default function CustomInput(props) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState();

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    hideDatePicker();
    props.onDateSelected(date);
    setDate(date.toDateString());
  };

  // console.log(date);
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
              onPress={showDatePicker}
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
      {props.showDatePicker && (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    padding: 5,
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
