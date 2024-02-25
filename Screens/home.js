import  * as React from 'react';
import {View, SafeAreaView, Text, StyleSheet} from 'react-native';
import Feeds from '../Components/productfeed';
import { MaterialIcons } from '@expo/vector-icons'; 
import Profile from '../Components/profile';
import Chat from '../Components/chat';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';



const Tab = createBottomTabNavigator();
// add context here 


export default function App({route}) {

  return (

      <View style={styles.container}>

        <Tab.Navigator 
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Feeds') {
              iconName = focused
                ? 'home'
                : 'home';
      
            } else if (route.name === 'Services') {
              iconName = focused ? 'star' : 'star';
            }else if (route.name === 'Chat') {
              iconName = focused ? 'analytics-outline' : 'analytics-outline';
            }
          
  
          return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'gray',
        })}
      >

        <Tab.Screen name="Feeds"
        options={{headerShown:false}}
        component={Feeds}
        
        
        />
        <Tab.Screen 
        name="Services" 
        component={Profile}
    
      
        />
     
       <Tab.Screen name="chat"   
     
       component={Chat}
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