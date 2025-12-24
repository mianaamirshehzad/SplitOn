import React, { useState, useEffect, useRef } from "react";
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
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import app from "../firebase";

const { height } = Dimensions.get("window");

/**
 * Full-screen expense split modal
 * - Dark background, inspired by reference design
 * - Shows total amount and "For: ..." from props
 * - Even / Uneven split toggle (UI only for now)
 * - Lists members with equal share
 */
const ExpenseCalculatorModal = ({
  isVisible,
  onClose,
  totalAmount = 0,
  forLabel = "",
  members = [],
}) => {
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const db = getFirestore(app);

  const [splitMode, setSplitMode] = useState("even"); // "even" | "uneven"
  const [totalExpense, setTotalExpense] = useState(0);
  const [sharePerMember, setSharePerMember] = useState(0);
  const [memberNames, setMemberNames] = useState({}); // Map of email -> name

  // Fetch user names for all members
  const fetchMemberNames = async (memberEmails) => {
    if (!Array.isArray(memberEmails) || memberEmails.length === 0) return;

    const namesMap = {};
    const emailList = memberEmails.map((member) =>
      typeof member === "string" ? member : member?.email || member
    );

    try {
      // Fetch all user names in parallel
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
            return { email, name: email }; // Fallback to email if not found
          }
        } catch (error) {
          console.error(`Error fetching name for ${email}:`, error);
          return { email, name: email }; // Fallback to email on error
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
      // Fallback: use emails as names
      const fallbackMap = {};
      emailList.forEach((email) => {
        if (email) fallbackMap[email] = email;
      });
      setMemberNames(fallbackMap);
    }
  };

  // Calculate total and share per member when the modal opens
  useEffect(() => {
    if (isVisible) {
      openModal();

      const total = Number(totalAmount) || 0;
      const memberCount = Array.isArray(members) ? members.length : 0;
      const share = memberCount > 0 ? total / memberCount : 0;

      setTotalExpense(total);
      setSharePerMember(share);

      // Fetch member names when modal opens
      fetchMemberNames(members);
    } else {
      // Reset animation when not visible
      modalAnimation.setValue(0);
      setMemberNames({});
    }
  }, [isVisible, totalAmount, members, modalAnimation]);

  const openModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose && onClose();
    });
  };

  const formattedTotal = `Rs. ${totalExpense.toFixed(2)}`;

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: modalAnimation,
          },
        ]}
      >
        <View style={styles.modalContent}>
          {/* Top close button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <MaterialIcons name="close" size={22} color={Colors.WHITE} />
          </TouchableOpacity>

          {/* Header total section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Split with group</Text>
            <Text style={styles.amountText}>{formattedTotal}</Text>
            {!!forLabel && (
              <Text style={styles.forText}>For: {forLabel}</Text>
            )}
          </View>

          {/* Body section */}
          <View style={styles.bodySection}>
            {/* Split mode toggle */}
            <Text style={styles.sectionLabel}>Set share amounts</Text>
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  splitMode === "even" && styles.segmentButtonActive,
                ]}
                onPress={() => setSplitMode("even")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    splitMode === "even" && styles.segmentTextActive,
                  ]}
                >
                  Even split
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  splitMode === "uneven" && styles.segmentButtonActive,
                ]}
                onPress={() => setSplitMode("uneven")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    splitMode === "uneven" && styles.segmentTextActive,
                  ]}
                >
                  Uneven split
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubLabel}>
              Split equally between group
            </Text>

            {/* Members list */}
            <View style={styles.membersList}>
              {Array.isArray(members) &&
                members.map((member, index) => {
                  // Get email from member (could be string or object)
                  const email =
                    typeof member === "string"
                      ? member
                      : member?.email || member;
                  
                  // Get name from our fetched names map, fallback to email
                  const name = memberNames[email] || email || `Member ${index + 1}`;
                  const initials = name?.charAt(0)?.toUpperCase() || "?";

                  return (
                    <View key={`${email}-${index}`} style={styles.memberRow}>
                      <View style={styles.memberInfo}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View>
                          <Text style={styles.memberName}>{name}</Text>
                          {index === 0 && (
                            <Text style={styles.memberRole}>Creator</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.sharePill}>
                        <Text style={styles.sharePillText}>
                          Rs. {sharePerMember.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>

          {/* Bottom primary button */}
          <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
            <Text style={styles.primaryButtonText}>
              Split {formattedTotal}
            </Text>
          </TouchableOpacity>
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
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    height: height * 0.95,
    backgroundColor: "#111111",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    overflow: "hidden",
  },
  headerSection: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222222",
  },
  headerTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#D0FF5F", // neon-like
    marginBottom: 4,
  },
  forText: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  bodySection: {
    flex: 1,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#1F1F1F",
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    fontSize: 13,
    color: "#888888",
  },
  segmentTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  sectionSubLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 12,
  },
  membersList: {
    flex: 1,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  memberName: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  memberRole: {
    color: "#888888",
    fontSize: 12,
  },
  sharePill: {
    backgroundColor: "#1F1F1F",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sharePillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
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
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#D0FF5F",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});

export default ExpenseCalculatorModal;
