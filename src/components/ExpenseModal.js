import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Animated,
  Dimensions,
  Button,
} from "react-native";
import { addDoc, collection, getFirestore } from "@firebase/firestore";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from 'dayjs';
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../assets/Colours";
import { Strings } from "../assets/constants/strings";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Spinner from "./Spinner";
import { getAuth } from "firebase/auth";
import app from "../firebase";

const { height } = Dimensions.get("window");

const ExpenseModal = ({ isVisible, onClose, fetchLatestData, id }) => {
  const modalAnimation = new Animated.Value(0);
  const auth = getAuth(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const user = auth.currentUser;
  const db = getFirestore(app);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs());

  const [groupId, setGroupId] = useState(id);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(!isDatePickerVisible);
  };

  console.log(`data ${date.format("DD-MM-YYYY")}`);
  
  const openModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
    setTimeout(() => onClose(), 300);
  };

  const addExpenseToAccount = async () => {
    try {
      setLoading(true);
      Keyboard.dismiss();
      if (!amount && !description && !date) {
        alert("Oops! Fields missing");
        return;
      }
      const expenseRef = await addDoc(collection(db, "expenses"), {
        amount: amount.trim(),
        description: description.trim(),
        date: date,
        addedBy: userEmail.trim(),
        groupId: groupId,
      });
      console.log("Expense saved with ID: ", expenseRef.id);

      // Save the document locally using AsyncStorage upon successful upload
      let localExpenses = [];
      localExpenses.push({
        amount: amount.trim(),
        description: description.trim(),
        date: date,
        addedBy: userEmail.trim(),
      });
      //   await AsyncStorage.setItem(
      //     "localExpenses",
      //     JSON.stringify(localExpenses)
      //   );

      //   const savedData = await AsyncStorage.getItem("localExpenses");
      //   console.log("Data saved after uploading: ", savedData);
    } catch (error) {
      const message = error.message;
      console.log("Error creating expense ", message);
    } finally {
      setAmount(null);
      setDescription(null);
      setDate("");
      setLoading(false);
      onClose();
      fetchLatestData();
    }
  };

  React.useEffect(() => {
    if (isVisible) openModal();
  }, [isVisible]);

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <Animated.View
        style={[styles.modalContainer, { opacity: modalAnimation }]}
      >
        <View style={styles.modalContent}>
          {isDatePickerVisible ? (
            <View style={styles.dataContainer}>
              <DateTimePicker
                mode="single"
                date={date.toDate()} 
                onChange={(params) => {
                    setDate(dayjs(params.date));
                    setDatePickerVisibility(false);
                }}
                selectedItemColor ={Colors.BLACK}
                headerButtonColor = { Colors.RED}
              />
              <TouchableOpacity onPress={showDatePicker} >
                <Text style = {styles.cancelText} >
                    Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <MaterialIcons name="close" size={25} color={Colors.WHITE} />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>What you spent?</Text>
                <Text style={styles.subtitle}>Document your expense</Text>
              </View>

              {/* <Spinner animating={loading} /> */}

              <CustomInput
                showTitle={true}
                title="Amount"
                keyboardType="numeric"
                placeholder="Rs."
                value={amount}
                onChangeText={(text) => setAmount(text)}
              />
              <CustomInput
                showTitle={true}
                title="Description"
                value={description}
                placeholder="Expense details..."
                onChangeText={(text) => setDescription(text)}
              />
              <CustomInput
                showTitle={true}
                value={date.format("DD-MM-YYYY")}
                title="Date"
                showDatePicker={showDatePicker}
              />

              {loading ? (
                <Spinner loading={loading} />
              ) : (
                <CustomButton
                  name={Strings.ADD_EXPENSE}
                  onPress={addExpenseToAccount}
                />
              )}
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    maxHeight: height * 0.8, // Limit modal height
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  dataContainer: {
    left: 0,
    right: 0,
    backgroundColor: Colors.BACKGROUND_COLOR, 
    zIndex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BUTTON_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    padding: 10,
    margin: 10
  },
  cancelText : {
    color: Colors.Button,
    fontWeight: '600'
  }, 
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.RED,
    borderRadius: 30,
    padding: 5,
  },
  closeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ExpenseModal;
