import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Share,
  FlatList,
  Alert,
  TextInput,
  RefreshControl,
  Image,
  Switch,
  Modal,
} from "react-native";
// import firestore from '@react-native-firebase/firestore';
import * as Sharing from "expo-sharing";
import Checkbox from "expo-checkbox";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../assets/Colours";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ExpenseItem from "../../components/ExpenseItem";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  doc,
  deleteDoc,
  addDoc,
  Firestore,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import app from "../../firebase";
import { getAuth } from "firebase/auth";
import ExpenseModal from "../../components/ExpenseModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screens } from "../../assets/constants/screens";
import ExpenseCalculatorModal from "../../components/ExpenseCalculatorModal";
import Login from "../Authentication/Login";

const GroupDetails = ({ route }) => {
  const { groupData, title } = route.params || {};
  const { groupName, groupDescription, members, groupImage, id } = groupData;
  const navigation = useNavigation();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);

  const [modalVisible, setModalVisible] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selection, setSelection] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const userName = auth.name ? auth.currentUser.displayName : null;
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState(id);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);

  const getUserExpenses = async () => {
    setRefreshing(true);
    try {
      const q = query(
        collection(db, "expenses"),
        where("groupId", "==", currentGroupId),
        
      );
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
      // calculateTotal will be called automatically via useEffect when allExpenses updates
    } catch (error) {
      console.log(error.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    // Only calculate total from unsplit expenses
    allExpenses?.forEach((value) => {
      if (!value.isSplit) {
        total += Number(value.amount) || 0;
      }
    });
    setTotalAmount(total);
  };

  const calculateSelectedTotal = () => {
    let total = 0;
    selectedExpenseIds.forEach((expenseId) => {
      const expense = allExpenses.find((e) => e.id === expenseId);
      if (expense && !expense.isSplit) {
        total += Number(expense.amount) || 0;
      }
    });
    return total;
  };

  // Recalculate total whenever allExpenses changes
  useEffect(() => {
    calculateTotal();
  }, [allExpenses]);

  const generateInviteLink = async () => {
    const inviteLink = `https://spliton.com/join-group/${currentGroupId}`;
    console.log(inviteLink);

    try {
      const result = await Share.share({
        message: `Join our group using this link: ${inviteLink}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Link shared successfully!");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed.");
      }
    } catch (error) {
      console.error("Error sharing invite link:", error.message);
    }
  };

  const itemSelector = (expense) => {
    setSelectedExpense(expense);
    setSelection(true);
    console.log("expense item", selectedExpense);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getUserExpenses();
  };

  const showAlert = (item) => {
    setSelection(false);
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

  const toggleSwitch = (value) => {
    setIsEnabled(value);
    if (value) {
      // Enable selection mode instead of opening modal immediately
      setIsSelectMode(true);
      setSelectedExpenseIds([]);
    } else {
      // Disable selection mode
      setIsSelectMode(false);
      setSelectedExpenseIds([]);
    }
  };

  const handleExpenseSelect = (expenseId) => {
    setSelectedExpenseIds((prev) => {
      if (prev.includes(expenseId)) {
        return prev.filter((id) => id !== expenseId);
      } else {
        return [...prev, expenseId];
      }
    });
  };

  const handleSplitSelected = () => {
    if (selectedExpenseIds.length === 0) {
      Alert.alert("No Selection", "Please select at least one expense to split.");
      return;
    }
    // Filter out already split expenses
    const unsplitSelected = selectedExpenseIds.filter((id) => {
      const expense = allExpenses.find((e) => e.id === id);
      return expense && !expense.isSplit;
    });
    
    if (unsplitSelected.length === 0) {
      Alert.alert("Already Split", "Selected expenses have already been split.");
      return;
    }
    
    setSelectedExpenseIds(unsplitSelected);
    setShowCalculateModal(true);
  };

  const handleSplitComplete = async () => {
    // Mark selected expenses as split
    try {
      const updatePromises = selectedExpenseIds.map((expenseId) => {
        const expenseRef = doc(db, "expenses", expenseId);
        return updateDoc(expenseRef, {
          isSplit: true,
          splitDate: serverTimestamp(),
          splitBy: userEmail,
        });
      });
      
      await Promise.all(updatePromises);
      
      // Refresh expenses and reset selection
      await getUserExpenses();
      setSelectedExpenseIds([]);
      setIsSelectMode(false);
      setIsEnabled(false);
      setShowCalculateModal(false);
      
      Alert.alert("Success", "Expenses have been split successfully!");
    } catch (error) {
      console.error("Error marking expenses as split:", error);
      Alert.alert("Error", "Failed to mark expenses as split.");
    }
  };

  const expenseDeletor = async (item) => {
    setSelection(false);
    try {
      setSelection(!selection);
      const expenseRef = doc(db, "expenses", item.id);
      await deleteDoc(expenseRef);
      setSelection(!selection);
      getUserExpenses();
    } catch (error) {
      console.error("Error deleting expense: ", error);
    }
  };

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

  // useFocusEffect(
  //   useCallback(() => {
  //     getUserExpenses();
  //   }, [])
  // );
  useEffect(() => {
    getUserExpenses();

    // calculateTotal();
  }, []);

  useEffect(() => {
    if (groupData) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{groupData.groupName}</Text>
            <Text style={styles.headerSubtitle}>
              {groupData.groupDescription}
            </Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: Colors.BUTTON_COLOR,
          height: 100,
        },
      });
    }
  }, [groupData]);

  useEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [title]);

  return (
    <View style={styles.container}>
      {/* <View style={styles.headerContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: groupImage,
            }}
            style={styles.image}
          />
        </View>
      </View> */}
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
          <Text style={styles.title}>Summary </Text>
          <View
            style={[styles.inputWrapper, { justifyContent: "space-between" }]}
          >
            <Text style={styles.subtitle}>
              Rs.{totalAmount.toFixed(2)} are spent in {groupName} (unsplit)
            </Text>
            <View style={styles.toggle}>
              <Text>Split</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
            {isSelectMode && (
              <View style={styles.selectionInfoContainer}>
                <MaterialIcons name="check-circle" size={18} color={Colors.BUTTON_COLOR} />
                <Text style={styles.selectionInfoText}>
                  {selectedExpenseIds.length > 0
                    ? `${selectedExpenseIds.length} expense(s) selected`
                    : "Select expenses to split"}
                </Text>
                <TouchableOpacity
                  style={styles.cancelSelectButton}
                  onPress={() => {
                    setIsSelectMode(false);
                    setIsEnabled(false);
                    setSelectedExpenseIds([]);
                  }}
                >
                  <Text style={styles.cancelSelectText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Find something that is not here..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery && (
                <TouchableOpacity
                  style={styles.iconContainer}
                  onPress={() => setSearchQuery("")}
                >
                  <MaterialIcons name="cancel" size={25} color={Colors.black} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={filteredExpenses.length > 0 ? filteredExpenses : allExpenses}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <ExpenseItem
            id={item.id}
            addedBy={item.addedBy}
            description={item.description}
            amount={item.amount}
            date={item.date}
            onLongPress={() => !isSelectMode && itemSelector(item)}
            selected={selection}
            isSplit={item.isSplit}
            isSelectMode={isSelectMode}
            isSelected={selectedExpenseIds.includes(item.id)}
            onSelect={handleExpenseSelect}
            splitWith={item.splitWith || []}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <ExpenseModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        fetchLatestData={getUserExpenses}
        id={currentGroupId}
        groupMembers={members || []}
      />

      <ExpenseCalculatorModal
        isVisible={showCalculateModal}
        onClose={() => {
          setShowCalculateModal(false);
        }}
        onSplitComplete={handleSplitComplete}
        totalAmount={selectedExpenseIds.length > 0 ? calculateSelectedTotal() : totalAmount}
        forLabel={groupDescription || groupName}
        members={members}
        selectedExpenseIds={selectedExpenseIds}
      />

      {/* Settings Modal */}
      <Modal
        transparent
        visible={showSettingsModal}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity
          style={styles.settingsModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <View style={styles.settingsModalContent}>
            <TouchableOpacity
              style={styles.settingsOption}
              onPress={() => {
                setShowSettingsModal(false);
                // TODO: Add edit group functionality
                Alert.alert("Edit Group", "Edit group functionality coming soon");
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                color={Colors.BUTTON_COLOR}
              />
              <Text style={styles.settingsOptionText}>Edit Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsOption}
              onPress={() => {
                setShowSettingsModal(false);
                generateInviteLink();
              }}
            >
              <MaterialCommunityIcons
                name="account-multiple-plus"
                size={24}
                color={Colors.BUTTON_COLOR}
              />
              <Text style={styles.settingsOptionText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingsOption, styles.settingsOptionCancel]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.settingsOptionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Plus Icon - Hidden during selection mode */}
      {!isSelectMode && (
        <TouchableOpacity
          style={styles.floatingPlusButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}

      {/* Floating Split Selected Button - Shown during selection mode */}
      {isSelectMode && selectedExpenseIds.length > 0 && (
        <TouchableOpacity
          style={styles.floatingSplitButton}
          onPress={handleSplitSelected}
        >
          <MaterialIcons name="account-balance-wallet" size={24} color={Colors.WHITE} />
          <Text style={styles.floatingSplitButtonText}>
            Split {selectedExpenseIds.length} Selected
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
  },
  imageContainer: {
    // backgroundColor: 'pink'
  },
  image: { width: 70, height: 70, borderRadius: 50 },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.WHITE,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "black",
  },
  titleContainer: {
    paddingTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  toggle: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  subtitle: {
    color: Colors.BLACK,
    fontSize: 15,
    paddingHorizontal: 10,
  },
  members: {
    fontSize: 16,
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: "gray",
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
  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  searchInput: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    marginRight: 5,
    borderColor: Colors.BUTTON_COLOR,
  },
  iconContainer: {
    position: "absolute",
    right: 15, // Position the icon inside the input field
    justifyContent: "center",
    alignItems: "center",
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
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  settingsModalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  settingsOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsOptionText: {
    fontSize: 16,
    color: Colors.BLACK,
    marginLeft: 15,
  },
  settingsOptionCancel: {
    borderBottomWidth: 0,
    justifyContent: "center",
    marginTop: 10,
  },
  settingsOptionCancelText: {
    fontSize: 16,
    color: Colors.RED,
    fontWeight: "600",
    textAlign: "center",
  },
  selectionInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.BACKGROUND_COLOR,
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    gap: 8,
  },
  selectionInfoText: {
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: "500",
    flex: 1,
  },
  cancelSelectButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelSelectText: {
    color: Colors.RED,
    fontSize: 14,
    fontWeight: "600",
  },
  floatingSplitButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.BUTTON_COLOR,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingSplitButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default GroupDetails;
