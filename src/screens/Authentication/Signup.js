import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import GlobalStyles from "../../styles/GlobalStyles";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../../firebase";
import { getFirestore, collection, addDoc } from "firebase/firestore";


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
      // Validate mandatory fields
      if (!name.trim()) {
        alert("Name is required");
        return;
      }

      if (!email.trim()) {
        alert("Email is required");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        alert("Please enter a valid email address");
        return;
      }

      if (!password) {
        alert("Password is required");
        return;
      }

      if (password !== confirmPass) {
        alert("Password mis-match found");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      createUserWithEmailAndPassword(auth, email.trim(), password)
        .then(async (userCredential) => {
          // Signed in
          const user = userCredential.user;
          try {
            const userDocRef = await addDoc(collection(db, "users"), {
              name: name.trim(),
              email: email.trim(),
              mobile: mobile.trim() || ""
            });

            console.log(
              "User created and data saved to Firestore with ID: ",
              userDocRef.id
            );
            const userId = userDocRef.id;
            props.navigation.navigate("Home", { userId });
            console.log("User created");
          } catch (firestoreError) {
            console.error("Error saving user to Firestore:", firestoreError);
            alert("Account created but failed to save profile. Please update your profile later.");
            props.navigation.navigate("Home", { userId: user.uid });
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Error creating user:", errorCode, errorMessage);
          
          // User-friendly error messages
          let userFriendlyMessage = errorMessage;
          if (errorCode === "auth/email-already-in-use") {
            userFriendlyMessage = "This email is already registered. Please use a different email or login.";
          } else if (errorCode === "auth/invalid-email") {
            userFriendlyMessage = "Invalid email address. Please enter a valid email.";
          } else if (errorCode === "auth/weak-password") {
            userFriendlyMessage = "Password is too weak. Please use a stronger password.";
          }
          
          alert(userFriendlyMessage);
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <View style={GlobalStyles.globalContainer}>
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
      <Image
        source={require("../../assets/images/signup.jpg")}
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
