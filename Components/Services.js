
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {StyleSheet, View, TextInput,ActivityIndicator,Image,Text} from 'react-native';


export  default function Service (){
return (
  
<View style={styles.noFriendsContainer}>
<Image source={require('../assets/request.png')} style={styles.image} />
<Text style={styles.noFriendsText}>There are no vendors yet but hang in tight, they will be here soon  </Text>
</View>

)

}

const styles = StyleSheet.create({
   
  
    noFriendsContainer: {
      flex: 1,
      justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#F1EBE4',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  noFriendsText: {
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'center',
    maxWidth: '80%', // Adjust as needed
  },
});