import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { visitorAPI } from './services/api';
import { CheckInData, Visitor } from '../src/types';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 600;

export default function CheckInScreen() {
  const theme = useTheme();
  const [formData, setFormData] = useState<CheckInData>({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    host_name: '',
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotoData(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Visitor Check-in</Title>
            
            {existingVisitor && (
              <Card style={styles.existingVisitorCard}>
                <Card.Content>
                  <Title style={styles.existingVisitorTitle}>
                    Returning Visitor Detected
                  </Title>
                  <Paragraph>
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
                />
                <TextInput
                  label="Email *"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  style={[styles.input, isTablet ? styles.halfInput : styles.fullInput]}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                />
                <TextInput
                  label="Host Name (Person to Visit)"
                  value={formData.host_name}
                  onChangeText={(text) => handleInputChange('host_name', text)}
                  style={[styles.input, isTablet ? styles.halfInput : styles.fullInput]}
                  mode="outlined"
                  placeholder="Enter the name of the person being visited"
                />
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  label="Reason for Visit *"
                  value={formData.purpose}
                  onChangeText={(text) => handleInputChange('purpose', text)}
                  style={[styles.input, isTablet ? styles.halfInput : styles.fullInput]}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.photoSection}>
              <Title style={styles.photoTitle}>Visitor Photo</Title>
              
              {photoData ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photoData }} style={styles.photo} />
                  <View style={styles.photoButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setPhotoData('')}
                      style={styles.photoButton}
                    >
                      Remove Photo
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.photoButtons}>
                  <Button
                    mode="contained"
                    onPress={pickImage}
                    style={styles.photoButton}
                    icon="image"
                  >
                    Choose Photo from Gallery
                  </Button>
                </View>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Check In Visitor
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: isTablet ? 40 : 20,
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
    minHeight: '100%',
  },
  card: {
    marginBottom: 20,
    flex: 1,
  },
  title: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  existingVisitorCard: {
    backgroundColor: '#e3f2fd',
    marginBottom: 20,
  },
  existingVisitorTitle: {
    fontSize: isTablet ? 18 : 16,
    color: '#1976d2',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 15,
    marginBottom: 15,
  },
  input: {
    marginBottom: 0,
  },
  halfInput: {
    flex: 1,
  },
  fullInput: {
    width: '100%',
  },
  photoSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  photoTitle: {
    fontSize: isTablet ? 20 : 18,
    marginBottom: 10,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: isTablet ? 300 : 200,
    height: isTablet ? 225 : 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  photoButtons: {
    flexDirection: isTablet ? 'row' : 'column',
    justifyContent: 'space-around',
    gap: 10,
  },
  photoButton: {
    flex: isTablet ? 1 : undefined,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
}); 