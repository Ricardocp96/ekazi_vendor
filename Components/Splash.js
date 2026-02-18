import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



const SplashScreen = () => {
  // Animation for logo and text
  const logoOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);
// To remove a specific item
const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared successfully');
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    // Handle error as needed
  }
};
//clearAllData();
  useEffect(() => {
    const checkToken = async () => {
      try {
      
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
         

          // Fetch user ID from AsyncStorage
          const username = await AsyncStorage.getItem('username');
          const id = await AsyncStorage.getItem('id');
            // Emit event to server with user ID
            console.log(token)
          //socket.emit('username', username);
          
           //socket.emit('receiveFriendRequest',id)
          //console.log("emmited"+ username);
          // Navigate to the next screen after establishing socket connection
          // TODO: Navigate to home
        } else {
          // If token doesn't exist, continue with the splash animation
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start();
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 1000,
            delay: 500,
            useNativeDriver: true,
          }).start();

          // Navigate to the next screen after splash animation
          setTimeout(() => {
            // TODO: Navigate to intro
          }, 2500);
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
        // Handle error as needed
      }
    };

    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo animation */}
      <Animated.View style={{ opacity: logoOpacity }}>
        <Image source={require('../assets/new_logo.jpeg')} style={styles.logo} />
      </Animated.View>

      {/* Text animation */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.text}></Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#085cf4', // Customize background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#FFFFFF', // Customize text color
  },
});

export default SplashScreen;
