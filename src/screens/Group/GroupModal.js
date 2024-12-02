import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import { addDoc, collection, getFirestore, serverTimestamp} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import app from "../../firebase/index";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { getAuth } from "@firebase/auth";
import Corner from "../../components/Corner";
import { Strings } from "../../assets/constants/strings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../assets/Colours";
import { Images } from "../../assets/Images";
import { Ionicons } from "@expo/vector-icons";

const defaultGroupImage =
  "https://unsplash.com/photos/fan-of-100-us-dollar-banknotes-lCPhGxs7pww";

const GroupModal = ({ visible, onClose }) => {
  const auth = getAuth(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;
  const userName = auth.currentUser ? auth.currentUser.displayName : null;
  const db = getFirestore(app);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupImage, setGroupImage] = useState();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need gallery permissions to pick an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setGroupImage(result.assets[0].uri);
    }
  };

  const createNewGroup = async () => {
    try {
      setLoading(true);
      Keyboard.dismiss();
      if (!groupName) {
        alert("Group name is required");
        setLoading(false);
        return;
      }
      const groupRef = await addDoc(collection(db, "groups"), {
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        groupImage: groupImage,
        createdBy: userEmail,
        createdAt: serverTimestamp(),
        members: [userEmail],
      });

      console.log("Group created with ID: ", groupRef.id);

      // Optionally save the group locally
      let localGroups = [];
      localGroups.push({
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        createdBy: userEmail,
      });
      await AsyncStorage.setItem("localGroups", JSON.stringify(localGroups));

      const savedData = await AsyncStorage.getItem("localGroups");
      console.log("Data saved locally: ", savedData);

      // Clear fields after submission
      setGroupName("");
      setGroupDescription("");
      setGroupImage("");
      onClose();
    } catch (error) {
      console.error("Error creating group: ", error);
    } finally {
      setLoading(false);
      refetchData();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Corner />
          <Text style={styles.title}>Create New Group</Text>
          <View>
            <Image
              source={
                groupImage ? { uri: groupImage } : Images.defaultGroupIcon
              }
              style={styles.groupImage}
            />
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <Ionicons name="add-circle" size={40} color={Colors.BLACK} />
            </TouchableOpacity>
          </View>

          <CustomInput
            showTitle={true}
            title="Group Name*"
            value={groupName}
            placeholder="Enter group name"
            onChangeText={(text) => setGroupName(text)}
          />

          <CustomInput
            showTitle={true}
            title="Group Description (optional)"
            value={groupDescription}
            placeholder="Enter description"
            onChangeText={(text) => setGroupDescription(text)}
          />

          <CustomButton
            name={
              loading ? (
                <ActivityIndicator
                  animating={loading}
                  color={"green"}
                  size={"small"}
                />
              ) : (
                Strings.CREATE_OWN_GROUP
              )
            }
            onPress={createNewGroup}
          />

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.BUTTON_COLOR,
    marginBottom: 20,
  },
  imagePickerButton: {
    position: "absolute",
    bottom: -10,
    right: -10,
  },
  icon: {
    width: 80,
    height: 80,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: Colors.BUTTON_COLOR,
  },
  closeButton: {
    color: Colors.BUTTON_COLOR,
    marginTop: 20,
  },
});

export default GroupModal;