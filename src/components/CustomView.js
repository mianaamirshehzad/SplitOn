import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BUTTON_COLOR, VIEW } from '../assets/Colours';

export default function CustomView(props) {
    return (
        <TouchableOpacity onPress={() => props.onPress()}
            style={styles.button}>
            {/* Spread Operators will help to add more styles than default ones  */}
            <Image source={props.source}  style = {styles.img} />
            <Text style={{ ...styles.buttonText, ...props.style }}>
                {props.name}
            </Text>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: VIEW,
        justifyContent: 'center',
        borderRadius: 10,
        width: '95%',
        padding: 15,
        margin: 5,
        flexDirection: 'row'
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: 'white'
    },
    img: {
        width: 25,
        height: 25,
        marginRight: 10
    }

});