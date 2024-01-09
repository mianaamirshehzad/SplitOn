import {
  Alert,
  FlatList,
  Image,
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
  getDoc,
  getDocs,
  getFirestore,
  query,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Screens } from "../assets/constants/screens";
import AsyncStorage from "@react-native-async-storage/async-storage";
import app from "../firebase";
import GlobalStyles from "../styles/GlobalStyles";
import Spinner from "../components/Spinner";
import CustomButton from "../components/CustomButton";

const Account = (props) => {
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserData = async () => {
    try {
      const q = query(collection(db, "users"));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        setName(doc.data().name);
        setEmail(doc.data().email);
        setMobile(doc.data().mobile);
        setCnic(doc.data().cnic);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      getUserData();
      setLoading(false);
    }, 2000);
  }, []);

  const logoutUser = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("accessToken");

      console.log("User removed from AsyncStorage");
      props.navigation.navigate(Screens.LOGIN_SCREEN);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={[GlobalStyles.globalContainer]}>
      <View style={styles.cornerTop}>
        <Image
          source={require("../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      <View style={styles.cornerbottom}>
        <Image
          source={require("../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      {/* <View style={styles.container}> */}
      <Text style={GlobalStyles.title}>User Information</Text>
      <Spinner animating={loading} />
      <View style={styles.info}>
        <Text style={styles.text}>{name}</Text>
        <Text style={styles.text}>{email}</Text>
        <Text style={styles.text}>{cnic}</Text>
        <Text style={styles.text}>{mobile}</Text>
      </View>
      <CustomButton name="Logout" onPress={() => logoutUser()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  boldText: {
    fontWeight: "bold",
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
  busItem: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 3,
    borderRadius: 8,
    shadowColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    flexDirection: "row",
    width: "98%",
  },
  busName: {
    fontSize: 14,
    // fontWeight: 'bold',
    color: "black",
  },
  header: {
    padding: 20,
    margin: 10,
  },
  info: {
    padding: 10,
    margin: 10,
    alignItems: "flex-start",
  },
  text: {
    padding: 10,
  },
  ticketText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  ticketInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default Account;
