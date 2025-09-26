import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import Messaging from '../../Screens/MessageScreen';

export default function ChatsTab() {
  return (
    <View style={styles.container}>
      <Messaging />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
