// ServiceDetailScreen.js

import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { JobTabs, Company,Footer } from '../Services_components';
import { COLORS, icons, SIZES } from '../constants';
import useFetch from '../hooks/useFetch';
import CustomHeader from '../Components/CustomHeader';

const tabs = ["About"];

const ServiceDetails = () => {
  const params = useLocalSearchParams();
  const detail = params.detail ? JSON.parse(params.detail) : null;

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, refetch } = useFetch();
  const handleRequestService = () => {
    // Pass the necessary parameters to the chat screen
    // TODO: Navigate to chat
  };
  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const displayTabContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <Text style={styles.jobAbout}>{detail.description ?? "No data provided"}</Text>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title={detail?.servicetitle || 'Service Details'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <ActivityIndicator size='large' color={COLORS.primary} />
        ) : error ? (
          <Text>Something went wrong</Text>
        ) : (
          <>
            <Company
              companyLogo={detail.image}
              companyName={detail.servicetitle}
              location={detail.locationy}
            />
            <JobTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <View style={styles.tabContent}>
              {displayTabContent()}
            </View>
            
          </>
        )}
      </ScrollView>
      <Footer  />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    padding: SIZES.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
  jobAbout: {
    fontSize: SIZES.body,
    //lineHeight: SIZES.body + 5,
  },
  tabContent: {
    marginTop: SIZES.medium,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: SIZES.small,
  },
  bookButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: SIZES.small,
  },
});

export default ServiceDetails;
