import  * as React from 'react';
import {View, SafeAreaView, Text, StyleSheet} from 'react-native';
import Feeds from '../Components/productfeed';

import Profile from '../Components/profile_user';
import  Messaging from './MessageScreen'
import Service from '../Components/Services'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { MaterialCommunityIcons } from '@expo/vector-icons';


const Tab = createBottomTabNavigator();
// add context here 


export default function App({route}) {
const  uname = route.params; 
  return (

      <View style={styles.container}>

        <Tab.Navigator 
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'home'
                : 'home';
      
            } else if (route.name === 'Services') {
              iconName = focused ? 'dots-grid' : 'dots-grid';
            }else if (route.name==='Chats'){
                iconName=focused ? 'chat':'chat';
              
            }else if (route.name === 'Profile') {
              iconName = focused ? 'account' : 'account';
            } 
            
          
  
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF7754',
          tabBarInactiveTintColor: 'gray',
        })}
      >

        <Tab.Screen name="Home"
        options={{headerShown:false}}
        component={Feeds}
        uname={uname}
        
        />
        <Tab.Screen 
        name="Services" 
        component={Service}
    
      
        />
      <Tab.Screen
      name="Chats"

      component={Messaging}
      >

      </Tab.Screen>
       <Tab.Screen 
       name="Profile"   

       component={Profile}
       />
     
       
      </Tab.Navigator>
   
    

      </View>
      
  
  );
}



const styles = StyleSheet.create({
  channelScreenSaveAreaView: {
    backgroundColor: 'yellow',
  },
  channelScreenContainer: {flexDirection: 'column', height: '100%'},
  container: {
    flex: 1,
  },
  drawerNavigator: {
    backgroundColor: 'yellow',
    width: 350,
  },
  chatContainer: {
    backgroundColor: 'yellow',
    flexGrow: 1,
    flexShrink: 1,
  },
  TouchableOpacity:{
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 70,
    bottom: 70,
  },

  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
    
  },


});