import React, { Component } from 'react'
import { View, StyleSheet, ImageBackground } from 'react-native'
import { createAppContainer, NavigationActions, } from 'react-navigation'
import { CommonActions, } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Splash extends Component {
    async UNSAFE_componentWillMount() {
        let flag = await AsyncStorage.getItem('@user_logined');
        console.log(flag)
        if (flag === 'true') {
            const resetAction = CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Chats' },
                ],
            });
            this.props.navigation.dispatch(resetAction);
        }
        else {
            const resetAction = CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Login' },
                ],
            });
            this.props.navigation.dispatch(resetAction);
        }

    }
    render() {

        return (
            <ImageBackground style={styles.container} source={require('../assets/back_screen.jpg')} />
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#2c3e50',
        justifyContent: 'center'
    },
})