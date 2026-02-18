import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { COLORS } from '../../constants/theme';
import Service from '../../Components/Services';

export default function ServicesTab() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const shouldAutoCreate = useMemo(() => {
    if (!params) {
      return false;
    }
    const { create, newService } = params;
    return create === '1' || create === 'true' || newService === 'true';
  }, [params]);

  const handleCreateHandled = useCallback(() => {
    navigation.setParams({ create: undefined, newService: undefined });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Service initialCreate={shouldAutoCreate} onCreateHandled={handleCreateHandled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
