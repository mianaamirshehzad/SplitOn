import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../assets/Colours";
import Checkbox from "expo-checkbox";
import app from "../firebase";

const ExpenseItem = ({ addedBy, description, amount, date, onLongPress, id, selected, isSplit, isSelectMode, isSelected, onSelect, splitWith = []}) => {
  const [splitUsers, setSplitUsers] = useState([]); // Array of {email, name, photoURL}
  const db = getFirestore(app);

  // Fetch split users' names + profile photos
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
                photoURL: userData.photoURL || "",
              };
            }

            return { email, name: email, photoURL: "" };
          } catch (error) {
            console.error(`Error fetching split user ${email}:`, error);
            return { email, name: email, photoURL: "" };
          }
        });

        const results = await Promise.all(userPromises);
        setSplitUsers(results.filter(Boolean));
      } catch (error) {
        console.error("Error fetching split users:", error);
        setSplitUsers([]);
      }
    };

    // Only fetch if this expense is marked split
    if (isSplit) fetchSplitUsers();
    else setSplitUsers([]);
  }, [db, isSplit, splitWith]);

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
        <Text style={styles.description}>{description}</Text>
        {isSplit && splitUsers.length > 0 && (
          <View style={styles.splitRow}>
            <Text style={styles.splitWithLabel}>Split with</Text>
            <View style={styles.avatarStack}>
              {splitUsers.slice(0, 5).map((user, index) => {
                const label = user?.name || user?.email || `M${index + 1}`;
                const initials =
                  label
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?";

                return (
                  <View
                    key={`${user.email}-${index}`}
                    style={[styles.stackAvatar, index === 0 ? { marginLeft: 0 } : null]}
                  >
                    {user.photoURL ? (
                      <Image source={{ uri: user.photoURL }} style={styles.stackAvatarImage} />
                    ) : (
                      <Text style={styles.stackAvatarText}>{initials}</Text>
                    )}
                  </View>
                );
              })}
              {splitUsers.length > 5 && (
                <View style={[styles.stackAvatar, { marginLeft: -10 }]}>
                  <Text style={styles.stackAvatarText}>+{splitUsers.length - 5}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>{amount}</Text>
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
  amount: {
    fontSize: 24,
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
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 10,
    flexWrap: "wrap",
  },
  splitWithLabel: {
    fontSize: 12,
    color: Colors.BUTTON_COLOR,
    fontWeight: "600",
  },
  avatarStack: {
    flexDirection: "row",
  },
  stackAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.BUTTON_COLOR,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.WHITE,
    marginLeft: -10,
  },
  stackAvatarImage: {
    width: "100%",
    height: "100%",
  },
  stackAvatarText: {
    fontSize: 9,
    color: Colors.WHITE,
    fontWeight: "700",
  },
});

export default ExpenseItem;
