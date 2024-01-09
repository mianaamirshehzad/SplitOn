import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GlobalStyles from "../styles/GlobalStyles";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../firebase";
import Spinner from "../components/Spinner";
import { Strings } from "../assets/constants/strings";

const Login = (props) => {
  const auth = getAuth(app);
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const accessToken = userCredential.user.uid;
          console.log(`Users: ${JSON.stringify(user)}`);
          AsyncStorage.setItem("accessToken", accessToken);
          props.navigation.navigate(Strings.HOME);
          setLoading(false);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorMessage);
        });
      setEmail(null);
      setPassword(null);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getKeys();
  // }, [])
  return (
    <View style={GlobalStyles.globalContainer}>
      <View style={styles.cornerTop}>
        <Image
          // source={require("../assets/images/corner.png")}
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
        source={require("../assets/images/login.jpg")}
        style={GlobalStyles.image}
      />
      {/* <View  style={styles.container} > */}
      <Text style={GlobalStyles.title}>Welcome back</Text>
      <Spinner animating={loading} />
      <CustomInput
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <CustomInput
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
      />
      <TouchableOpacity
        style={styles.forgot}
        onPress={() => props.navigation.navigate("Forgot")}
      >
        <Text>Forgot Password?</Text>
      </TouchableOpacity>
      <CustomButton name="Login" onPress={() => login()} />
      <View style={{ flexDirection: "row", padding: 15 }}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => props.navigation.navigate("Signup")}>
          <Text style={styles.boldText}>Sign up</Text>
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

export default Login;
