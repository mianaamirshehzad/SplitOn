import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../assets/Colours";

const { height } = Dimensions.get("window");

const ExpenseCalculatorModal = ({ isVisible, onClose, expenses, groupMembers }) => {
  const modalAnimation = new Animated.Value(0);

  const [totalExpense, setTotalExpense] = useState(0);
  const [sharePerMember, setSharePerMember] = useState(0);

  // Calculate total and share per member when the modal opens
  useEffect(() => {
    if (isVisible) {
      openModal();

      const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const share = groupMembers > 0 ? total / groupMembers : 0;

      console.log("total ", total);
      

      setTotalExpense(total);
      setSharePerMember(share);
    }
  }, [isVisible, expenses, groupMembers]);

  const openModal = () => {
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

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <Animated.View
        style={[styles.modalContainer, { opacity: modalAnimation }]}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <MaterialIcons name="close" size={25} color={Colors.WHITE} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Expense Summary</Text>
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Total Expense: <Text style={styles.highlight}>Rs. {totalExpense}</Text>
            </Text>
            <Text style={styles.summaryText}>
              Number of Members: <Text style={styles.highlight}>{groupMembers}</Text>
            </Text>
            <Text style={styles.summaryText}>
              Share Per Member:{" "}
              <Text style={styles.highlight}>Rs. {sharePerMember.toFixed(2)}</Text>
            </Text>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgrey",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "lightgreen",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    maxHeight: height * 0.5, // Limit modal height

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
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.RED,
    borderRadius: 30,
    padding: 5,
  },
  summaryContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 18,
    color: "#555",
    marginVertical: 5,
  },
  highlight: {
    fontWeight: "bold",
    color: "#333",
  },
});

export default ExpenseCalculatorModal;
