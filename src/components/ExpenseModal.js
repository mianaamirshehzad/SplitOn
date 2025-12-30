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
import { addDoc, collection, getFirestore, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from 'dayjs';
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../assets/Colours";
import { Strings } from "../assets/constants/strings";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import Spinner from "./Spinner";
import { getAuth } from "firebase/auth";
import { ScrollView, Switch } from "react-native";
import Checkbox from "expo-checkbox";
import app from "../firebase";

const { height } = Dimensions.get("window");

const ExpenseModal = ({ isVisible, onClose, fetchLatestData, id, groupMembers = [] }) => {
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const auth = getAuth(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const user = auth.currentUser;
  const db = getFirestore(app);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs());
  const [paidBy, setPaidBy] = useState(userEmail);
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [selectedSplitMembers, setSelectedSplitMembers] = useState([]);
  const [memberNames, setMemberNames] = useState({});

  const [groupId, setGroupId] = useState(id);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const [showSplitMembersDropdown, setShowSplitMembersDropdown] = useState(false);

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
      
      // Prepare expense data
      const expenseData = {
        amount: amount.trim(),
        description: description.trim(),
        date: dateValue,
        addedBy: userEmail.trim(),
        groupId: groupId || null,
        paidBy: paidBy || userEmail.trim(),
      };

      // Add split information if split is enabled
      if (isSplitEnabled && selectedSplitMembers.length > 0) {
        expenseData.isSplit = true;
        expenseData.splitWith = selectedSplitMembers;
        expenseData.splitDate = dateValue;
      } else {
        expenseData.isSplit = false;
        expenseData.splitWith = [];
      }

      const expenseRef = await addDoc(collection(db, "expenses"), expenseData);
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
      setPaidBy(userEmail);
      setIsSplitEnabled(false);
      setSelectedSplitMembers([]);
      setLoading(false);
      onClose();
      if (fetchLatestData && typeof fetchLatestData === 'function') {
        fetchLatestData();
      }
    }
  };

  // Fetch member names
  useEffect(() => {
    const fetchMemberNames = async () => {
      if (!Array.isArray(groupMembers) || groupMembers.length === 0) return;
      
      const namesMap = {};
      const emailList = groupMembers.map((member) =>
        typeof member === "string" ? member : member?.email || member
      );

      try {
        const promises = emailList.map(async (email) => {
          if (!email) return;
          try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              return { email, name: userData.name || email };
            } else {
              return { email, name: email };
            }
          } catch (error) {
            console.error(`Error fetching name for ${email}:`, error);
            return { email, name: email };
          }
        });

        const results = await Promise.all(promises);
        results.forEach((result) => {
          if (result) {
            namesMap[result.email] = result.name;
          }
        });

        setMemberNames(namesMap);
      } catch (error) {
        console.error("Error fetching member names:", error);
      }
    };

    if (isVisible && groupMembers.length > 0) {
      fetchMemberNames();
    }
  }, [isVisible, groupMembers]);

  useEffect(() => {
    if (isVisible) {
      // Reset date to current date and time when modal opens
      setDate(dayjs());
      // Reset form fields when modal opens
      setAmount("");
      setDescription("");
      setPaidBy(userEmail);
      setIsSplitEnabled(false);
      setSelectedSplitMembers([]);
      setDatePickerVisibility(false);
      setShowPaidByDropdown(false);
      setShowSplitMembersDropdown(false);
      // Start animation
      openModal();
    } else {
      // Reset animation when modal closes
      modalAnimation.setValue(0);
    }
  }, [isVisible, userEmail]);

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
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
              >
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

              {/* Paid By Dropdown */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Paid By</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setShowPaidByDropdown(!showPaidByDropdown);
                    setShowSplitMembersDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownButtonText}>
                    {memberNames[paidBy] || paidBy || "Select member"}
                  </Text>
                  <MaterialIcons
                    name={showPaidByDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color={Colors.BLACK}
                  />
                </TouchableOpacity>
                {showPaidByDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScrollView}>
                      {groupMembers.map((member, index) => {
                        const email = typeof member === "string" ? member : member?.email || member;
                        const name = memberNames[email] || email;
                        return (
                          <TouchableOpacity
                            key={`paidBy-${email}-${index}`}
                            style={[
                              styles.dropdownItem,
                              paidBy === email && styles.dropdownItemSelected,
                            ]}
                            onPress={() => {
                              setPaidBy(email);
                              setShowPaidByDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{name}</Text>
                            {paidBy === email && (
                              <MaterialIcons name="check" size={20} color={Colors.BUTTON_COLOR} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Split Toggle */}
              <View style={styles.splitToggleContainer}>
                <View style={styles.splitToggleRow}>
                  <Text style={styles.splitToggleLabel}>Split this expense</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: Colors.BUTTON_COLOR }}
                    thumbColor={isSplitEnabled ? "#f4f3f4" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) => {
                      setIsSplitEnabled(value);
                      if (!value) {
                        setSelectedSplitMembers([]);
                      }
                      setShowSplitMembersDropdown(false);
                    }}
                    value={isSplitEnabled}
                  />
                </View>
              </View>

              {/* Split Members Selection */}
              {isSplitEnabled && (
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownTitle}>Split with</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setShowSplitMembersDropdown(!showSplitMembersDropdown);
                      setShowPaidByDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedSplitMembers.length > 0
                        ? `${selectedSplitMembers.length} member(s) selected`
                        : "Select members"}
                    </Text>
                    <MaterialIcons
                      name={showSplitMembersDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                      size={24}
                      color={Colors.BLACK}
                    />
                  </TouchableOpacity>
                  {showSplitMembersDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={styles.dropdownScrollView}>
                        {groupMembers.map((member, index) => {
                          const email = typeof member === "string" ? member : member?.email || member;
                          const name = memberNames[email] || email;
                          const isSelected = selectedSplitMembers.includes(email);
                          return (
                            <TouchableOpacity
                              key={`split-${email}-${index}`}
                              style={styles.dropdownItem}
                              onPress={() => {
                                if (isSelected) {
                                  setSelectedSplitMembers(
                                    selectedSplitMembers.filter((e) => e !== email)
                                  );
                                } else {
                                  setSelectedSplitMembers([...selectedSplitMembers, email]);
                                }
                              }}
                            >
                              <Checkbox
                                value={isSelected}
                                onValueChange={() => {
                                  if (isSelected) {
                                    setSelectedSplitMembers(
                                      selectedSplitMembers.filter((e) => e !== email)
                                    );
                                  } else {
                                    setSelectedSplitMembers([...selectedSplitMembers, email]);
                                  }
                                }}
                              />
                              <Text style={styles.dropdownItemText}>{name}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              {loading ? (
                <Spinner loading={loading} />
              ) : (
                <CustomButton
                  name={Strings.ADD_EXPENSE}
                  onPress={addExpenseToAccount}
                  disabled={
                    !amount.trim() ||
                    !description.trim() ||
                    !date ||
                    (isSplitEnabled && selectedSplitMembers.length === 0)
                  }
                />
              )}
              </ScrollView>
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
    maxHeight: height * 0.9, // Limit modal height
  },
  scrollView: {
    width: "100%",
  },
  scrollViewContent: {
    width: "100%",
    paddingBottom: 10,
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
  dropdownContainer: {
    width: "100%",
    marginBottom: 15,
    zIndex: 1,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.BLACK,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BUTTON_COLOR,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.WHITE,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: Colors.BLACK,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BUTTON_COLOR,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 10,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.BLACK,
    flex: 1,
  },
  splitToggleContainer: {
    width: "100%",
    marginBottom: 15,
  },
  splitToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  splitToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.BLACK,
  },
});

export default ExpenseModal;
