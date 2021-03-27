import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import Firebase from '../firebase'
import { Entypo, MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert, FlatList } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            uid: null,
            username: null,
            users: [],
            chats: [],
            searchResults: [],
            searchTxt: '',
            loading: false,
        };
        // let username = await AsyncStorage.getItem('@username');
        this.props.navigation.setOptions({
            drawerContent: () => (
                <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ paddingHorizontal: 10 }}>
                    <Ionicons name="chevron-back-outline" size={24} color="black" />
                </TouchableOpacity>
            ),
            swipeEnabled: true,
            gestureEnabled: true
        })
    }

    getUsers() {
        Firebase.usersData().then((solve) => {
            this.setState({ users: solve })
        }).catch((fail) => {
            console.log('not getting data')
        })

    }
    async getChats() {
        let uid = await AsyncStorage.getItem('@uid')
        let username = await AsyncStorage.getItem('@username')
        this.setState({
            uid,
            username,
        })
        Firebase.getChatThreads(username).then((solve) => {
            console.log('solve', solve)
            this.setState({ chats: solve, loading: false })
        }).catch((fail) => {
            console.log('not getting data')
        })
    }

    async schedulePushNotification() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "You've got mail! 📬",
                body: 'Here is the notification body',
                data: { data: 'goes here' },
            },
            trigger: { seconds: 2 },
        });
    }


    async registerForPushNotificationsAsync() {
        let token;
        if (Constants.isDevice) {
            console.log('is device ')
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                // alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log(token);
        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    }

    async getPushToken() {
        this.registerForPushNotificationsAsync().then(async token => {
            if (token && token.length > 0) {
                let phone = await AsyncStorage.getItem('@phone')
                let token = await Notifications.getExpoPushTokenAsync();
                await AsyncStorage.setItem('@push_token', token.data)
                Firebase.savePushToken(phone, token.data)
            }
        });

        let notificationListener = Notifications.addNotificationReceivedListener(notification => {
            this.getChats();
            // setNotification(notification);
        });

        let responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            this.getChats();
            console.log(response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
        // let { status: existaingStatus } = await Permissions.askAsync(
        //     Permissions.NOTIFICATIONS,
        // );
        // let finalStatus = existaingStatus;

        // if (existaingStatus !== 'granted') {
        //     let { status } = await Permissions.askAsync(
        //         Permissions.NOTIFICATIONS,
        //     );
        //     finalStatus = status
        // }
        // if (finalStatus !== 'granted') {
        //     return;
        // }
        // // AsyncStorage.setItem(Layout.ENABLE_NOTIFICAIONS, Layout.TRUE);
        // let phone = await AsyncStorage.getItem('@phone')
        // let token = await Notifications.getExpoPushTokenAsync();
        // Firebase.savePushToken(phone, token)
    }
    componentDidMount() {

        Notifications.setNotificationHandler({
            handleNotification: async () => {
                this.getChats();
                ({
                    shouldShowAlert: true,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                })
            },
        });

        this.props.navigation.addListener(
            'focus',
            payload => {
                console.log('focus')

                this.setState({
                    chats: [],
                    searchResults: [],
                    searchTxt: '',
                    loading: true,
                })
                this.getChats();
                this.getUsers();
            }
        );
        this.getPushToken();
    }

    search(text) {
        this.setState({ searchTxt: text })
        console.log(text)
        if (text.length > 0) {
            if (this.state.users.length > 0) {
                let users = []
                this.state.users.find((item, index) => {
                    if (item.username.toLowerCase().includes(text.toLowerCase())) {
                        users.push(item)
                    }
                })
                console.log('users', users)
                if (users && users.length > 0) {
                    this.setState({ emptyMsg: false, searchResults: users })
                }
                else
                    this.setState({ emptyMsg: true, searchResults: [] })
            } else {
                this.setState({ emptyMsg: true })
            }
        } else {
            this.setState({ emptyMsg: false, searchResults: [] })
        }
    }

    deleteChat(item) {
        Alert.alert(
            "Delete Chat",
            `Are you sure you want to delete ${item.user.username} conversation`,
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        Firebase.deleteChatThread(this.state.username, item)
                        this.setState({ chats: [], loading: true })
                        setTimeout(() => {
                            this.getChats()
                        }, 1000);
                    }
                }
            ],
            { cancelable: false }
        );
    }

    renderChatItem(chat) {
        return (
            <View style={styles.item_container}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.navigate('Messages', {
                        fid: this.state.searchTxt.length > 0 ? chat.uid : chat.user.uid,
                        fusername: this.state.searchTxt.length > 0 ? chat.username : chat.user.username,
                        favatar: this.state.searchTxt.length > 0 && chat.avatar ? chat.avatar : chat.user.avatar,
                        ftoken: this.state.searchTxt.length > 0 && chat.push_token ? chat.push_token : (chat.user && chat.user.push_token) ? chat.user.push_token : null,
                        u_uid: this.state.uid,
                        u_username: this.state.username,
                        threadID: chat.chat_id ? chat.chat_id : null,
                        _id: chat._id,
                    })
                }}
                    style={{ width: '90%' }}>
                    <View style={styles.item} >
                        <View style={styles.pro_img}>
                            {(this.state.searchTxt.length > 0 && chat.avatar) || (chat.user && chat.user.avatar) ?
                                <Image source={{ uri: this.state.searchTxt.length > 0 ? chat.avatar : chat.user.avatar }} style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                }} />
                                : <Entypo
                                    name={"user"}
                                    size={35}
                                />
                            }
                        </View>
                        <View style={{ marginHorizontal: 10, justifyContent: 'center' }}>
                            <Text style={styles.username}> {this.state.searchTxt.length > 0 ? chat.username : chat.user.username}</Text>
                            {this.state.searchResults.length > 0 ? null :
                                <Text style={styles.last_msg}> {chat.latestMessage.text ? chat.latestMessage.text : 'Say hello :)'}</Text>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
                {this.state.searchResults.length > 0 ? null : <TouchableOpacity style={{ justifyContent: 'center', width: '10%' }}
                    onPress={() => this.deleteChat(chat)}>
                    <MaterialIcons
                        name={"delete"}
                        size={30}
                    />
                </TouchableOpacity>
                }
            </View>
        )
    }
    render() {
        return (
            <View style={styles.container} >
                <View style={{ width: '100%', height: 110, backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', paddingTop: 30 }}>
                    <TouchableOpacity onPress={() => { this.props.navigation.toggleDrawer() }} >
                        <Entypo
                            name={"menu"}
                            size={40}
                            style={{ color: "#fff", paddingHorizontal: 10, height: 50, justifyContent: 'center' }}
                        />
                    </TouchableOpacity>
                    <View style={styles.search_box}>
                        <FontAwesome
                            name={"search"}
                            size={20}
                            style={{ color: "#000", paddingHorizontal: 10, justifyContent: 'center' }}
                        />
                        <TextInput style={styles.input}
                            keyboardType='email-address'
                            placeholder='@username'
                            onChangeText={(txt) => this.search(txt)}
                            value={this.state.searchTxt}
                        />
                    </View>
                </View>
                {this.state.loading ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size='large' color='#000' style={styles.container} />
                    </View> : null}
                {this.state.chats.length > 0 || this.state.searchResults.length > 0 || this.state.loading ? null :
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.last_msg}> {'NO CHATS!'}</Text>
                        <Text style={styles.last_msg}> {'find someone to chat with :)'}</Text>
                    </View>
                }
                {this.state.emptyMsg && !this.state.loading ?
                    <View style={{ flex: 1, paddingTop: 20 }}>
                        <Text style={styles.last_msg}> {'NO RESULTS'}</Text>
                    </View>
                    : <FlatList contentContainerStyle={{ flex: 1, paddingTop: 20 }}
                        data={this.state.searchResults.length > 0 ? this.state.searchResults : this.state.chats}
                        renderItem={(item) => this.renderChatItem(item.item)}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                    />}

            </View>
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
    },
    item_container: {
        width: '98%',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
        marginVertical: 5,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginHorizontal: '1%'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pro_img: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: '#000',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        margin: 3,
        color: '#000',
        fontSize: 14,
        fontWeight: '700'
    },
    last_msg: {
        margin: 3,
        color: 'gray',
        fontSize: 12,

    },
    input: {
        color: '#000505',
        fontSize: 14,
    },
    search_box: {
        backgroundColor: '#e3f8fa',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: '80%',
        maxWidth: 350,
        height: 40,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row'
    }
})


