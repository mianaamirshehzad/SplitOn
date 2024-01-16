import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  getrFirestore,
  query,
  setDoc,
} from "firebase/firestore";
import app from "../firebase";
import GlobalStyles from "../styles/GlobalStyles";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import CustomView from "../components/CustomView";
import { getAuth } from "@firebase/auth";
import { Images } from "../assets/constants/images";
import Corner from "../components/Corner";
import { Strings } from "../assets/constants/strings";
import Spinner from "../components/Spinner";

const AddAmount = (props) => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const addExpenseToAccount = async (auth) => {
    try {
      setLoading(true);
      if (!amount && !description && !date) {
        alert("Fields missing");
        return;
      }

      await setDoc(doc(db, "expenses", user.email), {
        amount: amount,
        description: description,
        date: date,
      });
      console.log("Expense added to account");
    } catch (error) {
      const message = error.message;
      console.log(message);
    } finally {
      setAmount(null);
      setDescription(null);
      setDate(null);
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.globalContainer}>
      {/* <Text>Welcome {name}</Text> */}
      <Corner />
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
});

export default AddAmount;
