import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
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
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import app from "../../firebase";
import GlobalStyles from "../../styles/GlobalStyles";
import Spinner from "../../components/Spinner";
import CustomButton from "../../components/CustomButton";
import { BUTTON_COLOR, Colors } from "../../assets/Colours";
import { Screens } from "../../assets/constants/screens";
import ExpensesList from "../../components/ExpenseItem";

const Account = (props) => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);


  const getMyExpenses = async () => {
    // setLoading(true);
    setRefreshing(true);
    try {
      const q = query(
        collection(db, "expenses"),
        orderBy("date", "desc"),
        where("addedBy", "==", userEmail) 
      );

      const querySnapshot = await getDocs(q);
      const temp = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        temp.push(doc.data());
      });
      setAllExpenses(temp);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };


  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      getMyExpenses();
      setLoading(false);
    }, 2000);
  }, []);

  const logoutUser = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();

      console.log("User removed from AsyncStorage => Navigating to Login");
      // props.onLogout();
      props.navigation.navigate(Screens.ROOT_NAVIGATOR);
    } catch (error) {
      console.log(error);
      console.log(error.message);
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

  const onRefresh = () => {
    setRefreshing(true);
    getMyExpenses();
  };

  return (
    <View style={styles.container}>
      <View style={styles.cornerTop}>
        <Image
          source={require("../../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      <View style={styles.cornerbottom}>
        <Image
          source={require("../../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      <View style={styles.titleContainer}>
        <Text style={GlobalStyles.title}>My Expenses</Text>
      </View>
      <Spinner animating={loading} />
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Spinner animating={loading} />
          <ExpensesList
            expenses={
              allExpenses
            }
          />
        </ScrollView>
      </View>

      <CustomButton name="Logout" onPress={() => logoutUser()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  titleContainer: {
    paddingTop: 25,
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
