import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ExpenseItem = ({ addedBy, description, amount, date, onLongPress, id, selected}) => {
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
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.addedBy}>{addedBy}</Text>
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
  date: {
    fontSize: 10,
    color: "gray",
  },
  addedBy: {
    fontSize: 14,
    color: "gray",
  },
});

export default ExpenseItem;
