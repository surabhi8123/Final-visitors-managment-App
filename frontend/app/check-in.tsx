import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { visitorAPI } from './services/api';
import { CheckInData, Visitor } from '../src/types';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallScreen = width < 375;
const isMobile = width < 768;

export default function CheckInScreen() {
  const theme = useTheme();
  const [formData, setFormData] = useState<CheckInData>({
    name: '',
    email: '',
    phone: '',
    purpose: '',
  });
  const [photoData, setPhotoData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [existingVisitor, setExistingVisitor] = useState<Visitor | null>(null);

  const handleInputChange = (field: keyof CheckInData, value: string) => {
    setFormData((prev: CheckInData) => ({ ...prev, [field]: value }));
    
    // Search for existing visitor when email or phone is entered
    if ((field === 'email' || field === 'phone') && value.length > 3) {
      searchExistingVisitor(field, value);
    }
  };

  const searchExistingVisitor = async (field: 'email' | 'phone', value: string) => {
    try {
      const response = await visitorAPI.searchVisitor(
        field === 'email' ? value : undefined,
        field === 'phone' ? value : undefined
      );
      
      if (response.found && response.visitor) {
        setExistingVisitor(response.visitor);
        // Auto-fill the form with existing visitor data
        setFormData((prev: CheckInData) => ({
          ...prev,
          name: response.visitor!.name,
          email: response.visitor!.email,
          phone: response.visitor!.phone,
        }));
        Alert.alert(
          'Returning Visitor',
          `Welcome back, ${response.visitor!.name}! Your details have been auto-filled.`
        );
      } else {
        setExistingVisitor(null);
      }
    } catch (error) {
      console.error('Error searching for visitor:', error);
    }
  };

  const requestCameraPermission = async () => {
    try {
      // Request camera permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to take photos. You can enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => {
                // Open device settings
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openURL('package:com.android.settings');
                }
              }
            }
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
      return false;
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (!result.canceled && result.assets[0].base64) {
        setPhotoData(`data:image/jpeg;base64,${result.assets[0].base64}`);
      } else if (result.canceled) {
        console.log('User cancelled photo capture');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Camera Error', 
        'Failed to take photo. Please check your camera permissions and try again.',
        [
          { text: 'OK' },
          { 
            text: 'Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openURL('package:com.android.settings');
              }
            }
          }
        ]
      );
    }
  };

  const removePhoto = () => {
    setPhotoData('');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.purpose) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const checkInData: CheckInData = {
        ...formData,
        photo_data: photoData || undefined,
      };

      const response = await visitorAPI.checkIn(checkInData);
      
      Alert.alert(
        'Success',
        response.is_returning_visitor 
          ? 'Returning visitor checked in successfully!'
          : 'New visitor checked in successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error checking in visitor:', error);
      Alert.alert('Error', 'Failed to check in visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Title style={styles.title}>Visitor Check-in</Title>
                
                {existingVisitor && (
                  <Card style={styles.existingVisitorCard}>
                    <Card.Content>
                      <Title style={styles.existingVisitorTitle}>
                        Returning Visitor Detected
                      </Title>
                      <Paragraph style={styles.existingVisitorText}>
                        Welcome back, {existingVisitor.name}! Your details have been auto-filled.
                      </Paragraph>
                    </Card.Content>
                  </Card>
                )}

                <View style={styles.formContainer}>
                  <View style={styles.inputRow}>
                    <TextInput
                      label="Full Name *"
                      value={formData.name}
                      onChangeText={(text) => handleInputChange('name', text)}
                      style={[styles.input, isTablet ? styles.halfInput : styles.fullInput]}
                      mode="outlined"
                      dense={isMobile}
                    />
                    <TextInput
                      label="Email *"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      style={[styles.input, isTablet ? styles.halfInput : styles.fullInput]}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      dense={isMobile}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <TextInput
                      label="Phone Number *"
                      value={formData.phone}
                      onChangeText={(text) => handleInputChange('phone', text)}
                      style={[styles.input, isTablet ? styles.halfInput : styles.fullInput]}
                      mode="outlined"
                      keyboardType="phone-pad"
                      dense={isMobile}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <TextInput
                      label="Reason for Visit *"
                      value={formData.purpose}
                      onChangeText={(text) => handleInputChange('purpose', text)}
                      style={[styles.input, styles.fullInput]}
                      mode="outlined"
                      multiline
                      numberOfLines={isMobile ? 2 : 3}
                      dense={isMobile}
                    />
                  </View>
                </View>

                <View style={styles.photoSection}>
                  <Title style={styles.photoTitle}>Visitor Photo</Title>
                  
                  {photoData ? (
                    <View style={styles.photoContainer}>
                      <View style={styles.photoWrapper}>
                        <Image source={{ uri: photoData }} style={styles.photo} />
                        <TouchableOpacity 
                          style={styles.removePhotoButton}
                          onPress={removePhoto}
                        >
                          <IconButton
                            icon="close"
                            size={isMobile ? 16 : 20}
                            iconColor="white"
                            style={styles.removeIcon}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.photoButtons}>
                        <Button
                          mode="outlined"
                          onPress={takePhoto}
                          style={styles.photoButton}
                          icon="camera"
                          compact={isMobile}
                        >
                          Retake Photo
                        </Button>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photoContainer}>
                      <View style={styles.cameraOptions}>
                        <Button
                          mode="contained"
                          onPress={takePhoto}
                          style={styles.photoButton}
                          icon="camera"
                          compact={isMobile}
                        >
                          Take Photo
                        </Button>
                      </View>
                    </View>
                  )}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                >
                  Check In Visitor
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isMobile ? 32 : 40,
  },
  contentContainer: {
    padding: isTablet ? 40 : (isSmallScreen ? 12 : 16),
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
    minHeight: '100%',
  },
  card: {
    marginBottom: isMobile ? 10 : 20,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderRadius: 12,
  },
  cardContent: {
    paddingBottom: isMobile ? 16 : 20,
  },
  title: {
    fontSize: isTablet ? 32 : (isSmallScreen ? 18 : 22),
    fontWeight: 'bold',
    marginBottom: isMobile ? 16 : 20,
    textAlign: 'center',
    lineHeight: isTablet ? 40 : (isSmallScreen ? 24 : 28),
  },
  existingVisitorCard: {
    backgroundColor: '#e3f2fd',
    marginBottom: isMobile ? 12 : 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderRadius: 8,
  },
  existingVisitorTitle: {
    fontSize: isTablet ? 18 : (isSmallScreen ? 13 : 15),
    color: '#1976d2',
    lineHeight: isTablet ? 24 : (isSmallScreen ? 18 : 20),
  },
  existingVisitorText: {
    fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    color: '#333',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 16 : 18),
  },
  formContainer: {
    marginBottom: isMobile ? 16 : 20,
  },
  inputRow: {
    flexDirection: 'column',
    gap: isMobile ? 12 : 15,
    marginBottom: isMobile ? 12 : 15,
  },
  input: {
    marginBottom: 0,
    minHeight: isSmallScreen ? 48 : (isMobile ? 52 : 56),
  },
  halfInput: {
    width: '100%',
  },
  fullInput: {
    width: '100%',
  },
  photoSection: {
    marginTop: isMobile ? 16 : 20,
    marginBottom: isMobile ? 16 : 20,
  },
  photoTitle: {
    fontSize: isTablet ? 20 : (isSmallScreen ? 14 : 16),
    marginBottom: isMobile ? 12 : 15,
    fontWeight: 'bold',
    lineHeight: isTablet ? 26 : (isSmallScreen ? 20 : 22),
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
    width: isTablet ? 300 : (isSmallScreen ? 200 : (isMobile ? 220 : 240)),
    height: isTablet ? 225 : (isSmallScreen ? 150 : (isMobile ? 165 : 180)),
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: isMobile ? 12 : 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: isMobile ? 8 : 10,
    right: isMobile ? 8 : 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: isMobile ? 14 : 18,
    padding: isMobile ? 2 : 3,
  },
  removeIcon: {
    backgroundColor: 'transparent',
    margin: 0,
  },
  cameraOptions: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: isMobile ? 12 : 15,
    width: '100%',
    marginBottom: isMobile ? 12 : 15,
  },
  photoButtons: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: isMobile ? 12 : 15,
    width: '100%',
  },
  photoButton: {
    width: '100%',
    minHeight: isSmallScreen ? 44 : (isMobile ? 48 : 56),
  },
  cameraToggleButton: {
    width: '100%',
    minHeight: isSmallScreen ? 44 : (isMobile ? 48 : 56),
  },
  submitButton: {
    marginTop: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 8 : 10,
    minHeight: isSmallScreen ? 48 : (isMobile ? 52 : 56),
    width: '100%',
  },
  submitButtonContent: {
    height: isSmallScreen ? 48 : (isMobile ? 52 : 56),
  },
}); 