import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Signup from "./src/screens/Signup";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <View style={styles.container}>
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
