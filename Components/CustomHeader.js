import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT, SIZES } from '../constants/theme';
import icons from '../constants/icons';

const CustomHeader = ({ title = '', showBackButton = true, rightIcon, onRightPress }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Image source={icons.left} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text numberOfLines={1} style={styles.title}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
          <Image source={rightIcon} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontFamily: FONT.bold,
    fontSize: SIZES.h3,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

export default CustomHeader;


