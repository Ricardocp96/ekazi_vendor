
import  * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from  './Screens/login'
import homescreen from './Screens/home';
import Register from './Screens/register';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from "react-native-rapi-ui";


const Stack = createNativeStackNavigator();


const globalScreen={

}

const authenticatir =()=> {
  this.state = {
    jwt: '',
  }

}
export default function App() {
 return(
  //TODO
//rap this in an auth container 


  <NavigationContainer>


<ThemeProvider>

<Stack.Navigator
 

screenOptions={globalScreen}>

<Stack.Screen     name = "Login" component={Login} />
<Stack.Screen     name = "Home" component={homescreen} />
<Stack.Screen     name = "Register" component={Register}/>

</Stack.Navigator>

</ThemeProvider>


  </NavigationContainer>
 )
    
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});