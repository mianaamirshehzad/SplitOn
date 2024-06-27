import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
  SafeAreaView,
  Button,
} from "react-native";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import app from "../firebase";
import GlobalStyles from "../styles/GlobalStyles";
import Spinner from "../components/Spinner";
import ExpenseItem from "../components/ExpenseItem";
import { BUTTON_COLOR, Colors } from "../assets/Colours";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, deleteDoc } from "firebase/firestore";
import AddAmount from "./AddAmount";
import UpdateModal from "../components/UpdateModal";

const Home = (props) => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);

  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selection, setSelection] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text || text === " ") {
      setFilteredExpenses(allExpenses);
    }
    const filteredData = allExpenses.filter(
      (expense) =>
        (expense.description &&
          expense.description.toLowerCase().includes(text.toLowerCase())) ||
        (expense.amount &&
          String(expense.amount).toLowerCase().includes(text.toLowerCase()))
    );

    setFilteredExpenses(filteredData);
  };

  const cancelSearch = () => {
    setSearchQuery("");
    setFilteredExpenses("");
  };

  const onRefresh = () => {
    setRefreshing(true);
    getUserExpenses();
  };

  const getUserExpenses = async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, "expenses"), orderBy("date", "desc"));

      const querySnapshot = await getDocs(q);
      const temp = [];
      querySnapshot.forEach((doc) => {
        let id = doc.id;
        let data = doc.data();
        let merge = { ...data, id };
        console.log(" => ", merge);
        temp.push(merge);
      });
      setAllExpenses(temp);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const itemSelector = (expense) => {
    setSelectedExpense(expense);
    setSelection(true);
    console.log("expense item", selectedExpense);
  };

  const showAlert = (item) => {
    Alert.alert(
      "Do you want to delete expense item?",
      "Caution: Delete cannot be undone.",
      [
        {
          text: "Yes",
          onPress: () => expenseDeletor(selectedExpense),
          style: "cancel",
        },
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () =>
          console.log(
            "This alert was dismissed by tapping outside of the alert dialog."
          ),
      }
    );
  };

  const expenseDeletor = async (item) => {
    setSelection(false);
    try {
      setLoading(true);
      setSelection(!selection);
      const expenseRef = doc(db, "expenses", item.id);
      await deleteDoc(expenseRef);
      setSelection(!selection);

      getUserExpenses();
      setLoading(false);
    } catch (error) {
      console.error("Error deleting expense: ", error);
    } finally {
      setLoading(false);
    }
  };
  const updateExpense = async (item) => {
    setSelection(false);
    try {
      setLoading(true);
      setSelection(!selection);
      const expenseRef = doc(db, "expenses", item.id);
      await updateDoc(expenseRef, {
        amount: 58900,
      });
      setSelection(!selection);
      setSelectedExpense(null);
      getUserExpenses();
      setLoading(false);
    } catch (error) {
      console.error("Error updating expense: ", error);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      getUserExpenses();
    }, [])
  );
  useEffect(() => {
    getUserExpenses();
  }, []);

  console.log("all expenses array", modalVisible);

  return (
    <SafeAreaView style={styles.container}>
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
      {selection ? (
        <View style={styles.selectionContainer}>
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>Action required</Text>
            {/* <View style={styles.actionButtons} > */}
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="pencil"
                size={25}
                color={Colors.WHITE}
                onPress={() => updateExpense(selectedExpense)}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="delete"
                size={25}
                color={Colors.WHITE}
                onPress={() => showAlert()}
              />
            </TouchableOpacity>
            {/* </View> */}
          </View>
        </View>
      ) : (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Expense Table</Text>
          <Text style={styles.subtitle}>Monitor your financial landscape</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Type to search..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery && (
              <TouchableOpacity style={{ left: -25 }} onPress={cancelSearch}>
                <Text>X</Text>
              </TouchableOpacity>
            )}
          </View>
          <Button title="show modal" onPress={() => setModalVisible(true)} />
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <UpdateModal
          animating={modalVisible}
          onClosePress={handleCloseModal}
          onRequestClose={handleCloseModal}
          onUpdate={()=> setModalVisible(false)}
        />
        <Spinner animating={loading} />
        <FlatList
          data={filteredExpenses.length > 0 ? filteredExpenses : allExpenses}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <ExpenseItem
              id={item.id}
              addedBy={item.addedBy}
              description={item.description}
              amount={item.amount}
              date={item.date}
              onLongPress={() => itemSelector(item)}
              selected={selectedExpense && selectedExpense.id == item.id}
            />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  titleContainer: {
    paddingTop: 15,
  },
  selectionContainer: {
    width: "95%",
    backgroundColor: Colors.BLACK,
    paddingVertical: 5,
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  actionButtons: {
    flexDirection: "row",
    marginHorizontal: 50,
  },

  actionText: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: "bold",
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
    marginHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 15,
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
