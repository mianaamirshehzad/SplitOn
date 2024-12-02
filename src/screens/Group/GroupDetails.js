import React, { useCallback, useState, useEffect, useFocusEffect } from 'react';
import { View, Text, StyleSheet,Keyboard, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '../../assets/Colours';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ExpenseItem from '../../components/ExpenseItem';
import { collection, getDocs, getFirestore, orderBy, query } from '@firebase/firestore';
import app from '../../firebase';
import { getAuth } from 'firebase/auth';
import ExpenseModal from '../../components/ExpenseModal';

const GroupDetails = ({ route }) => {
  const { groupData, title } = route.params || {};
  const { groupName, groupDescription, members } = groupData;
  const navigation = useNavigation();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);

  const [modalVisible, setModalVisible] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selection, setSelection] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const userName = auth.name ? auth.currentUser.displayName : null;
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [showModal, setShowModal] = useState(false);

  // console.log("Received groupData:", groupData);
  // console.log("Received allExpenses:", allExpenses);

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
      console.log(error.message);
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
      await AsyncStorage.setItem(
        "localExpenses",
        JSON.stringify(localExpenses)
      );

      const savedData = await AsyncStorage.getItem("localExpenses");
      console.log("Data saved after uploading: ", savedData);
    } catch (error) {
      const message = error.message;
      console.log("Error creating expense ", message);
    } finally {
      setAmount(null);
      setDescription(null);
      setDate("");
      setLoading(false);
      setShowModal(false);
    }
  };


  // useFocusEffect(
  //   useCallback(() => {
  //     getUserExpenses();
  //   }, [])
  // );
  useEffect(() => {
    getUserExpenses();
  }, []);

  useEffect(() => {
    if (groupData) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.header} >
            <Text style={styles.headerTitle}>{groupData.groupName}</Text>
            <Text style={styles.headerSubtitle}>{groupData.groupDescription}</Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity >
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
        ),
      });
    }
  }, [groupData]);

  useEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [title])

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredExpenses.length > 0 ? filteredExpenses : allExpenses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <ExpenseItem
            id={item.id}
            addedBy={item.addedBy}
            description={item.description}
            amount={item.amount}
            date={item.date.toString()} // React needs to have string representation for date
            onLongPress={() => itemSelector(item)}
            selected={selection}
          />
        )}
      />

      <ExpenseModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        fetchLatestData = {getUserExpenses}

      />

      {/* Floating Plus Icon */}
      <TouchableOpacity
        style={styles.floatingPlusButton}
        onPress = {() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  members: {
    fontSize: 16,
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  floatingPlusButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.BUTTON_COLOR,
    borderRadius: 30,
    padding: 10,
    elevation: 5, // Adds shadow for Android
    shadowColor: "#000", // Adds shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default GroupDetails;