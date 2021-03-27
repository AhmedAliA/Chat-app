import React, { Component, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Dimensions,
    TextInput,
    FlatList,
    Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { GiftedChat } from 'react-native-gifted-chat'
import firebase from 'firebase'
import Firebase from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

function ChatComponent(props) {
    console.log(props)
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const unsubscribeListener = firebase.firestore()
            .collection('MESSAGE_THREADS')
            .doc(props.thread_id)
            .collection('MESSAGES')
            .orderBy('createdAt', 'desc')
            .onSnapshot(querySnapshot => {
                const messages = querySnapshot.docs.map(doc => {
                    const firebaseData = doc.data()
                    const data = {
                        _id: doc.id,
                        text: '',
                        createdAt: new Date().getTime(),
                        ...firebaseData
                    }

                    if (!firebaseData.system) {
                        data.user = {
                            name: data.user.username,
                            ...firebaseData.user,
                        }
                    }

                    return data
                })
                setMessages(messages)
            })

        return () => unsubscribeListener()
    }, [])

    async function handleSend(messages) {
        let avatar = await AsyncStorage.getItem('@avatar')
        const text = messages[0].text
        Firebase.send(
            props.thread_id,
            text,
            props.uid,
            props.username,
            avatar,
            props.ftoken
        )
        Firebase.refreshLastMessages(
            props.thread_id,
            text,
            props.username,
            props.f_username
        )
    }
    // if(loading){
    //     setMessages([])
    //     setLoading(false)
    // }
    return (
        <GiftedChat
            messages={messages}
            onSend={handleSend}
            user={{
                _id: props.uid
            }}
        />
    )
}
export default ChatComponent;