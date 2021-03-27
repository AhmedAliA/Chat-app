import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import Firebase from '../firebase'
import { FontAwesome5 } from '@expo/vector-icons'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ImageBackground, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Preloading from './preloading';
import { StackActions, NavigationActions } from 'react-navigation';
import { CommonActions } from '@react-navigation/native';

export default class Login extends Component {
    constructor() {
        super()
        this.state = {
            preloding: false,
        };
    }
    onPressLogin = async () => {

        this.setState({ preloding: true })
        const user = {
            username: this.state.email.toLowerCase(),
            phone: this.state.password,
        }
        Firebase.login(user).then((flag) => {
            this.setState({ preloding: false })
            if (flag) {
                const resetAction = CommonActions.reset({
                    index: 0,
                    routes: [
                        { name: 'Chats' },
                    ],
                });
                this.props.navigation.dispatch(resetAction);
            }

        });

        // Firebase.login(user).then(async (response) => {
        //     this.setState({ preloding: false })
        //     console.log(response);
        //     // await AsyncStorage.setItem('@user_logined', 'true')
        //     // await AsyncStorage.setItem('@uid', response.uid)
        // }).catch((e) => {
        //     this.setState({ preloding: false })
        //     console.log(e)
        // })
        // const response = firebaseSvc.login(
        //     user,
        //     this.loginSuccess,
        //     this.loginFailed,
        // )
        // this.Data_match()
    }

    Data_match = () => {
        firebaseSvc.loginData().then((solve) => {
            this.setState({ user_Data: solve })
        }).then(() => {
            let x = this.state.user_Data
            this.setState({
                uid: x.uid,
                userName: x.displayName,
                uemail: x.email
            })
            /* AsyncStorage.setItem('uid', x.uid)
            AsyncStorage.setItem('userName', x.displayName)
            AsyncStorage.setItem('email', x.email) */
        }).catch((fail) => {
            console.log('not getting data..............................................')
        })
    }

    loginSuccess = async () => {
        this.props.navigation.navigate('Users', {
            name: this.state.name,
            email: this.state.email,
            avatar: this.state.avatar,
            uid: this.state.uid,
            userName: this.state.userName,
            uemail: this.state.email
        })
        console.log(
            'uid=> ' + this.state.uid +
            '  username=> ' + this.state.userName +
            '  useremail=> ' + this.state.uemail
        )
        console.log('this is the name==>  ')
    }
    loginFailed = () => {
        console.log('login failed ***');
        alert('Login failure. Please tried again.');
    }
    onChangeTextEmail = email => this.setState({ email });
    onChangeTextPassword = password => this.setState({ password });

    isValidData = () => {
        return this.state.email && this.state.password ? true : false
    }
    render() {
        return (
            <ImageBackground style={styles.container} source={require('../assets/back_screen.jpg')} >
                <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '600', color: '#2980b6' }}>{`CONN19-CHAT   `}</Text>
                        <FontAwesome5
                            name={"rocketchat"}
                            size={40}
                            style={{ color: "#2980b6" }}
                        />
                    </View>
                    <View style={styles.padding_btm}>
                        <TextInput style={styles.input}
                            keyboardType='email-address'
                            placeholder='Username'
                            onChangeText={this.onChangeTextEmail}
                            value={this.state.email}
                        />
                        <TextInput style={styles.input}
                            placeholder='Phone numer'
                            secureTextEntry
                            onChangeText={this.onChangeTextPassword}
                            value={this.state.password}
                        />

                        <TouchableOpacity disabled={!this.isValidData()} style={[styles.buttonContainer, { opacity: this.isValidData() ? 1 : 0.5 }]} onPress={this.onPressLogin}>
                            <Text style={styles.buttonText}>Let's go</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Preloading show={this.state.preloding} />
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#2c3e50',
        justifyContent: 'center'
    },
    loginbox: {
        flex: 1,
        // borderRadius: 4,
        // // paddingTop: 200,
        // paddingBottom: 2
    },
    padding_btm: {
        padding: 50,
        paddingVertical: 100
    },
    buttonPadding: {
        padding: 10,
    },
    input: {
        backgroundColor: '#e3f8fa',
        marginBottom: 10,
        padding: 15,
        color: '#000505',
        borderRadius: 10,

    },
    buttonContainer: {
        backgroundColor: '#2980b6',
        padding: 15,
        marginVertical: 30,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 17
    }
})



// export default class Login extends Component {
//     componentDidMount() {
//         // const user = {
//         //     username: 'amalii224',
//         //     phone: '0581244446',
//         // }
//         // Firebase.login(user)
//         // Firebase.createAccount(user).then((solve) => {
//         //     console.log('this is sinup data==>  ' + JSON.stringify(solve))
//         // }).catch((fail) => {
//         //     console.log('not getting data.....................', fail)
//         // })
//     }
//     render() {
//         return (
//             <View style={styles.container}>
//                 <Text>Login!</Text>
//                 <StatusBar style="auto" />
//             </View>
//         );
//     }
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
// });
