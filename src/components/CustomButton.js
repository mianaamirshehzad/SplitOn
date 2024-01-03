import { Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import { BUTTON_COLOR } from '../assets/Colours';

export default function CustomButton (props) {
    return(
        <TouchableOpacity onPress={() => props.onPress()} 
        style = {styles.button}>
            {/* Spread Operators will help to add more styles than default ones  */}
                <Text style = {{...styles.buttonText, ...props.style}}>
                    {props.name}
                </Text>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: BUTTON_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10, 
        width: '80%',
        alignSelf:'center',
        padding: 15,
        margin: 5,    
    }, 
    buttonText: {
        fontWeight: 'bold',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 15,
        color: 'white'
    }, 

});