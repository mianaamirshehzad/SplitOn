import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableOpacity, FlatList, Alert, TextInput, RefreshControl, Image, Switch } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
import Checkbox from 'expo-checkbox';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from '../../assets/Colours';

const SplitGroupExpense = ({ route }) => {
  const { groupData, title } = route.params || {};
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = (value) => {
    setIsEnabled(value);
    // Add any logic you want when split toggle is turned on/off
    console.log('Split toggle:', value);
  };


  // const getUserExpenses = async () => {
  //   setRefreshing(true);
  //   try {
  //     const q = query(collection(db, "expenses"), where("groupId", "==", currentGroupId));
  //     const querySnapshot = await getDocs(q);
  //     const temp = [];
  //     querySnapshot.forEach((doc) => {
  //       let id = doc.id;
  //       let data = doc.data();
  //       let merge = { ...data, id };
  //       console.log(" => ", merge);
  //       temp.push(merge);
  //     });
  //     setAllExpenses(temp);
  //     calculateTotal();
  //   } catch (error) {
  //     console.log(error.message);
  //   } finally {
  //     setRefreshing(false);
  //     setLoading(false);
  //   }
  // };

  // const calculateTotal = () => {
  //   setTimeout(() => {
  //     let total = 0;
  //     allExpenses?.forEach((value) => {
  //       total += Number(value.amount);
  //     })
  //     console.log("total ", total);
  //     setTotalAmount(total);
  //   }, 3000);

  // };


  // const itemSelector = (expense) => {
  //   setSelectedExpense(expense);
  //   setSelection(true);
  //   console.log("expense item", selectedExpense);
  // };

  // const onRefresh = () => {
  //   setRefreshing(true);
  //   getUserExpenses();
  // };

  // const showAlert = (item) => {
  //   setSelection(false);
  //   Alert.alert(
  //     "Do you want to delete expense item?",
  //     "Caution: Delete cannot be undone.",
  //     [
  //       {
  //         text: "Yes",
  //         onPress: () => expenseDeletor(selectedExpense),
  //         style: "cancel",
  //       },
  //       {
  //         text: "No",
  //         onPress: () => console.log("Cancel Pressed"),
  //         style: "cancel",
  //       },

  //     ],
  //     {
  //       cancelable: true,
  //       onDismiss: () =>
  //         console.log(
  //           "This alert was dismissed by tapping outside of the alert dialog."
  //         ),
  //     }
  //   );
  // };

  // const toggleSwitch = () => {
  //   setIsEnabled(!isEnabled);
  // }

  // const expenseDeletor = async (item) => {
  //   setSelection(false);
  //   try {
  //     setSelection(!selection);
  //     const expenseRef = doc(db, "expenses", item.id);
  //     await deleteDoc(expenseRef);
  //     setSelection(!selection);
  //     getUserExpenses();
  //   } catch (error) {
  //     console.error("Error deleting expense: ", error);
  //   }
  // };

  // const handleSearch = (text) => {
  //   setSearchQuery(text);
  //   if (!text || text === " ") {
  //     setFilteredExpenses(allExpenses);
  //   }
  //   const filteredData = allExpenses.filter(
  //     (expense) =>
  //       (expense.description &&
  //         expense.description.toLowerCase().includes(text.toLowerCase())) ||
  //       (expense.amount &&
  //         String(expense.amount).toLowerCase().includes(text.toLowerCase()))
  //   );

  //   setFilteredExpenses(filteredData);
  // };


  // // useFocusEffect(
  // //   useCallback(() => {
  // //     getUserExpenses();
  // //   }, [])
  // // );
  // useEffect(() => {
  //   getUserExpenses();
  //   // calculateTotal();

  // }, []);

  // useEffect(() => {
  //   if (groupData) {
  //     navigation.setOptions({
  //       headerTitle: () => (
  //         <View style={styles.header} >
  //           <Text style={styles.headerTitle}>{groupData.groupName}</Text>
  //           <Text style={styles.headerSubtitle}>{groupData.groupDescription}</Text>
  //         </View>
  //       ),
  //       headerRight: () => (
  //         <TouchableOpacity >
  //           <Ionicons name="settings-outline" size={24} color="white" />
  //         </TouchableOpacity>
  //       ),
  //       headerStyle: {
  //         backgroundColor: Colors.BUTTON_COLOR,
  //         height: 100
  //       },
  //     });
  //   }
  // }, [groupData]);

  // useEffect(() => {
  //   if (title) {
  //     navigation.setOptions({ title });
  //   }
  // }, [title])

  return (
    <View style={styles.container}  >
      <View style={styles.headerContainer} >
        <View style={styles.imageContainer} >
          {/* <Image source={{
            uri: groupImage
          }}
            style={styles.image}
          /> */}
        </View>
        <View style={{ flexDirection: 'row', gap: 25 }} >
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="pencil"
              size={25}
              color={Colors.BUTTON_COLOR}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="account-multiple-plus"
              size={25}
              color={Colors.BUTTON_COLOR}
            // onPress={() => showAlert()}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* {selection ? ( */}
        <View style={styles.selectionContainer}>
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>Action required</Text>
            {/* <View style={styles.actionButtons} > */}
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="pencil"
                size={25}
                color={Colors.WHITE}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="delete"
                size={25}
                color={Colors.WHITE}
                // onPress={() => showAlert()}
              />
            </TouchableOpacity>
            {/* </View> */}
          </View>
        </View>
      {/* ) : ( */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Summary </Text>
          <View style={[styles.inputWrapper, { justifyContent: 'space-between' }]} >
            <Text style={styles.subtitle}>Rs. are spent in </Text>
            <View style={styles.toggle} >
              <Text style={{ marginRight: 10 }}>Split</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Find something that is not here..."
                // value={searchQuery}
                // onChangeText={handleSearch}
              />
              {/* {searchQuery && (
                <TouchableOpacity
                  style={styles.iconContainer}
                  // onPress={() => setSearchQuery("")}
                >
                  <MaterialIcons name="cancel" size={25} color={Colors.black} />
                </TouchableOpacity>
              )} */}
            </View>
          </View>
        </View>
      {/* )} */}

     

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 10
  },
  imageContainer: {
    // backgroundColor: 'pink'
  },
  image: { width: 70, height: 70, borderRadius: 50 },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.WHITE
  },
  headerSubtitle: {
    fontSize: 14,
    color: "black",
  },
  titleContainer: {
    paddingTop: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 10,

  },
  toggle: {
    alignItems: 'center',
    paddingHorizontal: 10
  },
  subtitle: {
    color: Colors.BLACK,
    fontSize: 15,
    paddingHorizontal: 10,
  },
  members: {
    fontSize: 16,
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  selectionContainer: {
    width: "95%",
    backgroundColor: Colors.BLACK,
    paddingVertical: 5,
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  actionButtons: {
    flexDirection: "row",
    marginHorizontal: 50,
  },
  actionText: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  searchInput: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    marginRight: 5,
    borderColor: Colors.BUTTON_COLOR,
  },
  iconContainer: {
    position: "absolute",
    right: 15, // Position the icon inside the input field
    justifyContent: "center",
    alignItems: "center",
  },
  floatingPlusButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.BUTTON_COLOR,
    borderRadius: 30,
    padding: 10,
    elevation: 5, // Adds shadow for Android
    shadowColor: "#000", // Adds shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default SplitGroupExpense;
