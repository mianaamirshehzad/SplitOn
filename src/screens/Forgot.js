import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import GlobalStyles from '../styles/GlobalStyles';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import app from '../firebase';


const Forgot = (props) => {

    const auth = getAuth(app);
    const [email, setEmail] = useState('');

    const resetPassword = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                // Password reset email sent!
                // ..

                props.navigation.navigate('Login');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
            setEmail(null);
    }

    return (
        <View style={GlobalStyles.globalContainer}>
            <View style={styles.cornerTop}>
                <Image
                    source={require('../assets/images/corner.png')}
                    style={GlobalStyles.corner}
                />
            </View>
            <Image
                source={require('../assets/images/forgot.jpg')}
                style={GlobalStyles.image}
            />
            <View style={styles.cornerbottom}>
                <Image
                    source={require('../assets/images/corner.png')}
                    style={GlobalStyles.corner}
                />
            </View>
            {/* <View  style={styles.container} > */}
            <Text style={GlobalStyles.title}>
                Lost your password?</Text>
            <CustomInput
                placeholder="Enter your registerd email"
                onChangeText={(text) => setEmail(text)}
                value={email}
            />
            <TouchableOpacity style={styles.forgot}
                onPress={() => props.navigation.navigate('Login')} >
                <Text>
                    Login?
                </Text>
            </TouchableOpacity>
            <CustomButton
                name="Reset Password"
                onPress={() => resetPassword()}
            />


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    boldText: {
        fontWeight: 'bold',
    },
    forgot: {
        // right: 40,
        padding: 5,
        alignItems: 'flex-end',
        marginLeft: 'auto',
        marginRight: 40,
    },
    cornerTop: {
        left: -50,
        top: -50,
        position: 'absolute',
    },
    cornerbottom: {
        right: -50,
        bottom: -50,
        position: 'absolute',
    },
});

export default Forgot;