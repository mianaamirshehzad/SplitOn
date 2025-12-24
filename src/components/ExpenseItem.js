import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import app from "../firebase";

const ExpenseItem = ({ addedBy, description, amount, date, onLongPress, id, selected}) => {
  const [userName, setUserName] = useState(addedBy); // Default to email if name not found
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

  return (
    <TouchableOpacity
      style={
        // selected
        // ? [styles.container, { backgroundColor: Colors.BACKGROUND_COLOR }]
        styles.container
      }
      id={id}
      onLongPress={onLongPress}
    >
      <View style={styles.leftContainer}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          {formattedTime && <Text style={styles.time}>{formattedTime}</Text>}
        </View>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.addedBy}>Spent by {userName}</Text>
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
  leftContainer: {
    flexDirection: "column",
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
    fontSize: 16,
    color: "green",
    fontWeight: 'bold'
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
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
  addedBy: {
    fontSize: 14,
    color: "gray",
  },
});

export default ExpenseItem;
