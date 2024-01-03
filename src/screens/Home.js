import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
// import { collection, doc, getDoc, getDocs, getFirestore, query } from "firebase/firestore";
import app from '../firebase';
import GlobalStyles from '../styles/GlobalStyles';
import CustomButton from '../components/CustomButton';
// import auth from '@react-native-firebase/auth';
import CustomInput from '../components/CustomInput';
import CustomView from '../components/CustomView';
// import { getAuth } from '@firebase/auth';

const Home = (props) => {

    const auth = getAuth(app);
    const db = getFirestore(app);
    const [name, setName] = useState('');

    const getUserData = async () => {
        try {
            const q = query(collection(db, "users"),
            );

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data().name);
                setName(doc.data().name);
            });
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    return (
        <View style={GlobalStyles.globalContainer}>
            <Text>
                Welcome {name}
            </Text>
            <View style={styles.cornerTop}>
                <Image
                    source={require('../assets/images/corner.png')}
                    style={GlobalStyles.corner}
                />
            </View>
            <Image
                source={require('../assets/images/bus.jpg')}
                style={GlobalStyles.image} />
            <CustomView
                name="Book Tickets"
                source={require('../assets/images/sun-shining.png')}
                onPress={() => props.navigation.navigate('CitiesSelection')} />
            <CustomView
                name="My Bookings"
                source={require('../assets/images/star.png')}
                onPress={() => props.navigation.navigate('MyBookings')} />
            <CustomView
                name="Graph"
                source={require('../assets/images/clipboard.png')}
                onPress={() => props.navigation.navigate('Graph')} />
            <CustomView
                name="Account"
                source={require('../assets/images/user.png')}
                onPress={() => props.navigation.navigate('Account')} />

            <View style={styles.cornerbottom}>
                <Image
                    source={require('../assets/images/corner.png')}
                    style={GlobalStyles.corner}
                />
            </View>
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

export default Home;