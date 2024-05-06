import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../assets/Colours";

const ExpenseItem = ({
  addedBy,
  description,
  amount,
  date,
  onLongPress,
  selected,
}) => {
  return (
    <TouchableOpacity
      style={
        selected
          ? [styles.container, { backgroundColor: Colors.BUTTON_COLOR }]
          : styles.container
      }
      onLongPress={onLongPress}
    >
      <View style={styles.leftContainer}>
        <Text
          style={
            selected ? [styles.date, { color: Colors.WHITE }] : styles.date
          }
        >
          {date}
        </Text>
        <Text style={styles.description}>{description}</Text>
        <Text
          style={
            selected
              ? [styles.addedBy, { color: Colors.WHITE }]
              : styles.addedBy
          }
        >
          {addedBy}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <Text
          style={
            selected ? [styles.amount, { color: Colors.WHITE }] : styles.amount
          }
        >
          {amount}
        </Text>
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
    margin: 3,
    borderRadius: 8,
    elevation: 2,
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
