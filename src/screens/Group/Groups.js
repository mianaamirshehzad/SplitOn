import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
} from "react-native";
import { collection, getDocs, getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import app from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";
import { getAuth } from "firebase/auth";
import Corner from "../../components/Corner";
import { Colors } from "../../assets/Colours";
import GroupModal from "../../components/GroupModal";
import Group from "../../components/Group";
import Loading from "../../components/Loading";

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

  const handleJoinGroup = async (groupId) => {
    if (!userEmail) {
      console.error("User email not available");
      return;
    }
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(userEmail),
      });
      // Refresh groups list after joining
      fetchGroups();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "groups"));
      const groupsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsData);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.contentContainer}>
        <Corner />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>New Group</Text>
          <Text style={styles.subtitle}>Document your expense</Text>
        </View>
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={groups}
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
                  onJoinGroup={() => handleJoinGroup(item.id)}
                />
              )
            }
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton name={"+ New Group"} onPress={() => setShowModal(true)} />
      </View>
      <GroupModal visible={showModal} onClose={handleClose} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_COLOR,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: Colors.BACKGROUND_COLOR,
    borderTopWidth: 1,
    borderTopColor: Colors.BACKGROUND_COLOR,
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
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginTop: 40,
  },
  title: {
    color: Colors.BUTTON_COLOR,
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: Colors.BLACK,
    fontSize: 15,
    marginVertical: 10,
  },
});

export default Groups;
