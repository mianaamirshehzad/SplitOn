import React, { useState, useRef, useEffect } from "react";
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
import { addDoc, collection, getFirestore } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const modalAnimation = useRef(new Animated.Value(0)).current;
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
    // Ensure date has current time if it's invalid or not set
    if (!date || !date.isValid || !date.isValid()) {
      setDate(dayjs());
    }
    setDatePickerVisibility(!isDatePickerVisible);
  };

  const openModal = () => {
    modalAnimation.setValue(0); // Reset to 0 before animating
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
      
      // Validate required fields
      if (!amount.trim() || !description.trim() || !date) {
        alert("Oops! All fields are required");
        setLoading(false);
        return;
      }
      
      // Validate userEmail
      if (!userEmail) {
        alert("User not authenticated. Please login again.");
        setLoading(false);
        return;
      }
      
      // Convert date to Firestore-compatible format
      const dateValue = date && typeof date.toDate === 'function' 
        ? date.toDate() 
        : (date instanceof Date ? date : new Date());
      
      const expenseRef = await addDoc(collection(db, "expenses"), {
        amount: amount.trim(),
        description: description.trim(),
        date: dateValue,
        addedBy: userEmail.trim(),
        groupId: groupId || null,
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
      console.error("Error creating expense: ", error);
      alert(`Error creating expense: ${message}`);
      setLoading(false);
    } finally {
      setAmount("");
      setDescription("");
      setDate(dayjs());
      setLoading(false);
      onClose();
      if (fetchLatestData && typeof fetchLatestData === 'function') {
        fetchLatestData();
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      // Reset date to current date and time when modal opens
      setDate(dayjs());
      // Reset form fields when modal opens
      setAmount("");
      setDescription("");
      setDatePickerVisibility(false);
      // Start animation
      openModal();
    } else {
      // Reset animation when modal closes
      modalAnimation.setValue(0);
    }
  }, [isVisible]);

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.modalContainer}>
        <Animated.View
          style={[styles.modalContent, { opacity: modalAnimation }]}
        >
          {isDatePickerVisible ? (
            <View style={styles.dataContainer}>
              <DateTimePicker
                value={date && typeof date.toDate === 'function' 
                  ? date.toDate() 
                  : (date instanceof Date 
                    ? date 
                    : (date && date.isValid && date.isValid() 
                      ? date.toDate() 
                      : new Date()))}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setDate(dayjs(selectedDate));
                  } else if (event.type === 'dismissed') {
                    // If dismissed, keep current date/time
                    if (!date || !date.isValid || !date.isValid()) {
                      setDate(dayjs());
                    }
                  }
                  setDatePickerVisibility(false);
                }}
                textColor={Colors.BLACK}
              />
              <TouchableOpacity onPress={showDatePicker} style={styles.cancelButton}>
                <Text style={styles.cancelText}>
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
                autoCapitalize="words"
                title="Description"
                value={description}
                placeholder="Expense details..."
                onChangeText={(text) => setDescription(text)}
              />
              <CustomInput
                showTitle={true}
                date={date && typeof date.format === 'function' ? date.format("DD-MM-YYYY HH:mm") : ""}
                title="Date & Time"
                showDatePicker={showDatePicker}
              />

              {loading ? (
                <Spinner loading={loading} />
              ) : (
                <CustomButton
                  name={Strings.ADD_EXPENSE}
                  onPress={addExpenseToAccount}
                  disabled={!amount.trim() || !description.trim() || !date}
                />
              )}
            </>
          )}
        </Animated.View>
      </View>
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
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.BUTTON_COLOR,
    fontWeight: '600',
    fontSize: 16,
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
