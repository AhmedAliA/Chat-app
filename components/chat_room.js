import React, { Component } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import Firebase from '../firebase'
import { Ionicons } from '@expo/vector-icons'
import { GiftedChat } from 'react-native-gifted-chat'
import ChatComponent from './chat_gift';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

// const ChatComponent = (props) => {
//     const [messages, setMessages] = useState([]);

//     useEffect(() => {
//         const unsubscribeListener = firebase.firestore()
//             .collection('MESSAGE_THREADS')
//             .doc(props.thread_id)
//             .collection('MESSAGES')
//             .orderBy('createdAt', 'desc')
//             .onSnapshot(querySnapshot => {
//                 const messages = querySnapshot.docs.map(doc => {
//                     const firebaseData = doc.data()
//                     const data = {
//                         _id: doc.id,
//                         text: '',
//                         createdAt: new Date().getTime(),
//                         ...firebaseData
//                     }

//                     if (!firebaseData.system) {
//                         data.user = {
//                             name: data.user.username,
//                             avatar: 'https://www.jarir.com/cdn-cgi/image/fit=contain,width=400,height=400/https://www.jarir.com/media//catalog/product/5/3/535371.jpg?1',
//                             ...firebaseData.user,
//                         }
//                     }

//                     return data
//                 })
//                 setMessages(messages)
//             })

//         return () => unsubscribeListener()
//     }, [])
//     return (
//         <GiftedChat
//             messages={messages}
//             onSend={this.onSend}
//             user={{
//                 _id: props.uid
//             }}
//         />
//     )
// }
export default class ChatRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            f_id: '',
            f_username: '',
            favatar: null,
            ftoken: null,
            userId: null,
            username: null,
            threadId: null,
            text: '',
            chatData: [],
            messages: [],
            loading: true,

        }
        this.props.navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    this.back()
                    // this.props.navigation.goBack()
                }} style={{ paddingHorizontal: 10 }}>
                    <Ionicons name="chevron-back-outline" size={24} color="black" />
                </TouchableOpacity>
            ),
        })
    }
    back() {
        const resetAction = CommonActions.reset({
            index: 0,
            routes: [
                { name: 'Chats' },
            ],
        });
        this.props.navigation.dispatch(resetAction);

    }

    UNSAFE_componentWillMount = () => {
        //   firebaseSvc.refOn().then((solve)=>{
        //     this.setState({chatData:solve})
        //   }).then(()=>{
        //     let data=this.state.chatData
        //   }).catch((fail)=>{
        //     console.log(fail)
        //   })
        this.retrieveData()
    }

    onLayoutScroll(e) {
        let { width, height } = e.nativeEvent.layout
        this.chatScroll.scrollTo({ x: 0, y: height, animated: false })
    }
    retrieveData = async () => {
        console.log(this.props.route.params.fid)
        let fid = this.props.route.params.fid
        let fusername = this.props.route.params.fusername
        let favatar = this.props.route.params.favatar
        let u_id = this.props.route.params.u_uid
        let u_username = this.props.route.params.u_username
        let chatId = this.props.route.params.threadID
        let ftoken = this.props.route.params.ftoken
        let avatar = await AsyncStorage.getItem('@avatar')
        let token = await AsyncStorage.getItem('@push_token')

        console.log('this is user data==>  ' + fid + '   ' + u_id + '   ' + '   ' + fusername)

        this.setState({
            f_id: fid,
            f_username: fusername,
            userId: u_id,
            username: u_username,
            threadId: chatId,
            favatar,
            ftoken
        })
        if (chatId === null) {
            Firebase.createChatRoom(u_id, u_username, avatar, token, fid, fusername, favatar, ftoken).then((chatID) => {
                this.setState({
                    threadId: chatID, loading: false
                })
            })
        } else {
            Firebase.fetchChatMessages(chatId).then((solve) => {
                this.setState({ messages: solve, loading: false })
            })
        }

    }

    onSend = (messages) => {
        const text = messages[0].text
        Firebase.send(
            // this.state.f_id,
            this.state.threadId,
            text,
            this.state.userId,
            this.state.username
        )
        Firebase.refreshLastMessages(
            this.state.threadId,
            text,
            this.state.username,
            this.state.f_username
        )
        Firebase.fetchChatMessages(this.state.threadId).then((solve) => {
            this.setState({ messages: solve })
        })
    }

    renderDate = (date) => {
        return (
            <Text style={styles.time}>
                {date}
            </Text>
        );
    }

    render() {
        if (this.state.loading)
            return (
                <Animated.View style={styles.container}>
                    <ActivityIndicator size={'large'} color={'black'} />
                </Animated.View>
            )
        return (
            <Animated.View style={styles.container}>
                <ChatComponent thread_id={this.state.threadId} uid={this.state.userId}
                    username={this.state.username} f_username={this.state.f_username} ftoken={this.state.ftoken} />
            </Animated.View>
        )
    }
}

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