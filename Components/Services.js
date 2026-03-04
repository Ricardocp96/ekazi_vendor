
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { useFocusEffect } from 'expo-router';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { vendorAPI } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Service({ initialCreate = false, onCreateHandled }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
  });
  const [vendorLocation, setVendorLocation] = useState('');
  const titlePlaceholder = 'Service Title';
  const descriptionPlaceholder =
    'Describe what is included, equipment needed, and any requirements.';
  const pricePlaceholder = 'Price (Tsh)';
  const locationPlaceholder = useMemo(() => {
    if (editingService) {
      return 'Update the service location customers should expect you in.';
    }
    if (vendorLocation) {
      return `City or area you serve (defaults to ${vendorLocation}).`;
    }
    return 'City or area you serve.';
  }, [editingService, vendorLocation]);

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const filteredServices = useMemo(() => {
    if (activeFilter === 'all') {
      return services;
    }
    return services.filter((service) => service.category === activeFilter);
  }, [activeFilter, services]);

  const fetchVendorProfile = useCallback(async () => {
    try {
      const vendorId = await AsyncStorage.getItem('id');
      if (!vendorId) {
        return;
      }
      const response = await vendorAPI.getProfile(Number(vendorId));
      const payload = response?.data?.data ?? response?.data ?? response;
      const locationValue =
        payload?.location ||
        payload?.serviceProvider?.location ||
        payload?.profile?.location ||
        '';
      if (typeof locationValue === 'string') {
        setVendorLocation(locationValue);
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const vendorId = await AsyncStorage.getItem('id');
      if (!vendorId) {
        console.warn('Vendor ID not found in storage yet; skipping service fetch.');
        return;
      }

      const response = await vendorAPI.getServicesByVendor(Number(vendorId));
      const raw = response?.data?.data ?? response?.data ?? [];
      const servicesList = Array.isArray(raw) ? raw : [];
      const enriched = servicesList.map((service) => {
        const resolvedLocation =
          service?.location ||
          service?.serviceProvider?.location ||
          vendorLocation ||
          '';
        if (resolvedLocation) {
          return { ...service, location: resolvedLocation };
        }
        return { ...service };
      });
      setServices(enriched);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, [vendorLocation]);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [fetchServices])
  );

  useFocusEffect(
    useCallback(() => {
      fetchVendorProfile();
    }, [fetchVendorProfile])
  );

  useEffect(() => {
    if (initialCreate && !hasAutoOpened) {
      setModalVisible(true);
      setHasAutoOpened(true);
      onCreateHandled?.();
    }
    if (!initialCreate && hasAutoOpened) {
      setHasAutoOpened(false);
    }
  }, [initialCreate, hasAutoOpened, onCreateHandled]);

  useEffect(() => {
    setFormData((prev) => {
      if (editingService || !vendorLocation) {
        return prev;
      }
      if (typeof prev.location === 'string' && prev.location.trim().length > 0) {
        return prev;
      }
      return { ...prev, location: vendorLocation };
    });
  }, [vendorLocation, editingService]);

  // Image quality governance constants
  const IMAGE_RULES = {
    MIN_WIDTH: 1000,
    MIN_HEIGHT: 750,
    MIN_FILE_SIZE: 80 * 1024, // 80 KB
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
    MIN_ASPECT_RATIO: 4 / 3, // ~1.33
    MAX_ASPECT_RATIO: 16 / 9, // ~1.78
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png'],
  };

  const validateImageQuality = (asset) => {
    const { width, height, fileSize, uri } = asset;

    if (width < IMAGE_RULES.MIN_WIDTH || height < IMAGE_RULES.MIN_HEIGHT) {
      return {
        valid: false,
        message: `Image is too small. Please use a photo at least ${IMAGE_RULES.MIN_WIDTH}×${IMAGE_RULES.MIN_HEIGHT} pixels so customers can clearly see your service.`,
      };
    }

    const aspectRatio = width / height;
    if (aspectRatio < IMAGE_RULES.MIN_ASPECT_RATIO || aspectRatio > IMAGE_RULES.MAX_ASPECT_RATIO) {
      return {
        valid: false,
        message: 'Image aspect ratio should be between 4:3 and 16:9 for best display.',
      };
    }

    if (fileSize != null) {
      if (fileSize < IMAGE_RULES.MIN_FILE_SIZE) {
        return {
          valid: false,
          message: 'Image file is too small and may look blurry. Please choose a higher quality photo.',
        };
      }
      if (fileSize > IMAGE_RULES.MAX_FILE_SIZE) {
        return {
          valid: false,
          message: 'Image is too large. Please select a photo smaller than 5 MB.',
        };
      }
    }

    const ext = (uri?.split('.').pop() || '').toLowerCase();
    if (ext && !IMAGE_RULES.ALLOWED_EXTENSIONS.includes(ext) && ext !== 'heic') {
      return {
        valid: false,
        message: 'Please use a JPEG or PNG image.',
      };
    }

    return { valid: true };
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const validation = validateImageQuality(asset);

    if (!validation.valid) {
      Alert.alert('Image quality check', validation.message);
      return;
    }

    setSelectedImage(asset.uri);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const vendorId = await AsyncStorage.getItem('id');
      if (!vendorId) {
        Alert.alert('Error', 'Could not determine your vendor account. Please log in again.');
        return;
      }

      const trimmedTitle = formData.title.trim();
      const trimmedDescription = formData.description.trim();
      const priceValue = parseFloat(formData.price);
      if (!Number.isFinite(priceValue)) {
        Alert.alert('Invalid price', 'Please enter a valid numeric price.');
        return;
      }

      if (editingService) {
      const payload = {
        servicename: trimmedTitle,
        service_description: trimmedDescription,
        serviceprice: priceValue,
        category: formData.category,
        location: formData.location,
      };

        if (selectedImage && !selectedImage.startsWith('http')) {
          const filename = selectedImage.split('/').pop() || `service_${Date.now()}.jpg`;
          const extension = (filename.split('.').pop() || 'jpg').toLowerCase();
          const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

          const updateForm = new FormData();
          updateForm.append('servicename', trimmedTitle);
          updateForm.append('service_description', trimmedDescription);
          updateForm.append('serviceprice', String(priceValue));
          updateForm.append('category', formData.category);
          updateForm.append('location', formData.location);
          updateForm.append('images', {
            uri: selectedImage,
            name: filename,
            type: mimeType,
          });

          await vendorAPI.updateServiceWithImages(editingService.id, updateForm);
        } else {
          await vendorAPI.updateService(editingService.id, payload);
        }
        Alert.alert('Success', 'Service updated successfully!');
      } else {
        if (!selectedImage) {
          Alert.alert('Image required', 'Please select at least one image for your service.');
          return;
        }

        const multipartData = new FormData();
        multipartData.append('serviceProviderId', String(Number(vendorId)));
        multipartData.append('servicename', trimmedTitle);
        multipartData.append('service_description', trimmedDescription);
        multipartData.append('serviceprice', String(priceValue));
        multipartData.append('category', formData.category);
        multipartData.append('location', formData.location);

        const filename = selectedImage.split('/').pop() || `service_${Date.now()}.jpg`;
        const extension = (filename.split('.').pop() || 'jpg').toLowerCase();
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

        multipartData.append('images', {
          uri: selectedImage,
          name: filename,
          type: mimeType,
        });

        await vendorAPI.createServiceWithImages(multipartData);
        Alert.alert('Success', 'Service created successfully!');
      }

      closeModal();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);

      const isNetworkError = error?.message === 'Network Error' || error?.code === 'ECONNABORTED';
      const isTimeoutError = error?.code === 'ECONNABORTED' || (error?.message && error.message.includes('timeout'));
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      const statusCode = error?.response?.status;

      if (isTimeoutError || isNetworkError) {
        // For timeout/network errors, we can't be sure if the service was created
        // Check if we got a response before the timeout (status code exists means server responded)
        if (statusCode === 201 || statusCode === 200) {
          // Server responded with success before timeout - service was likely created
          Alert.alert('Success', 'Service created successfully! Refreshing your services.');
          fetchServices();
          closeModal();
        } else {
          // No response or error response - service may or may not have been created
          Alert.alert(
            'Connection Issue',
            'The connection timed out while creating your service. Please check your services list to confirm if it was created. If not, please try again.',
            [
              {
                text: 'Check Services',
                onPress: () => {
                  fetchServices();
                  closeModal();
                },
              },
              {
                text: 'Try Again',
                style: 'cancel',
                onPress: () => {
                  setLoading(false);
                },
              },
            ],
          );
        }
      } else if (serverMessage) {
        Alert.alert('Error', `${statusCode ? `(${statusCode}) ` : ''}${serverMessage}`);
      } else {
        Alert.alert('Error', `Failed to save service. ${statusCode ? `Status: ${statusCode}` : 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      location: vendorLocation || '',
    });
    setSelectedImage(null);
    setEditingService(null);
  }, [vendorLocation]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

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

      const categoriesWithAll = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Manage Your Services</Text>
            <Text style={styles.heroSubtitle}>
              Keep offerings up to date and respond quickly to new customer requests.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.heroButtonLabel}>Add Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, SHADOWS.light]}>
            <Text style={styles.statValue}>{services.length}</Text>
            <Text style={styles.statLabel}>Total services</Text>
          </View>
          <View style={[styles.statCard, SHADOWS.light]}>
            <Text style={styles.statValue}>{filteredServices.length}</Text>
            <Text style={styles.statLabel}>Visible now</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {categoriesWithAll.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterChip,
                activeFilter === item.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(item.id)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterChipLabel,
                  activeFilter === item.id && styles.filterChipLabelActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredServices.length === 0 ? (
          <View style={[styles.emptyContainer, SHADOWS.light]}>
            <Image
              source={require('../assets/fix.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No services to show</Text>
            <Text style={styles.emptySubtitle}>
              Create your first service or adjust the filters to view existing offerings.
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.createFirstButtonText}>Create Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredServices.map((service, index) => {
            const key = service.id || index;
            const title = service.title || service.servicename || 'Untitled service';
            const description = service.description || service.service_description || 'No description provided yet.';
            const priceValue = service.price ?? service.serviceprice;
            const priceNumber = Number(priceValue);
            const formattedPrice =
              Number.isFinite(priceNumber) && priceNumber > 0
                ? `Tsh ${priceNumber.toLocaleString()}`
                : 'Price on request';
            const categoryLabel = service.category || 'Uncategorized';
            const statusLabel = service.status || 'Active';
            const primaryImage = Array.isArray(service.images) && service.images.length > 0 ? service.images[0] : null;
            let imageSource = null;
            if (typeof service.image === 'string') {
              imageSource = service.image;
            } else if (primaryImage) {
              imageSource = typeof primaryImage === 'string' ? primaryImage : primaryImage.url;
            }

            return (
              <View key={key} style={[styles.serviceCard, SHADOWS.light]}>
                <View style={styles.serviceHeaderRow}>
                  <Text style={styles.serviceCardTitle}>{title}</Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{formattedPrice}</Text>
                  </View>
                </View>
                <View style={styles.serviceMetaRow}>
                  <View style={styles.statusPill}>
                    <Ionicons name="ellipse" size={8} color={COLORS.success} />
                    <Text style={styles.statusPillText}>{statusLabel}</Text>
                  </View>
                  <Text style={styles.categoryText}>{categoryLabel}</Text>
                </View>
                <Text style={styles.serviceDescription} numberOfLines={3}>
                  {description}
                </Text>
                <View style={styles.serviceFooter}>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.gray400} />
                    <Text style={styles.locationText} numberOfLines={2} ellipsizeMode="tail">
                      {service.location ||
                        service.serviceProvider?.location ||
                        vendorLocation ||
                        'Location TBD'}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.secondaryAction}
                      activeOpacity={0.8}
                      onPress={() => {
                        setEditingService(service);
                        const locationForForm =
                          service.location ||
                          service.serviceProvider?.location ||
                          vendorLocation ||
                          '';
                        setFormData({
                          title: service.servicename || service.title || '',
                          description: service.service_description || service.description || '',
                          price: service.serviceprice?.toString() || service.price?.toString() || '',
                          category: service.category || '',
                          location: locationForForm,
                        });
                        if (Array.isArray(service.images) && service.images.length > 0) {
                          const img = service.images[0];
                          setSelectedImage(typeof img === 'string' ? img : img.url);
                        } else {
                          setSelectedImage(null);
                        }
                        setModalVisible(true);
                      }}
                    >
                      <Ionicons name="pencil" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => deleteService(service.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                {imageSource ? (
                  <Image
                    source={{ uri: imageSource }}
                    style={styles.servicePreview}
                  />
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Service Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add New Service'}</Text>
              <TouchableOpacity onPress={closeModal}>
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
                placeholder={titlePlaceholder}
                placeholderTextColor={COLORS.gray400}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={descriptionPlaceholder}
                placeholderTextColor={COLORS.gray400}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={styles.input}
                placeholder={pricePlaceholder}
                placeholderTextColor={COLORS.gray400}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder={locationPlaceholder}
                placeholderTextColor={COLORS.gray400}
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
                <Text style={styles.submitButtonText}>{editingService ? 'Save Changes' : 'Create Service'}</Text>
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
  contentContainer: {
    paddingBottom: SPACING.xxl,
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
  heroSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.lg,
  },
  heroTextBlock: {
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  heroButtonLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
  },
  statValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  filterChips: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  filterChipLabelActive: {
    color: COLORS.white,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  createFirstButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  createFirstButtonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceCardTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  priceBadge: {
    backgroundColor: COLORS.primary + '1A',
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  priceText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success + '14',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.lg,
  },
  statusPillText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.success,
  },
  categoryText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  serviceDescription: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
    minWidth: 0,
  },
  locationText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignSelf: 'flex-start',
  },
  secondaryAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicePreview: {
    height: 140,
    borderRadius: SIZES.radius.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.gray100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    maxHeight: '88%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  formContainer: {
    marginTop: SPACING.md,
  },
  imagePicker: {
    height: 160,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.gray100,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: SIZES.radius.lg,
  },
  selectedImage: {
    flex: 1,
    borderRadius: SIZES.radius.lg,
  },
  imagePlaceholderText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryItem: {
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  categoryItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '14',
  },
  categoryText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  categoryTextSelected: {
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});
