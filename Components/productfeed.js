import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import Constants from 'expo-constants';
import Navoptions from './Navoptions';
import Popularoptions from './Popularservices';
export default function productfeed () {

  state = {
    isLoading: true
  };

  
    return (

       
      <View style={styles.SecondContainer}>
        <View style={styles.staticSection}>
        <View  > 
       

  
          {/* add search txt component here*/}
 <Popularoptions></Popularoptions>
        </View>
       
       </View>
       
      
 <View style={styles.buttons}>
 <View style={styles.sidebyside}>
 
 
  
 
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