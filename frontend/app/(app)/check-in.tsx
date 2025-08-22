import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Text,
} from 'react-native';
import {
  useTheme,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { visitorAPI } from '../services/api';
import SignaturePad from '../../src/components/SignaturePad';
import { colors, spacing, borderRadius, shadows, responsive } from '../../src/theme';
import { 
  LoadingView, 
  SectionHeader, 
  FilterCard,
  EnhancedTextInput,
  EnhancedButton
} from '../../src/components';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const isMobile = width < 768;

interface CheckInForm {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  photo_data?: string;
  signature_data?: string;
}

export default function CheckInScreen() {
  const theme = useTheme();
  const [formData, setFormData] = useState<CheckInForm>({
    name: '',
    email: '',
    phone: '',
    purpose: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [existingVisitor, setExistingVisitor] = useState<any>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose of visit is required';
    }

    // Make photo mandatory
    if (!formData.photo_data) {
      newErrors.photo = 'Visitor photo is required';
    }

    // Make signature mandatory
    if (!formData.signature_data) {
      newErrors.signature = 'Visitor signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear existing visitor when user changes email or phone
    if ((field === 'email' || field === 'phone') && existingVisitor) {
      setExistingVisitor(null);
    }
  };

  const searchExistingVisitor = useCallback(async () => {
    if (!formData.email.trim() && !formData.phone.trim()) {
      Alert.alert('Search Error', 'Please enter either email or phone number to search');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await visitorAPI.searchVisitor(
        formData.email.trim() || undefined,
        formData.phone.trim() || undefined
      );

      if (response.found && response.visitor) {
        const visitor = response.visitor;
        setExistingVisitor(visitor);
        Alert.alert(
          'Existing Visitor Found',
          `Found existing visitor: ${visitor.name}\nEmail: ${visitor.email}\nPhone: ${visitor.phone}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Use This Info', 
              onPress: () => {
                setFormData(prev => ({
                  ...prev,
                  name: visitor.name,
                  email: visitor.email,
                  phone: visitor.phone,
                }));
                setExistingVisitor(null);
              }
            }
          ]
        );
      } else {
        setExistingVisitor(null);
        Alert.alert('No Existing Visitor', 'No existing visitor found with these details.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search for existing visitor');
    } finally {
      setSearchLoading(false);
    }
  }, [formData.email, formData.phone]);

  const handleSignatureSaved = (signatureData: string) => {
    setFormData(prev => ({ ...prev, signature_data: signatureData }));
  };

  const takePhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera permission is required to take a photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageData = `data:image/jpeg;base64,${asset.base64}`;
          setFormData(prev => ({ ...prev, photo_data: imageData }));
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  }, []);

  const handleCheckIn = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Create a copy of form data to send to the API
      const checkInData = { ...formData };
      
      // Log the signature data for debugging
      if (formData.signature_data) {
        console.log('Including signature in check-in data');
        console.log('Signature data type:', typeof formData.signature_data);
        console.log('Signature data sample:', formData.signature_data.substring(0, 50) + '...');
      } else {
        console.warn('No signature data found in form');
      }
      
      // Add is_vector_signature flag if the signature is vector data
      if (formData.signature_data && formData.signature_data.startsWith('{') && formData.signature_data.includes('paths')) {
        console.log('Detected vector signature data');
        checkInData.is_vector_signature = 'true';
      }
      
      const response = await visitorAPI.checkIn(checkInData);
      
      Alert.alert(
        'Check-in Successful',
        response.is_returning_visitor 
          ? 'Welcome back! Visitor checked in successfully.'
          : 'New visitor checked in successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset all form fields including photo and signature
              setFormData({
                name: '',
                email: '',
                phone: '',
                purpose: '',
                photo_data: undefined,
                signature_data: undefined
              });
              setExistingVisitor(null);
              setErrors({});
            }
          }
        ]
      );
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Check-in Failed', 'Failed to check in visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <SectionHeader
          title="Check In Visitor"
          subtitle="Register a new visitor or check in existing visitor"
        />

        {/* Check-in Form */}
        <FilterCard title="Visitor Information">
          <EnhancedTextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text: string) => handleInputChange('name', text)}
            placeholder="Enter visitor's full name"
            error={errors.name}
            autoCapitalize="words"
            disabled={loading}
          />

          <EnhancedTextInput
            label="Email Address"
            value={formData.email}
            onChangeText={(text: string) => handleInputChange('email', text)}
            placeholder="Enter email address"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            disabled={loading}
          />

          <EnhancedTextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text: string) => handleInputChange('phone', text)}
            placeholder="Enter phone number"
            error={errors.phone}
            keyboardType="phone-pad"
            disabled={loading}
          />

          <EnhancedTextInput
            label="Purpose of Visit"
            value={formData.purpose}
            onChangeText={(text: string) => handleInputChange('purpose', text)}
            placeholder="Enter purpose of visit"
            error={errors.purpose}
            multiline
            numberOfLines={3}
            disabled={loading}
          />

          <View style={styles.searchSection}>
            <EnhancedButton
              mode="outlined"
              onPress={searchExistingVisitor}
              loading={searchLoading}
              disabled={loading || searchLoading}
              icon="account-search"
              style={styles.searchButton}
            >
              Search Existing Visitor
            </EnhancedButton>
          </View>

          <View style={styles.photoSection}>
            <Text style={[styles.label, errors.photo && styles.errorText]}>
              Visitor's Photo *
              {errors.photo && <Text style={styles.errorText}> - {errors.photo}</Text>}
            </Text>
            <EnhancedButton
              mode="outlined"
              onPress={takePhoto}
              disabled={loading}
              icon="camera"
              style={[styles.photoButton, errors.photo && styles.errorBorder]}
            >
              {formData.photo_data ? 'Retake Photo' : 'Take Photo'}
            </EnhancedButton>
            
            {formData.photo_data && (
              <View style={styles.photoPreview}>
                <Image 
                  source={{ uri: formData.photo_data }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          {/* Digital Signature Section */}
          <View style={styles.signatureSection}>
            <Text style={[styles.label, errors.signature && styles.errorText]}>
              Visitor's Signature *
              {errors.signature && <Text style={styles.errorText}> - {errors.signature}</Text>}
            </Text>
            <View style={[styles.signatureContainer, errors.signature && styles.errorBorder]}>
              <SignaturePad 
                onSave={handleSignatureSaved}
                height={150}
                lineColor="#000000"
                lineWidth={2}
                backgroundColor="#ffffff"
              />
            </View>
          </View>

          <EnhancedButton
            mode="contained"
            onPress={handleCheckIn}
            loading={loading}
            disabled={loading}
            icon="account-plus"
            style={styles.checkInButton}
          >
            Check In Visitor
          </EnhancedButton>
        </FilterCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  searchSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  searchButton: {
    borderRadius: borderRadius.sm,
  },
  photoSection: {
    marginBottom: spacing.lg,
  },
  photoButton: {
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  signatureSection: {
    marginBottom: spacing.lg,
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.textSecondary,
  },
  signaturePreview: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  signatureImage: {
    width: 200,
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
    borderRadius: borderRadius.xs,
  },
  checkInButton: {
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 2,
  },
  errorBorder: {
    borderColor: colors.error,
    borderWidth: 1,
  },
});