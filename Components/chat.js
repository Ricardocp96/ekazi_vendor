import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function chat () {

  state = {
    isLoading: true
  };

  
    return (
      <View style={styles.container}>
        
          <Text>Fetching The Weather</Text>
      
            <View>
              <Text>Minimalist Weather App</Text>
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
  }
});