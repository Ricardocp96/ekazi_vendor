import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
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
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
       
            />
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
    paddingTop: 16 + Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    overflowX: 'hidden',
  },
  staticSection: {
    paddingHorizontal: 16,
  },
});