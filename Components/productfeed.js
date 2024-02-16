import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {Button} from 'react-native-paper';
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
              containerStyle={{ marginTop: 15 }}
              placeholder="Search service"
              leftContent={
                <Ionicons name="search" size={20} color="black"/>
              }
               style={styles.rounded}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
       
            />



       </View>
      

 <View style={styles.buttons}>
 <View style={styles.sidebyside}>
 
  {/* add the family of buttons here */}
     
  
  <Button icon="camera" mode="elevated"  style={styles.space} onPress={() => console.log('Pressed')}>
    Press me
  </Button>
  <Button icon="camera" mode="elevated"  style={styles.space} onPress={() => console.log('Pressed')}>
    Press me
  </Button>
  </View>
  </View>
      </View>
      
      
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },

  SecondContainer:{
    flex: 1,
   // paddingTop: 16 + Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
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
  width: 200, // Adjust the width to make the button smaller
  alignItems: 'center',
},
 sidebyside:{
  flexDirection: 'row',
    //justifyContent: 'center', // Center buttons horizontally
    alignItems: 'center', // Align buttons vertically
    paddingHorizontal: 5, 
 },
 space:{
  marginHorizontal: 10,
 },
});