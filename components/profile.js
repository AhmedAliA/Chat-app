import React, { Component, useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Dimensions,
    Animated,
    FlatList,
    Button,
    Platform,
} from 'react-native';
import Firebase from '../firebase'
import { Ionicons, Entypo, Feather } from '@expo/vector-icons'
import { GiftedChat } from 'react-native-gifted-chat'
import ChatComponent from './chat_gift';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

function Profile(props) {
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');

    let openImagePickerAsync = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (pickerResult.cancelled === true) {
            return;
        }
        let uri = pickerResult.uri;
        if (Platform.OS === 'android') {
            uri += 'file:///'
        }
        setAvatar(uri)
        await AsyncStorage.setItem('@avatar', uri);
        let phone = await AsyncStorage.getItem('@phone');
        Firebase.saveProfileImage(phone, uri)
    }

    useEffect(() => {
        const getData = async () => {
            let name = await AsyncStorage.getItem('@username');
            let avatar = await AsyncStorage.getItem('@avatar');
            setUsername(name)
            setAvatar(avatar)
        }
        getData()
    }, [])

    props.navigation.setOptions({
        headerLeft: () => (
            <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ paddingHorizontal: 10 }}>
                <Ionicons name="chevron-back-outline" size={24} color="black" />
            </TouchableOpacity>
        ),
    })
    console.log('avatar', avatar)
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#565656', marginTop: 60 }}>{'Edit your profile image '}</Text>

            <TouchableOpacity style={{ alignSelf: 'center', alignItems: 'center' }} onPress={() => openImagePickerAsync()}>
                {avatar ? <Image source={{ uri: avatar }} style={styles.img_container} /> :
                    <View style={styles.img_container} >
                        <Entypo name="user" size={100} color="black" />
                    </View>}
                <Feather name="edit" size={20} color="black" style={{ position: 'absolute', top: 30, right: 15 }} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, color: '#000', fontWeight: '700', paddingTop: 20 }}>{username}</Text>
        </View>

    )
}

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    list: {
        paddingHorizontal: 17,
    },
    footer: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#eeeeee',
        paddingHorizontal: 10,
        padding: 5,
    },
    img_container: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'gray'
    },
    btnSend: {
        backgroundColor: "#00BFFF",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconSend: {
        width: 30,
        height: 30,
        alignSelf: 'center',
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        borderBottomWidth: 1,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    inputs: {
        height: 40,
        marginLeft: 16,
        borderBottomColor: '#FFFFFF',
        flex: 1,
    },
    balloon: {
        maxWidth: 500,
        padding: 15,
        borderRadius: 20,

    },
    itemIn: {
        alignSelf: 'flex-start'
    },
    itemOut: {
        alignSelf: 'flex-end'
    },
    time: {
        alignSelf: 'flex-end',
        margin: 15,
        fontSize: 12,
        color: "#808080",
    },
    item: {
        marginVertical: 14,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: "#eeeeee",
        borderRadius: 50,
        padding: 5,
    },
})