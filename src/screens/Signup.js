import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import GlobalStyles from "../styles/GlobalStyles";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
// import auth, { firebase } from '@react-native-firebase/auth';
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../firebase";
// import { getFirestore, collection, addDoc } from 'firebase/firestore';

const Signup = (props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const auth = getAuth(app);
  const db = getFirestore(app);

  const creatingUser = () => {
    try {
      if (password === confirmPass) {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            const userDocRef = addDoc(collection(db, "users"), {
              name: name,
              email: email,
              mobile: mobile,
            });

            console.log(
              "User created and data saved to Firestore with ID: ",
              userDocRef.id
            );
            const userId = userDocRef.id;
            props.navigation.navigate("Home", { userId });
            console.log("User created");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
            // ..
          });
      } else {
        alert("Password mis-match found");
      }
    } catch (error) {
      console.log(error);
    }
    setConfirmPass(null);
    setEmail(null);
    setMobile(null);
    setName(null);
    setMobile(null);
  };

  return (
    <View style={GlobalStyles.globalContainer}>
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
      <Image
        source={require("../assets/images/signup.jpg")}
        style={GlobalStyles.image}
      />
      {/* <View  style={styles.container} > */}
      <Text style={GlobalStyles.title}>Fill up and register your account</Text>
      <CustomInput
        placeholder="Name"
        onChangeText={(text) => setName(text)}
        value={name}
      />
      <CustomInput
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        value={email}
      />
      <CustomInput
        onChangeText={(text) => setMobile(text)}
        placeholder="Mobile No. (Optional)"
        keyboardType="numeric"
        value={mobile}
      />
      <CustomInput
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
      />
      <CustomInput
        onChangeText={(text) => setConfirmPass(text)}
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={confirmPass}
      />
      <CustomButton name="Register Now" onPress={() => creatingUser()} />
      <View style={{ flexDirection: "row", padding: 15 }}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => props.navigation.navigate("Login")}>
          <Text style={styles.boldText}>Login</Text>
        </TouchableOpacity>
      </View>
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boldText: {
    fontWeight: "bold",
  },
  forgot: {
    // right: 40,
    padding: 5,
    alignItems: "flex-end",
    marginLeft: "auto",
    marginRight: 40,
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

export default Signup;
