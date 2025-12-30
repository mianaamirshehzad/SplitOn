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
import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
  updateDoc,
  addDoc,
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
import { useNavigation } from "@react-navigation/native";

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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  
  // Expenses state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // Joined groups state
  const [joinedGroups, setJoinedGroups] = useState([]);
  
  const navigation = useNavigation();


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
        setUserProfile({
          name: userData.name || "",
          email: userData.email || userEmail,
          mobile: userData.mobile || "",
        });
        setEditName(userData.name || "");
        setEditMobile(userData.mobile || "");
      } else {
        // If user document doesn't exist, create it with basic info
        setUserProfile({
          name: user?.displayName || "",
          email: userEmail,
          mobile: "",
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
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing user document
        const userDocRef = doc(db, "users", querySnapshot.docs[0].id);
        await updateDoc(userDocRef, {
          name: editName.trim(),
          mobile: editMobile.trim(),
        });
      } else {
        // Create new user document if it doesn't exist
        await addDoc(collection(db, "users"), {
          name: editName.trim(),
          email: userEmail,
          mobile: editMobile.trim(),
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
    setRefreshing(true);
    try {
      const q = query(
        collection(db, "expenses"),
        orderBy("date", "desc"),
        where("addedBy", "==", userEmail) 
      );

      const querySnapshot = await getDocs(q);
      const temp = [];
      let total = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const expenseData = { ...data, id: doc.id };
        temp.push(expenseData);
        total += Number(data.amount) || 0;
      });
      
      setAllExpenses(temp);
      setTotalAmount(total);
      setTotalExpenses(temp.length);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
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


  useEffect(() => {
    setLoading(true);
    getUserProfile();
    getMyExpenses();
    getJoinedGroups();
    setLoading(false);
  }, [userEmail]);

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
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
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
          </View>
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
                />
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.logoutContainer}>
        <CustomButton name="Logout" onPress={() => logoutUser()} />
      </View>
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
    paddingTop: 45,
    paddingHorizontal: 15,
    paddingBottom: 10,
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.BUTTON_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.WHITE,
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
  },
  statCard: {
    flex: 1,
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
  logoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.BACKGROUND_COLOR,
    padding: 15,
    paddingBottom: 30,
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
