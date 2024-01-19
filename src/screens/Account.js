import {
  Alert,
  FlatList,
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
  query,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Screens } from "../assets/constants/screens";
import AsyncStorage from "@react-native-async-storage/async-storage";
import app from "../firebase";
import GlobalStyles from "../styles/GlobalStyles";
import Spinner from "../components/Spinner";
import CustomButton from "../components/CustomButton";
import { BUTTON_COLOR } from "../assets/Colours";

const Account = (props) => {
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserData = async () => {
    try {
      const q = query(collection(db, "expenses"));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        setEmail(doc.data().creatorEmail);
        setDate(doc.data().date);
        setAmount(doc.data().amount);
        setDescription(doc.data().description);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getAllKeys();
    setTimeout(() => {
      getUserData();
      setLoading(false);
    }, 2000);
  }, []);

  const logoutUser = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();

      console.log("User removed from AsyncStorage");
      props.navigation.navigate(Screens.LOGIN_SCREEN);
    } catch (error) {
      console.log(error);
    }
  };
  const getAllKeys = async () => {
    let keys = [];
    try {
      keys = await AsyncStorage.getAllKeys();
    } catch (e) {
      // read key error
    }

    console.log(keys);
  };

  const data = [
    {
      id: "1",
      email: "user1@example.com",
      date: "2024-01-20",
      amount: "$50",
      description: "Purchase item A",
    },
    {
      id: "2",
      email: "user2@example.com",
      date: "2024-01-21",
      amount: "$30",
      description: "Purchase item B",
    },
    {
      id: "3",
      email: "user3@example.com",
      date: "2024-01-22",
      amount: "$25",
      description: "Purchase item C",
    },
    // Add more dummy data as needed
  ];
  const renderItem = ({}) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 4 }]}>{email}</Text>
      <Text style={[styles.cell, { flex: 3 }]}>{date}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{description}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{amount}</Text>
    </View>
  );
  return (
    <View style={[GlobalStyles.globalContainer]}>
      <View style={styles.cornerTop}>
        <Image
          source={require("../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      <View style={styles.cornerbottom}>
        <Image
          source={require("../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      {/* <View style={styles.container}> */}
      <Text style={GlobalStyles.title}>Expense Table</Text>
      <Spinner animating={loading} />
      {/* <View style={styles.info}>
        <Text style={styles.text}>{name}</Text>
        <Text style={styles.text}>{email}</Text>
        <Text style={styles.text}>{cnic}</Text>
        <Text style={styles.text}>{mobile}</Text>
      </View> */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerCell}>Email</Text>
          <Text style={styles.headerCell}>Date</Text>
          <Text style={styles.headerCell}>Description</Text>
          <Text style={styles.headerCell}>Amount</Text>
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>

      <CustomButton name="Logout" onPress={() => logoutUser()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    width: "98%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 8,
    marginBottom: 8,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
  },
  boldText: {
    fontWeight: "bold",
  },
  cornerTop: {
    left: -50,
    top: -50,
    position: "absolute",
  },
  cornerbottom: {
    right: -50,
    bottom: -50,
    position: "absolute",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BUTTON_COLOR,
    width: "95%",
    alignItems: "center",
    // paddingBottom: 8,
    // marginBottom: 8,
  },
  cell: {
    flex: 1,
  },
});

export default Account;
