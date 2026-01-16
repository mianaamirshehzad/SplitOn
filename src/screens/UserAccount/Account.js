import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
  updateDoc,
  addDoc,
  or,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import app from "../../firebase";
import GlobalStyles from "../../styles/GlobalStyles";
import Spinner from "../../components/Spinner";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { BUTTON_COLOR, Colors } from "../../assets/Colours";
import { Screens } from "../../assets/constants/screens";
import ExpenseItem from "../../components/ExpenseItem";
import { MaterialIcons } from "@expo/vector-icons";
import Group from "../../components/Group";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ProfilePhotoPicker from "../../components/ProfilePhotoPicker";
import { fetchInAppNotificationsForUser, markNotificationRead } from "../../utils/inAppNotifications";
import { Strings } from "../../assets/constants/strings";

const Account = (props) => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;
  const userEmail = user ? user.email : null;
  const userId = user ? user.uid : null;
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    photoURL: "",
  });
  const [userDocId, setUserDocId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  
  // Expenses state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [payables, setPayables] = useState([]); // expenses where user owes a share
  const [totalToPay, setTotalToPay] = useState(0);
  const [paidByNames, setPaidByNames] = useState({}); // email -> name map
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Joined groups state
  const [joinedGroups, setJoinedGroups] = useState([]);
  
  const navigation = useNavigation();

  const ensureUserDocRef = async () => {
    if (!userEmail) return null;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existing = querySnapshot.docs[0];
      setUserDocId(existing.id);
      return doc(db, "users", existing.id);
    }

    const newDoc = await addDoc(collection(db, "users"), {
      name: user?.displayName || "",
      email: userEmail,
      mobile: "",
      photoURL: "",
      createdAt: serverTimestamp(),
    });
    setUserDocId(newDoc.id);
    return doc(db, "users", newDoc.id);
  };


  // Fetch user profile from Firestore
  const getUserProfile = async () => {
    if (!userEmail) return;
    
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setUserDocId(userDoc.id);
        setUserProfile({
          name: userData.name || "",
          email: userData.email || userEmail,
          mobile: userData.mobile || "",
          photoURL: userData.photoURL || "",
        });
        setEditName(userData.name || "");
        setEditMobile(userData.mobile || "");
      } else {
        // If user document doesn't exist, create it with basic info
        setUserProfile({
          name: user?.displayName || "",
          email: userEmail,
          mobile: "",
          photoURL: "",
        });
        setEditName(user?.displayName || "");
        setEditMobile("");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to auth user data
      setUserProfile({
        name: user?.displayName || "",
        email: userEmail,
        mobile: "",
        photoURL: "",
      });
    }
  };

  // Update user profile in Firestore
  const updateUserProfile = async () => {
    if (!userEmail) return;
    
    if (!editName.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    
    try {
      setLoading(true);
      const userDocRef = await ensureUserDocRef();
      if (userDocRef) {
        await updateDoc(userDocRef, {
          name: editName.trim(),
          mobile: editMobile.trim(),
          updatedAt: serverTimestamp(),
        });
      }
      
      setUserProfile({
        ...userProfile,
        name: editName.trim(),
        mobile: editMobile.trim(),
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMyExpenses = async () => {
    if (!userEmail) return;
    
    setRefreshing(true);
    try {
      // Only show expenses the user actually paid for ("spent by the user")
      // NOTE: We avoid orderBy(...) here to prevent Firestore composite index requirements.
      const paidByQuery = query(collection(db, "expenses"), where("paidBy", "==", userEmail));
      const paidBySnapshot = await getDocs(paidByQuery);

      const temp = paidBySnapshot.docs
        .map((d) => ({ ...d.data(), id: d.id }))
        .sort((a, b) => {
          const dateA = a.date?.seconds || (a.date?.toDate ? a.date.toDate().getTime() : 0);
          const dateB = b.date?.seconds || (b.date?.toDate ? b.date.toDate().getTime() : 0);
          return dateB - dateA;
        });

      let total = 0;
      temp.forEach((expense) => {
        total += Number(expense.amount) || 0;
      });
      
      setAllExpenses(temp);
      setTotalAmount(total);
      setTotalExpenses(temp.length);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      Alert.alert("Error", "Failed to fetch your expenses.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getMyPayables = async () => {
    if (!userEmail) return;

    try {
      // Expenses where current user is included in splitWith
      // NOTE: Avoid orderBy(...) here to prevent composite index requirements.
      const q = query(collection(db, "expenses"), where("splitWith", "array-contains", userEmail));
      const snap = await getDocs(q);

      const items = snap.docs
        .map((d) => ({ ...d.data(), id: d.id }))
        .filter((e) => {
          // Only where someone else paid
          const paidBy = e.paidBy || e.addedBy;
          return paidBy && paidBy !== userEmail;
        })
        .map((e) => {
          const splitCount = Array.isArray(e.splitWith) ? e.splitWith.length : 0;
          const amountNum = Number(e.amount) || 0;
          const myShare = splitCount > 0 ? amountNum / splitCount : 0;
          return {
            ...e,
            paidBy: e.paidBy || e.addedBy,
            myShare,
          };
        })
        .sort((a, b) => {
          const dateA = a.date?.seconds || (a.date?.toDate ? a.date.toDate().getTime() : 0);
          const dateB = b.date?.seconds || (b.date?.toDate ? b.date.toDate().getTime() : 0);
          return dateB - dateA;
        });

      const total = items.reduce((sum, e) => sum + (Number(e.myShare) || 0), 0);
      setPayables(items);
      setTotalToPay(total);

      // Resolve payer names (email -> name) for display
      const uniquePayers = Array.from(
        new Set(items.map((e) => e.paidBy).filter(Boolean))
      );
      const namesMap = {};
      await Promise.all(
        uniquePayers.map(async (email) => {
          try {
            const usersRef = collection(db, "users");
            const uq = query(usersRef, where("email", "==", email));
            const usnap = await getDocs(uq);
            if (!usnap.empty) {
              const userData = usnap.docs[0].data();
              namesMap[email] = userData.name || email;
            } else {
              namesMap[email] = email;
            }
          } catch (e) {
            namesMap[email] = email;
          }
        })
      );
      setPaidByNames(namesMap);
    } catch (error) {
      console.error("Error fetching payables:", error);
      // Don't block the whole screen if this fails
      setPayables([]);
      setTotalToPay(0);
      setPaidByNames({});
    }
  };

  const getJoinedGroups = async () => {
    if (!userEmail) return;
    
    try {
      const groupsRef = collection(db, "groups");
      const querySnapshot = await getDocs(groupsRef);
      const groupsData = [];
      
      querySnapshot.forEach((doc) => {
        const groupData = { id: doc.id, ...doc.data() };
        // Check if user is a member of this group
        if (groupData.members && Array.isArray(groupData.members) && groupData.members.includes(userEmail)) {
          groupsData.push(groupData);
        }
      });
      
      setJoinedGroups(groupsData);
    } catch (error) {
      console.error("Error fetching joined groups:", error);
    }
  };

  const getMyNotifications = async () => {
    if (!userEmail) return;
    try {
      const items = await fetchInAppNotificationsForUser(db, userEmail);
      setUnreadCount(items.filter((n) => !n.read).length);
    } catch (e) {
      console.error("Error fetching notifications:", e);
      setUnreadCount(0);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!userEmail) return;
      getUserProfile();
      getMyExpenses();
      getMyPayables();
      getMyNotifications();
      getJoinedGroups();
    }, [userEmail])
  );

  const logoutUser = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();

      console.log("User removed from AsyncStorage => Navigating to Login");
      // props.onLogout();
      props.navigation.navigate(Screens.ROOT_NAVIGATOR);
    } catch (error) {
      console.log(error);
      console.log(error.message);
    }
  };
  const getAllKeys = async () => {
    let keys = [];
    try {
      keys = await AsyncStorage.getAllKeys();
    } catch (e) {
      // read key error
    }

    console.log(keys);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getUserProfile();
    getMyExpenses();
    getMyPayables();
    getMyNotifications();
    getJoinedGroups();
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditName(userProfile.name);
    setEditMobile(userProfile.mobile);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(userProfile.name);
    setEditMobile(userProfile.mobile);
  };


  return (
    <View style={styles.container}>
      <View style={styles.cornerTop}>
        <Image
          source={require("../../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      <View style={styles.cornerbottom}>
        <Image
          source={require("../../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.titleContainer}>
          <Text style={GlobalStyles.title}>My Account</Text>
          <View style={styles.topIconsRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate(Strings.NOTIFICATIONS)}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <MaterialIcons name="notifications" size={24} color={Colors.BUTTON_COLOR} />
              {unreadCount > 0 && (
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={logoutUser}
              accessibilityRole="button"
              accessibilityLabel="Logout"
            >
              <MaterialIcons name="logout" size={24} color={Colors.BUTTON_COLOR} />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <ProfilePhotoPicker
              userEmail={userEmail}
              userId={userId}
              displayName={userProfile.name}
              photoURL={userProfile.photoURL}
              disabled={loading}
              onPhotoURLChange={(url) => setUserProfile((p) => ({ ...p, photoURL: url }))}
            />
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <MaterialIcons name="edit" size={20} color={Colors.BUTTON_COLOR} />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <CustomInput
                showTitle={true}
                title="Name"
                placeholder="Enter your name"
                value={editName}
                onChangeText={setEditName}
                autoCapitalize="words"
              />
              <CustomInput
                showTitle={true}
                title="Mobile"
                placeholder="Enter mobile number"
                value={editMobile}
                onChangeText={setEditMobile}
                keyboardType="phone-pad"
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={updateUserProfile}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={20} color={Colors.BUTTON_COLOR} />
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>
                  {userProfile.name || "Not set"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={20} color={Colors.BUTTON_COLOR} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{userProfile.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color={Colors.BUTTON_COLOR} />
                <Text style={styles.infoLabel}>Mobile:</Text>
                <Text style={styles.infoValue}>
                  {userProfile.mobile || "Not set"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalExpenses}</Text>
              <Text style={styles.statLabel}>Total Expenses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>Rs.{totalAmount.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>Rs.{totalToPay.toFixed(2)}</Text>
              <Text style={styles.statLabel}>To Pay</Text>
            </View>
          </View>
        </View>

                {/* Expenses Section */}
                <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>My Expenses</Text>
          {loading && !refreshing && <Spinner animating={loading} />}
          {allExpenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={50} color={Colors.BUTTON_COLOR} />
              <Text style={styles.emptyText}>No expenses yet</Text>
            </View>
          ) : (
            <View style={styles.fixedListContainer}>
              <FlatList
                data={allExpenses}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => (
                  <ExpenseItem
                    id={item.id}
                    addedBy={item.addedBy}
                    description={item.description}
                    amount={item.amount}
                    date={item.date}
                    isSplit={item.isSplit}
                    splitWith={item.splitWith || []}
                  />
                )}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
              />
            </View>
          )}
        </View>

        {/* To Pay Section */}
        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>To Pay</Text>
          {payables.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="account-balance-wallet" size={50} color={Colors.BUTTON_COLOR} />
              <Text style={styles.emptyText}>Nothing to pay</Text>
            </View>
          ) : (
            <View style={styles.fixedListContainer}>
              <FlatList
                data={payables}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.payableRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payableTitle} numberOfLines={1}>
                        {item.description || "Expense"}
                      </Text>
                      <Text style={styles.payableSubText} numberOfLines={1}>
                        Paid by {paidByNames[item.paidBy] || item.paidBy}
                      </Text>
                    </View>
                    <Text style={styles.payableAmount}>
                      Rs.{(Number(item.myShare) || 0).toFixed(2)}
                    </Text>
                  </View>
                )}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
              />
            </View>
          )}
        </View>

        {/* Joined Groups Section */}
        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>Joined Groups</Text>
          {joinedGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="group" size={50} color={Colors.BUTTON_COLOR} />
              <Text style={styles.emptyText}>No groups joined yet</Text>
            </View>
          ) : (
            <FlatList
              data={joinedGroups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isMember = item.members && Array.isArray(item.members) && item.members.includes(userEmail);
                return (
                  <Group
                    group={item}
                    userEmail={userEmail}
                    isMember={isMember}
                    onGroupPress={() => navigation.navigate("GroupDetails", {
                      groupData: item,
                      title: item.groupName
                    })}
                  />
                );
              }}
              scrollEnabled={false}
            />
          )}
        </View>


      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 45,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  topIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.WHITE,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.RED,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  iconBadgeText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: "800",
  },
  profileSection: {
    backgroundColor: Colors.WHITE,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editButton: {
    padding: 8,
  },
  profileInfo: {
    gap: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.BLACK,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  editForm: {
    gap: 10,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: Colors.BUTTON_COLOR,
  },
  cancelButtonText: {
    color: Colors.BLACK,
    fontWeight: "600",
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontWeight: "600",
  },
  statsSection: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.BLACK,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 110,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.BUTTON_COLOR,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  expensesSection: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  groupsSection: {
    marginHorizontal: 15,
    marginVertical: 10,
    marginBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  fixedListContainer: {
    height: 250,
  },
  payableRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  payableTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.BLACK,
  },
  payableSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  payableAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.BUTTON_COLOR,
    marginLeft: 10,
  },
  cornerTop: {
    left: -50,
    top: -50,
    position: "absolute",
  },
  cornerbottom: {
    right: -50,
    bottom: -50,
    position: "absolute",
  },
});

export default Account;
