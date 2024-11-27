import React, { useState } from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GlobalStyles from "../../styles/GlobalStyles";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../../firebase";
import Spinner from "../../components/Spinner";

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
      Keyboard.dismiss();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const accessToken = userCredential.user.uid;
          console.log(
            `User saved locally with accessToken: ${JSON.stringify(
              accessToken
            )}`
          );
          // AsyncStorage.setItem("accessToken", JSON.stringify(accessToken));
          setLoading(false);
          // props.navigation.navigate(Strings.BOTTOM_TAB);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorMessage);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setEmail(null);
      setPassword(null);
      setLoading(false);
    }
  };

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
          source={require("../../assets/images/corner.png")}
          style={GlobalStyles.corner}
        />
      </View>
      <Image
        source={require("../../assets/images/login.jpg")}
        style={GlobalStyles.image}
      />
      {/* <View  style={styles.container} > */}
      <Text style={GlobalStyles.title}>Welcome back</Text>
      <Spinner animating={loading} />
      <CustomInput
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        keyboardType = {"email"}
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
