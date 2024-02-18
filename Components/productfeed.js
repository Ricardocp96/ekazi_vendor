import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {Button} from 'react-native-paper';
import Navoptions from './Navoptions';
import tw from "twrnc";
export default function productfeed () {

  state = {
    isLoading: true
  };

  
    return (

        //TODO
        // add aligning containers 
      <View style={styles.SecondContainer}>
        <View style={styles.staticSection}>
        <TextInput
              containerStyle={{ marginTop: 56 }}
              placeholder="Search service"
              leftContent={
                <Ionicons name="search" size={20} color="black"/>
              }
              style={tw ` rounded-full`}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
       
            />
 
 <Navoptions></Navoptions>

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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },

  SecondContainer:{
    flex: 1,
    backgroundColor: '#ffffff',
    overflowX: 'hidden',
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
 space:{
  marginHorizontal: 15,
 },
 secondspace:{
marginHorizontal:50,
 },
});