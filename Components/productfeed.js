import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import Constants from 'expo-constants';
import Navoptions from './Navoptions';
import Popularoptions from './Popularservices';
import Search from './search';
import Nearbyservice from "./Nearservices";
export default function productfeed (route) {
console.log(route.params)
  state = {
    isLoading: true
  };

  
    return (

       
      <View style={styles.SecondContainer}>
        <View style={styles.staticSection}>
        <View  > 
       

  
          {/* add search txt component here*/}
          <Search></Search>
 <Popularoptions></Popularoptions>
 <Nearbyservice></Nearbyservice>
        </View>
       
       </View>
       
      
 
 
      </View>
      
      
    );
  }


const styles = StyleSheet.create({

  
  
  SecondContainer:{
    flex: 1,
    backgroundColor: '#ffffff',
    overflowX: 'hidden',
    marginTop:50,
  },
  staticSection: {
    paddingHorizontal: 16,
    
  },

  experiment:{
    paddingTop: 16 + Constants.statusBarHeight,
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