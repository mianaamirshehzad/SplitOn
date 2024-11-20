import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
} from "react-native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";
import { getAuth } from "@firebase/auth";
import Corner from "../../components/Corner";
import { Colors } from "../../assets/Colours";
import GroupModal from "../../components/GroupModal";
import Group from "../../components/Group";
import { Screens } from "../../assets/constants/screens";

const Groups = () => {
  const auth = getAuth(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const userName = auth.name ? auth.currentUser.displayName : null;
  const db = getFirestore(app);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const navigation = useNavigation();

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
    <SafeAreaView style={styles.container} >
      <View >
        <Corner />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>New Group</Text>
          <Text style={styles.subtitle}>Document your expense</Text>
        </View>
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <Group
                group={item}
                onGroupPress={() => navigation.navigate("GroupDetails", {
                  groupData: item,
                  title: item.groupName
                })}
              />
            )
          }

          }
        />

        <CustomButton name={"+"} onPress={() => setShowModal(true)} />
        <GroupModal visible={showModal} onClose={handleClose} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
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
    // paddingTop: 25,
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
