import { Text, TextInput, View, StyleSheet } from 'react-native';
import { BUTTON_COLOR } from '../assets/Colours';

export default function CustomInput(props) {
  return (
    <TextInput
      placeholder={props.placeholder}
      style={styles.input}
      secureTextEntry={props.secureTextEntry}
      onChangeText={(t) => props.onChangeText(t)}
      value={props.value}
    />
  )
};

const styles = StyleSheet.create({
  input: {
    // backgroundColor: '#d3d3d3',
    width: '80%',
    borderColor: BUTTON_COLOR,
    borderWidth: 2,
    borderRadius: 15,
    height: 50,
    padding: 15,
    margin: 5,
  }
});