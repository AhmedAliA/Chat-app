import firebase from 'firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@firebase/firestore'
import { CommonActions } from '@react-navigation/native';
const config = {
  apiKey: "AIzaSyC-3adHQ8hM4Ll-u8WIThB18WphsHi3xlM",
  authDomain: "conn19-app.firebaseapp.com",
  projectId: "conn19-app",
  storageBucket: "conn19-app.appspot.com",
  messagingSenderId: "1036447644990",
  appId: "1:1036447644990:web:9455d9e1367fba10a6806f",
  measurementId: "G-950SCLP6PY",
  databaseURL: "https://conn19-app-default-rtdb.firebaseio.com/",
}
let loginedUser = {}
let username = null
class FirebaseSvc {
  constructor() {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          console.log('userrrr', user)
          loginedUser = user
          // User is signed in.
        } else {
          // No user is signed in.
        }
      });
    } else {
      console.log("firebase apps already running...")
    }

  }

  login = (user) => {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(`${user.username}@conn.com`, user.phone).then(async (data) => {
        await AsyncStorage.setItem('@username', user.username)
        await AsyncStorage.setItem('@uid', data.user.uid)
        await AsyncStorage.setItem('@phone', user.phone)
        await AsyncStorage.setItem('@user_logined', 'true')
        resolve(true)
      }, () => {
        resolve(this.createAccount(user))
      })
    })
  }

  createAccount = async (user) => {
    return new Promise((resolve, reject) => {
      firebase.firestore().collection("conn19_user").doc(user.phone).get().then((data) => {
        if (data.exists) {
          alert("Invalid data, check your phone number!");
          resolve(false)
        } else {
          firebase.auth()
            .createUserWithEmailAndPassword(`${user.username}@conn.com`, user.phone)
            .then(function (pass) {
              var userf = firebase.auth().currentUser;
              userf.updateProfile({ phoneNumber: user.phone })
                .then(async function () {
                  firebase.firestore().collection("conn19_user").doc(user.phone).set({
                    uid: pass.user.uid,
                    username: user.username.toLowerCase(),
                    phoneNumber: user.phone,
                  })
                    .then(function () {
                      console.log("Document successfully written!")
                      resolve(true)
                    })
                    .catch(function (error) {
                      console.error("Error writing document: ", error)
                      resolve(false)
                    })
                  await AsyncStorage.setItem('@username', user.username.toLowerCase())
                  await AsyncStorage.setItem('@uid', pass.user.uid)
                  await AsyncStorage.setItem('@phone', user.phone)
                  await AsyncStorage.setItem('@user_logined', 'true')
                  alert("User " + user.username + " was created successfully.")
                  resolve(true)
                }, function (error) {
                  console.warn("Error update displayName.");
                  resolve(false)
                })
            }, function (error) {
              alert("Create account failed. Error: " + error.message.replace('email address', 'username'));
              resolve(false)
            })
        }
      })
    })
  }
  getCurrentUser = () => {

    return loginedUser;
    // return new Promise((resolve, reject) => {
    //   var userf = firebase.auth().currentUser;
    //   resolve(userf || firebase.auth().currentUser)
    // })
  }

  usersData = () => {
    let all = []
    return new Promise((resolve, reject) => {
      var docRef = firebase.firestore().collection("conn19_user")
      docRef.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          all.push(doc.data())
        }, resolve(all))
      })
    })
  }

  getChatThreads(userName) {
    return new Promise((resolve, reject) => {
      firebase.firestore()
        .collection(userName)
        .orderBy('latestMessage.createdAt', 'desc')
        .onSnapshot(querySnapshot => {
          console.log(querySnapshot)
          const threads = querySnapshot.docs.map(documentSnapshot => {
            return {
              _id: documentSnapshot.id,
              // username: documentSnapshot.latestMessage.username,
              latestMessage: { text: '' },
              ...documentSnapshot.data()
            }
          })

          resolve(threads)
        })
    })
  }

  onLogout = (navigation) => {
    firebase.auth().signOut().then(function () {
      console.log("Sign-out successful.");
      const resetAction = CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Login' },
        ],
      });
      navigation.dispatch(resetAction);
      AsyncStorage.clear()
    }).catch(function (error) {
      console.log("An error happened when signing out");
    });
  }
  async getUid() {
    console.log('///////////dsss')
    return await AsyncStorage.getItem('@uid');
  }

  get uid() {
    return uid;
  }
  get loginedUser() {
    return { uid: loginedUser.uid, username: loginedUser.email.split('@')[0] };
  }
  get ref() {
    return firebase.database().ref('MESSAGE_THREADS');
  }

  refOn = () => {
    console.log('new message')
    return new Promise((resolve, reject) => {
      let cData = []
      this.ref.on('child_added', function (snapshot) {
        const { timestamp: numberStamp, text, user } = snapshot.val();
        const { key: id } = snapshot;
        const { key: _id } = snapshot;
        const timestamp = new Date(numberStamp);
        const message = {
          text,
          timestamp,
          user
        };
        console.log('new message', message)
        console.log('new message', cData)
        cData.push(message)
        resolve(cData)
      })
    })
  }

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  send = (threadId, text, uid, username, avatar, push_token) => {
    console.log('push_token', push_token)
    firebase.firestore()
      .collection('MESSAGE_THREADS')
      .doc(threadId)
      .collection('MESSAGES')
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: uid,
          username: username,
          avatar
        }
      }).then(() => {
        firebase.firestore()
          .collection('MESSAGE_THREADS')
          .doc(threadId)
          .set(
            {
              latestMessage: {
                text,
                createdAt: new Date().getTime()
              }
            },
            { merge: true }
          )
      }).then(async () => {
        if (push_token) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: push_token,
              sound: "default",
              title: `${username} messaged you`,
              body: text,
              // priority: 'normal',
              // data: {
              //   experienceId: '@yourExpoUsername/yourProjectSlug',
              //   title: "\uD83D\uDCE7 You've got mail",
              //   message: 'Hello world! \uD83C\uDF10',
              // },
            }),
          });
        }
      })
  }
  refreshLastMessages(id, text, username, fusername) {
    return new Promise((resolve, reject) => {
      firebase.firestore()
        .collection(username)
        .where('chat_id', '==', id)
        .get().then((data) => {
          data.docs.map(documentSnapshot => {
            firebase.firestore()
              .collection(username)
              .doc(documentSnapshot.id)
              .update({
                latestMessage: {
                  text,
                  createdAt: new Date().getTime()
                },
              })
          })
        })
      firebase.firestore()
        .collection(fusername)
        .where('chat_id', '==', id)
        .get().then((data) => {
          data.docs.map(documentSnapshot => {
            firebase.firestore()
              .collection(fusername)
              .doc(documentSnapshot.id)
              .update({
                latestMessage: {
                  text,
                  createdAt: new Date().getTime()
                },
              })
          })
        })
    })
  }

  fetchChatMessages(threadId) {
    console.log(threadId)
    return new Promise((resolve, reject) => {
      firebase.firestore()
        .collection('MESSAGE_THREADS')
        .doc(threadId)
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
                // avatar: 'https://www.jarir.com/cdn-cgi/image/fit=contain,width=400,height=400/https://www.jarir.com/media//catalog/product/5/3/535371.jpg?1',
                ...firebaseData.user,
              }
            }

            return data
          })
          console.log('messages', messages)
          resolve(messages)
        })
    })
  }
  createChatRoom(uid, username, avatar, token, friendId, friendUsername, favatar, ftoken) {
    return new Promise((resolve, reject) => {
      firebase.firestore()
        .collection(username)
        .add({
          latestMessage: {
            createdAt: new Date().getTime()
          },
          chat_id: `${uid}${friendId}`,
          user: {
            uid: friendId,
            username: friendUsername,
            avatar: favatar,
            push_token: ftoken
          },
        })
        .then((chat) => {
          console.log('done1', chat)
          firebase.firestore()
            .collection(friendUsername)
            .add({
              latestMessage: {
                createdAt: new Date().getTime()
              },
              chat_id: `${uid}${friendId}`,
              user: {
                uid: uid,
                username,
                avatar,
                push_token: token
              },
            })
          resolve(`${uid}${friendId}`)
        })

    })
  }

  deleteChatThread(username, item) {
    return new Promise((resolve, reject) => {
      firebase.firestore()
        .collection(username)
        .where('chat_id', '==', item.chat_id)
        .get().then((data) => {
          data.docs.map(documentSnapshot => {
            firebase.firestore()
              .collection(username)
              .doc(documentSnapshot.id)
              .delete();
          })
        })
        .then((chat) => {
          firebase.firestore()
            .collection('MESSAGE_THREADS')
            .doc(item.chat_id)
            .collection('MESSAGES')
            .get().then(function (querySnapshot) {
              querySnapshot.forEach(function (doc) {
                doc.ref.delete();
              });
            })
        })
      firebase.firestore()
        .collection('MESSAGE_THREADS')
        .doc(item.chat_id)
        .delete();
    })
  }


  savePushToken(phone, token) {
    return new Promise((resolve, reject) => {
      firebase.firestore().collection("conn19_user")
        .doc(phone)
        .update({
          push_token: token
        })
    }).then(() => { console.log('push token saved') })
      .catch((e) => console.log('can not save push token'))
  }

  saveProfileImage(phone, uri) {
    return new Promise((resolve, reject) => {
      firebase.firestore().collection("conn19_user")
        .doc(phone)
        .update({
          avatar: uri
        })
    }).then(() => { console.log('push token saved') })
      .catch((e) => console.log('can not save image '))
  }

  refOff() {
    this.ref.off();
  }

}
const Firebase = new FirebaseSvc();
export default Firebase;