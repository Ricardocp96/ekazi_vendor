
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { vendorAPI } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Service() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
  });

  const categories = [
    { id: 'cleaning', name: 'Cleaning', icon: 'water-outline' },
    { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
    { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
    { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline' },
    { id: 'painting', name: 'Painting', icon: 'brush-outline' },
    { id: 'gardening', name: 'Gardening', icon: 'leaf-outline' },
    { id: 'moving', name: 'Moving', icon: 'car-outline' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const vendorId = await AsyncStorage.getItem('id');
      if (vendorId) {
        const response = await vendorAPI.getServices(vendorId);
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        image: selectedImage,
        status: 'active',
      };

      await vendorAPI.createService(serviceData);
      Alert.alert('Success', 'Service created successfully!');
      setModalVisible(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert('Error', 'Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      location: '',
    });
    setSelectedImage(null);
  };

  const deleteService = async (serviceId) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await vendorAPI.deleteService(serviceId);
              fetchServices();
              Alert.alert('Success', 'Service deleted successfully!');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service.');
            }
          },
        },
      ]
    );
  };

  if (loading && services.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={80} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>No Services Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by creating your first service to attract customers
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Your First Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((service, index) => (
            <View key={service.id || index} style={styles.serviceCard}>
              <Image
                source={{ uri: service.image || 'https://via.placeholder.com/100' }}
                style={styles.serviceImage}
              />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
                <View style={styles.serviceMeta}>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteService(service.id)}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Service Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Service</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Image Picker */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={40} color={COLORS.gray400} />
                    <Text style={styles.imagePlaceholderText}>Add Service Image</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Form Fields */}
              <TextInput
                style={styles.input}
                placeholder="Service Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Service Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={styles.input}
                placeholder="Price ($)"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Location"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              {/* Category Selection */}
              <Text style={styles.categoryTitle}>Select Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      formData.category === category.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, category: category.id })}
                  >
                    <Ionicons
                      name={category.icon}
                      size={24}
                      color={formData.category === category.id ? COLORS.white : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        formData.category === category.id && styles.categoryTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Create Service</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.sm,
  },
  servicesList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  createFirstButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  createFirstButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.md,
    marginRight: SPACING.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  serviceDescription: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  serviceCategory: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.textTertiary,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius.sm,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  imagePicker: {
    marginBottom: SPACING.lg,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius.lg,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  categoryTextSelected: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
  },
});