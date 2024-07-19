import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { Strings } from "../assets/constants/strings";
import Spinner from "../components/Spinner";
import { Colors } from "../assets/Colours";

const UpdateModal = (props) => {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);

  return (
    <Modal animationType="slide" transparent={true} visible={props.visible}>
      <View style={[styles.container]}>
        <TouchableOpacity onPress={props.onClose} style={styles.cross}>
          <Text style={styles.subtitle}>x</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Want to change something?</Text>
        </View>
        <Spinner animating={loading} />
        <CustomInput
          showTitle={true}
          title="Amount"
          keyboardType="numeric"
          placeholder="Rs.1040"
          value={props.amount}
          onChangeText={props.onChangeAmount}
        />
        <CustomInput
          showTitle={true}
          title="Description"
          value={props.description}
          placeholder="Expense details..."
          onChangeText={props.onChangeDesc}
        />
        <CustomInput
          showTitle={true}
          value={props.date}
          title="Date"
          showDatePicker={true}
          // onDateSelected={props.onDateSelected}
        />
        <CustomButton name={Strings.UPDATE_EXPENSE} onPress={props.onUpdate} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 40,
    marginHorizontal: 10,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 4,
    flex: 0.75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  cross: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  forgot: {
    padding: 5,
    alignItems: "flex-end",
    marginLeft: "auto",
    marginRight: 40,
  },
  titleContainer: {
    // paddingTop: 15,
  },
  title: {
    color: Colors.BUTTON_COLOR,
    fontSize: 24,
    marginTop: 25,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  subtitle: {
    color: Colors.BUTTON_COLOR,
    fontSize: 25,
  },
});

export default UpdateModal;
