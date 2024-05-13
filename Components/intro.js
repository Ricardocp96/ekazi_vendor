import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Button } from 'react-native-paper';

const InstructionScreen = ({ navigation }) => {
  const slides = [
    {
      title: 'Welcome to ekazi!',
      text: 'Order Various Services conveniently at your comfort ',
      image: require('../assets/Couch.png'),
    },
    {
      title: 'Track Services',
      text: 'Be able to track your Services in real time',
      image: require('../assets/track.png'),
    },
   
    
  ];

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        data={slides}
        renderItem={renderItem}
        sliderWidth={300}
        itemWidth={300}
      />
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.replace('Login')}
      >
        Next
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    paddingTop:10,
    width: 200,
    paddingVertical: 10,
    borderRadius: 20,
  },
});

export default InstructionScreen;