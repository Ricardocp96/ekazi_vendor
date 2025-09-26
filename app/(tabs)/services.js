import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import Service from '../../Components/Services';

export default function ServicesTab() {
  return (
    <View style={styles.container}>
      <Service />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
