import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import app from "../firebase";
import GlobalStyles from "../styles/GlobalStyles";
import Spinner from "../components/Spinner";
import CustomButton from "../components/CustomButton";
import { BUTTON_COLOR, Colors } from "../assets/Colours";
import { Screens } from "../assets/constants/screens";
import ExpensesList from "../components/ExpenseItem";

const Home = (props) => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  if (user) {
    console.log("User, ", user);
    // setName(user.displayName);
  }
  const db = getFirestore(app);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState("");

  const handleSearch = (text) => {
    setSearchQuery(text);

    // For simplicity, you can filter expenses based on the searchQuery
    const filteredExpenses = allExpenses.filter(
      (expense) =>
        (expense.description &&
          expense.description.toLowerCase().includes(text.toLowerCase())) ||
        (expense.amount &&
          String(expense.amount).toLowerCase().includes(text.toLowerCase()))
    );
    setAllExpenses(filteredExpenses);
  };
  const onRefresh = () => {
    setRefreshing(true);
    getUserExpenses();
  };

  const getUserExpenses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "expenses"));

      const querySnapshot = await getDocs(q);
      const temp = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        temp.push(doc.data());
      });
      setAllExpenses(temp.reverse());
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserExpenses();
  }, []);
  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  return (
    <View style={styles.container}>
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
      <Text style={styles.title}>Expense Table</Text>
      <Text style={styles.subtitle}>Monitor your financial landscape</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
          // onChangeText={(text) => setSearchQuery(text)}
          // onSubmitEditing={handleSearch}
        />
        {/* <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity> */}
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Spinner animating={loading} />
        <ExpensesList
          expenses={filteredExpenses ? filteredExpenses : allExpenses}
        />
        {/* </View> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  title: {
    color: Colors.BUTTON_COLOR,
    fontSize: 24,
    marginTop: 25,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  subtitle: {
    color: Colors.BLACK,
    fontSize: 15,
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: "row",
    margin: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    marginRight: 5,
    borderColor: Colors.BUTTON_COLOR,
  },
  searchButton: {
    padding: 8,
    backgroundColor: BUTTON_COLOR,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: Colors.BLACK,
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
    paddingBottom: 8,
    marginBottom: 8,
  },
  cell: {
    flex: 1,
  },
});

export default Home;
