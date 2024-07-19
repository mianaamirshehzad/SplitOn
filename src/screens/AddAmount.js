import { Keyboard, StyleSheet, View, Text, TextInput } from "react-native";
import React, { useState, useEffect } from "react";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import app from "../firebase";
import GlobalStyles from "../styles/GlobalStyles";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { getAuth } from "@firebase/auth";
import Corner from "../components/Corner";
import { Strings } from "../assets/constants/strings";
import Spinner from "../components/Spinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../assets/Colours";

const AddAmount = (props) => {
  const auth = getAuth(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const userName = auth.name ? auth.currentUser.displayName : null;
  const db = getFirestore(app);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  // console.log(`User outsise=====: ${JSON.stringify(userName)}`);

  const addExpenseToAccount = async () => {
    try {
      setLoading(true);
      Keyboard.dismiss();

      if (!amount || !description || !date) {
        alert("Oops! Fields missing");
        return;
      }

      const expenseRef = await addDoc(collection(db, "expenses"), {
        amount: amount.trim(),
        description: description.trim(),
        date: date,
        addedBy: userEmail.trim(),
      });
      console.log("Expense saved with ID: ", expenseRef.id);

      let localExpenses = [];
      localExpenses.push({
        amount: amount.trim(),
        description: description.trim(),
        date: date,
        addedBy: userEmail.trim(),
      });
      await AsyncStorage.setItem(
        "localExpenses",
        JSON.stringify(localExpenses)
      );

      const savedData = await AsyncStorage.getItem("localExpenses");
      console.log("Data saved after uploading: ", savedData);
    } catch (error) {
      const message = error.message;
      console.log(message);
    } finally {
      setAmount(null);
      setDescription(null);
      setDate("");
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toDateString();
    console.log(today);
    setDate(today);
  }, []);

  return (
    <View style={GlobalStyles.globalContainer}>
      {/* <Text>Welcome</Text> */}
      <Corner />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>What did you spent?</Text>
        <Text style={styles.subtitle}>Document your expense</Text>
      </View>
      <Spinner animating={loading} />
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
        value={date}
        title="Date"
        showDatePicker={true}
        onDateSelected={(date) => setDate(date.toDateString())}
      />
      <CustomButton name={Strings.ADD_EXPENSE} onPress={addExpenseToAccount} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: Colors.BUTTON_COLOR,
    fontSize: 24,
    marginTop: 25,
    fontWeight: "bold",
    padding: 10,
  },
  subtitle: {
    color: Colors.BLACK,
    fontSize: 15,
    paddingHorizontal: 10,
  },
});

export default AddAmount;
