import React, { Component, useEffect, useState } from 'react'
import { View, TouchableOpacity, Image, Text } from 'react-native'
import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer, } from 'react-navigation'
import Login from './components/login'
import ChatRoom from './components/chat_room'
import Home from './components/home'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Splash from './components/splash'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicons, Entypo } from '@expo/vector-icons'
import Firebase from './firebase'
import Profile from './components/profile'

const Drawer = createDrawerNavigator();

function MyCustomDrawer(props) {
  console.log(props)
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const getData = async () => {
      let name = await AsyncStorage.getItem('@username');
      let avatar = await AsyncStorage.getItem('@avatar');

      setUsername(name)
      setAvatar(avatar)
    }
    getData()
  }, [])
  return (
    <DrawerContentScrollView >
      {/* <TouchableOpacity onPress={() => { props.navigation.toggleDrawer() }} style={{ position: 'absolute', top: 60, right: 10 }}>
        <AntDesign
          name={"closecircle"}
          size={27}
          style={{ color: "#000" }}
        />
      </TouchableOpacity> */}
      <TouchableOpacity style={{ alignSelf: 'center', alignItems: 'center' }} onPress={() => props.navigation.navigate('Profile')}>
        {avatar ? <Image source={{ uri: avatar }}
          style={{ width: 100, height: 100, borderRadius: 50, marginTop: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'gray' }}
        /> :
          <View style={{ width: 100, height: 100, borderRadius: 50, marginTop: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'gray' }} >
            <Entypo name="user" size={70} color="black" />
          </View>}
        <Text style={{ fontSize: 16, color: '#000', fontWeight: '700', paddingTop: 10 }}>{username}</Text>
      </TouchableOpacity>
      <DrawerItem label={'Logout'} labelStyle={{ fontSize: 16, color: '#000', fontWeight: '700', marginLeft: -20 }}
        style={{ marginTop: 100, }}
        onPress={() => {
          Firebase.onLogout(props.navigation)
        }} icon={() => <Ionicons name="ios-arrow-back-circle-outline" size={22} color="black" />} />
      {/* </DrawerItemList> */}
      {/* <Drawer.Screen name="Article" component={Article} /> */}
    </DrawerContentScrollView>
  );
}
const backIcon = () => {
  return (
    <TouchableOpacity onPress={() => CommonActions.navigate('Chate')}>
      <Ionicons name="chevron-back-outline" size={24} color="black" />
    </TouchableOpacity>
  )
}
function MyDrawer() {
  return (
    <Drawer.Navigator drawerContent={(props) => <MyCustomDrawer navigation={props.navigation} />} screenOptions={{ swipeEnabled: true, gestureEnabled: true }}>
      <Drawer.Screen name='Splash' component={Splash} navigationOptions={{ headerShown: false }} />
      <Drawer.Screen name='Login' component={Login} navigationOptions={{ headerShown: false }}
        options={{ swipeEnabled: false, gestureEnabled: false }} />
      <Drawer.Screen name="Chats" component={Home} options={{ headerShown: false, swipeEnabled: true, gestureEnabled: true, }} />
      <Drawer.Screen name='Messages' component={ChatRoom}
        options={{ title: 'Messages', headerShown: true, swipeEnabled: false, gestureEnabled: false, }} />
      <Drawer.Screen name='Profile' component={Profile}
        options={{ title: 'Edit Profile', headerShown: true, swipeEnabled: false, gestureEnabled: false, }} />
    </Drawer.Navigator>
  );
}

const AppNavigator = createStackNavigator(

  {
    Splash: { screen: Splash, navigationOptions: { headerShown: false } },
    Login: { screen: Login, navigationOptions: { headerShown: false } },
    // Home: { screen: MyDrawer },
    ChatRoom: { screen: ChatRoom, navigationOptions: { headerTitle: 'Chat' } },
  },
  {
    headerMode: 'screen',
    defaultNavigationOptions: {

    },

  },
  {
    initialRouteName: 'Splash'
  }
)
const AppContainer = createAppContainer(AppNavigator)
export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {

    if (this.state.loading)
      return null
    return (
      <View style={{ flex: 1 }}>
        <NavigationContainer >
          {MyDrawer()}
        </NavigationContainer>
      </View>
    )
  }
}