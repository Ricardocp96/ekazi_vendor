import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
//import { TextInput } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {Button} from 'react-native-paper';
import Navoptions from './Navoptions';
import tw from "twrnc";
import Popularoptions from './Popularservices';
export default function productfeed () {

  state = {
    isLoading: true
  };

  
    return (

        //TODO
        // add aligning containers 
      <View style={styles.SecondContainer}>
        <View style={styles.staticSection}>
        <View  >

          {/* Replace desirable search input text bex here  */}
 <Navoptions></Navoptions>
<Popularoptions></Popularoptions>
        </View>
        
       </View>
      
      
 <View style={styles.buttons}>
 <View style={styles.sidebyside}>
 
  {/* add the family of buttons here */}
  
 
  </View>
 
  </View>
 
      </View>
      
      
    );
  }


const styles = StyleSheet.create({

  searchwrapper:{

    flex: 1,
    backgroundColor: '#ffffff',
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    height: "100%",

  },
  
  
  SecondContainer:{
    flex: 1,
    backgroundColor: '#ffffff',
    overflowX: 'hidden',
    marginTop:100,
  },
  staticSection: {
    paddingHorizontal: 16,
    
  },

  experiment:{
    paddingTop: 16 + Constants.statusBarHeight,
  },
buttons:{
  
  padding: 10,
  borderRadius: 5,
  paddingTop: 25,
  width: 250, 
  paddingLeft:30,
  alignItems: 'center',
},
 sidebyside:{
  flexDirection: 'row',
    //justifyContent: 'center', // Center buttons horizontally
    alignItems: 'center', // Align buttons vertically
    paddingHorizontal: 5, 
 },

 secondspace:{
marginHorizontal:50,
 },
  searchContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    height: 50,

 },
});