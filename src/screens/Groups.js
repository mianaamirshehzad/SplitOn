import {
  Keyboard,
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../firebase";
import GlobalStyles from "../styles/GlobalStyles";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { getAuth } from "@firebase/auth";
import Corner from "../components/Corner";
import { Strings } from "../assets/constants/strings";
import Spinner from "../components/Spinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../assets/Colours";
import GroupModal from "../components/GroupModal";
import Group from "../components/Group";

const Groups = (props) => {
  const auth = getAuth(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const userName = auth.name ? auth.currentUser.displayName : null;
  const db = getFirestore(app);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // console.log("userEmail", auth);
  // console.log("name ", userName);
  // console.log(`User outsise=====: ${JSON.stringify(user)}`);

  const handleClose = () => {
    setShowModal(false);
    fetchGroups();
  };

  const fetchGroups = async () => {
    const querySnapshot = await getDocs(collection(db, "groups"));
    const groupsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGroups(groupsData);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <View style={styles.container}>
      <Corner />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>New Group</Text>
        <Text style={styles.subtitle}>Document your expense</Text>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Group group={item} />}
      />

      <CustomButton name={"+"} onPress={() => setShowModal(true)} />
      <GroupModal visible={showModal} onClose={handleClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  boldText: {
    fontWeight: "bold",
  },
  forgot: {
    padding: 5,
    alignItems: "flex-end",
    marginLeft: "auto",
    marginRight: 40,
  },
  titleContainer: {
    paddingTop: 15,
    alignItems: "center",
  },
  title: {
    color: Colors.BUTTON_COLOR,
    fontSize: 24,
    marginTop: 25,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  subtitle: {
    color: Colors.BLACK,
    fontSize: 15,
    paddingHorizontal: 10,
  },
});

export default Groups;
