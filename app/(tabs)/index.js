import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import Feeds from '../../Components/productfeed';

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Feeds />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
