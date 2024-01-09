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
  getrFirestore,
  query,
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

const Home = (props) => {
  //   const auth = getAuth(app);
  //   const db = getFirestore(app);
  //   const [name, setName] = useState("");

  //   const getUserData = async () => {
  //     try {
  //       const q = query(collection(db, "users"));

  //       const querySnapshot = await getDocs(q);
  //       querySnapshot.forEach((doc) => {
  //         // doc.data() is never undefined for query doc snapshots
  //         console.log(doc.id, " => ", doc.data().name);
  //         setName(doc.data().name);
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   useEffect(() => {
  //     getUserData();
  //   }, []);

  return (
    <View style={GlobalStyles.globalContainer}>
      {/* <Text>Welcome {name}</Text> */}
      <Corner />
      <CustomInput
        showTitle={true}
        title="Amount"
        keyboardType="numeric"
        placeholder="Rs."
      />
      <CustomInput
        showTitle={true}
        title="Description"
        placeholder="Expense details..."
      />
      <CustomInput showTitle={true} title="Date" showDatePicker={true} />
      <CustomView
        name={Strings.ACCOUNT}
        source={Images.user}
        // onPress={() => props.navigation.navigate(Strings.ACCOUNT)}
      />
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

export default Home;
