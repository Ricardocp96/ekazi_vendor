import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import icons library

const Profile = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header Section */}
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Image source={{ uri: 'profile_picture_url' }} style={{ width: 100, height: 100, borderRadius: 50 }} />
        <Text style={{ marginTop: 10, fontSize: 20, fontWeight: 'bold' }}>User's Name</Text>
      </View>

      {/* Navigation Tabs */}
      {/* You can use your preferred navigation library to implement tabs */}
      {/* For simplicity, I'll use TouchableOpacity as tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F0F0F0', paddingVertical: 10 }}>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Text>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Text>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Text>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <Text>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Summary */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Personal Information</Text>
        <Text>Email: user@example.com</Text>
        <Text>Phone: +1234567890</Text>
        <Text>Location: City, Country</Text>
        {/* Add more profile summary details as needed */}
      </View>

      {/* Order History */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Order History</Text>
        {/* Display a list of past orders */}
        {/* Each order item should include order details and a button to view more */}
      </View>

      {/* Favorites Section */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Favorites</Text>
        {/* Display a list of favorite services or service providers */}
      </View>

      {/* Settings Section */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Settings</Text>
        {/* Display options for profile settings, notification settings, payment settings, and security settings */}
      </View>

      {/* Footer Section */}
      <TouchableOpacity style={{ alignItems: 'center', backgroundColor: '#EAEAEA', padding: 15 }}>
        <Text>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;
