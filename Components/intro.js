import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, FlatList, TouchableOpacity } from 'react-native';

const InstructionScreen = () => {
  const { width } = useWindowDimensions();
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
      {/* Minimal maintained pager replacement using FlatList */}
      <View style={{ width }}>
        <FlatList
          data={slides}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index: index })}
          snapToInterval={width}
          decelerationRate="fast"
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {/* TODO: Navigate to login */}}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
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
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InstructionScreen;