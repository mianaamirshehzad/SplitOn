import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import BottomTabs from "./src/navigation/BottomTab";
import MyStack from "./src/navigation";

export default function App() {
  return (
    <View style={styles.container}>
      <BottomTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
