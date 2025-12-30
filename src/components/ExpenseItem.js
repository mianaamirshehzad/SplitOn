import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../assets/Colours";
import Checkbox from "expo-checkbox";
import app from "../firebase";

const ExpenseItem = ({ addedBy, description, amount, date, onLongPress, id, selected, isSplit, isSelectMode, isSelected, onSelect, splitWith = []}) => {
  const [userName, setUserName] = useState(addedBy); // Default to email if name not found
  const [splitUsers, setSplitUsers] = useState([]); // Array of {email, name} for split users
  const db = getFirestore(app);

  // Fetch user name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      if (!addedBy) return;
      
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", addedBy));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const name = userData.name || addedBy;
          setUserName(name);
        } else {
          // If user not found, use email
          setUserName(addedBy);
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        // Fallback to email on error
        setUserName(addedBy);
      }
    };

    fetchUserName();
  }, [addedBy]);

  // Fetch split users' names
  useEffect(() => {
    const fetchSplitUsers = async () => {
      if (!Array.isArray(splitWith) || splitWith.length === 0) {
        setSplitUsers([]);
        return;
      }

      try {
        const userPromises = splitWith.map(async (email) => {
          if (!email) return null;
          try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              return {
                email,
                name: userData.name || email,
              };
            } else {
              return {
                email,
                name: email,
              };
            }
          } catch (error) {
            console.error(`Error fetching split user ${email}:`, error);
            return {
              email,
              name: email,
            };
          }
        });

        const results = await Promise.all(userPromises);
        setSplitUsers(results.filter((user) => user !== null));
      } catch (error) {
        console.error("Error fetching split users:", error);
        setSplitUsers([]);
      }
    };

    fetchSplitUsers();
  }, [splitWith]);

  // Format date and time from Firestore Timestamp or Date object
  const formatDateAndTime = (dateValue) => {
    if (!dateValue) return { date: "No date", time: "" };
    
    try {
      let dateObj;
      
      // Handle Firestore Timestamp object
      if (dateValue.seconds !== undefined) {
        dateObj = new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
      }
      // Handle Firestore Timestamp with toDate() method
      else if (typeof dateValue.toDate === 'function') {
        dateObj = dateValue.toDate();
      }
      // Handle JavaScript Date object
      else if (dateValue instanceof Date) {
        dateObj = dateValue;
      }
      // Handle date string
      else if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue);
      }
      // Fallback
      else {
        dateObj = new Date(dateValue);
      }
      
      // Format date: "DD-MM-YYYY"
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      // Format time: "HH:MM" (24-hour format)
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "Invalid date", time: "" };
    }
  };

  const { date: formattedDate, time: formattedTime } = formatDateAndTime(date);

  const handlePress = () => {
    if (isSelectMode && onSelect) {
      onSelect(id);
    } else if (onLongPress) {
      // Keep long press functionality for non-select mode
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isSplit && styles.splitContainer
      ]}
      id={id}
      onPress={handlePress}
      onLongPress={!isSelectMode ? onLongPress : undefined}
    >
      {isSelectMode && (
        <Checkbox
          value={isSelected}
          onValueChange={() => onSelect && onSelect(id)}
          style={styles.checkbox}
        />
      )}
      <View style={styles.leftContainer}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          {formattedTime && <Text style={styles.time}>{formattedTime}</Text>}
          {isSplit && (
            <View style={styles.splitBadge}>
              <MaterialIcons name="check-circle" size={12} color={Colors.BUTTON_COLOR} />
              <Text style={styles.splitBadgeText}>Split</Text>
            </View>
          )}
        </View>
        <Text style={[styles.description, isSplit && styles.splitText]}>{description}</Text>
        <View style={styles.spentByContainer}>
          <Text style={styles.addedBy}>Spent by {userName}</Text>
          {isSplit && splitUsers.length > 0 && (
            <View style={styles.splitUsersContainer}>
              <Text style={styles.splitWithLabel}>Split with:</Text>
              <View style={styles.avatarContainer}>
                {splitUsers.slice(0, 4).map((user, index) => {
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || user.email.charAt(0).toUpperCase();
                  return (
                    <View key={`${user.email}-${index}`} style={[styles.avatar, index === 0 && { marginLeft: 0 }]}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                  );
                })}
                {splitUsers.length > 4 && (
                  <View style={[styles.avatar, { marginLeft: -8 }]}>
                    <Text style={styles.avatarText}>+{splitUsers.length - 4}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={[styles.amount, isSplit && styles.splitText]}>{amount}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 5,
    marginVertical: 3,
    borderRadius: 8,
    elevation: 5, // Adds shadow for Android
    shadowColor: "#000", // Adds shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedContainer: {
    backgroundColor: Colors.BACKGROUND_COLOR,
    borderWidth: 2,
    borderColor: Colors.BUTTON_COLOR,
  },
  splitContainer: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 10,
  },
  leftContainer: {
    flexDirection: "column",
    flex: 1,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  description: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4,
  },
  splitText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  amount: {
    fontSize: 16,
    color: "green",
    fontWeight: 'bold'
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  date: {
    fontSize: 10,
    color: "gray",
  },
  time: {
    fontSize: 10,
    color: "gray",
    fontWeight: "600",
  },
  splitBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  splitBadgeText: {
    fontSize: 9,
    color: Colors.BUTTON_COLOR,
    fontWeight: "600",
  },
  addedBy: {
    fontSize: 14,
    color: "gray",
  },
  spentByContainer: {
    marginTop: 4,
  },
  splitUsersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  splitWithLabel: {
    fontSize: 12,
    color: Colors.BUTTON_COLOR,
    fontWeight: "600",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.BUTTON_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.WHITE,
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 9,
    color: Colors.WHITE,
    fontWeight: "600",
  },
});

export default ExpenseItem;
