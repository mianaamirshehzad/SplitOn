import React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";

const ExpenseItem = ({ addedBy, description, amount, date }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.addedBy}>{addedBy}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </View>
  );
};

const ExpensesList = ({ expenses }) => {
  return (
    <FlatList
      data={expenses}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <ExpenseItem
          addedBy={item.addedBy}
          description={item.description}
          amount={item.amount}
          date={item.date}
        />
      )}
    />
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

export default ExpensesList;
