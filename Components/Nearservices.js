import React from "react";
import { View, Text, FlatList, ActivityIndicator,ScrollView } from "react-native";
import { useRouter } from "expo-router";
import styles from "../Styles/nearbystyle";
import { COLORS } from "../constants";
import NearbyJobCard from "./NearbyCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useFetch from "../hooks/useFetch";

const Nearbyservice = () => {
  const router = useRouter();  
  const { data, isLoading, error, refetch } = useFetch({
    // Your fetch configuration object
  });
  const insets = useSafeAreaInsets(); // Get safe area insets


  const handleNavigate = (item) => {
    // Navigate to the detail screen using the item ID
   
    // TODO: Navigate to details
  };

  return (
   
    <View style={[styles.container, { marginBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Service</Text>
        {/* Add Show all button if needed */}
      </View>
<ScrollView></ScrollView>
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : error ? (
        <Text>Something went wrong</Text>
      ) : (
       
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <NearbyJobCard item={item} handleNavigate={handleNavigate} />
          )}
         // Assuming item.id is a number
          vertical // Hide vertical scroll indicator
        />
      )}
      
    </View>

  );
};

export default Nearbyservice;
