import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  Image,
  Text,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { visitorAPI } from './services/api';
import { Visit } from '../src/types';
import { getApiBaseUrl } from './config/api';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isSmallScreen = width < 375;
const isMobile = width < 768;

export default function ActiveVisitorsScreen() {
  const theme = useTheme();
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveVisitors = async () => {
    try {
      const response = await visitorAPI.getActiveVisitors();
      setActiveVisits(response.active_visitors);
    } catch (error) {
      console.error('Error fetching active visitors:', error);
      Alert.alert('Error', 'Failed to load active visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVisitors();
  }, []);

  const handleCheckOut = async (visitId: string) => {
    try {
      await visitorAPI.checkOut({ visit_id: visitId });
      Alert.alert('Success', 'Visitor checked out successfully!');
      fetchActiveVisitors(); // Refresh the list
    } catch (error) {
      console.error('Error checking out visitor:', error);
      Alert.alert('Error', 'Failed to check out visitor');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveVisitors();
    setRefreshing(false);
  };

  // Helper function to get the correct image URL
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, construct the full URL
    const baseUrl = getApiBaseUrl().replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  // Helper function to render visitor photo
  const renderVisitorPhoto = (visit: Visit) => {
    console.log(`Rendering photo for ${visit.visitor_name}:`, {
      hasPhotos: !!visit.photos,
      photoCount: visit.photos?.length || 0,
      photos: visit.photos
    });
    
    if (visit.photos && visit.photos.length > 0) {
      const photo = visit.photos[0];
      
      // Try to use image_url first (full URL from backend), then fallback to image field
      const imageUrl = photo.image_url || getImageUrl(photo.image);
      
      console.log(`Photo details for ${visit.visitor_name}:`, {
        photoId: photo.id,
        imageUrl: imageUrl,
        originalImage: photo.image,
        hasImageUrl: !!photo.image_url,
        imageUrlValue: photo.image_url
      });
      
      if (imageUrl) {
        return (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.visitorPhoto}
            resizeMode="cover"
            onError={(error) => {
              console.error('Error loading visitor photo:', error.nativeEvent.error);
              console.error('Failed URL:', imageUrl);
              console.error('Photo object:', photo);
            }}
            onLoad={() => {
              console.log('Successfully loaded photo for:', visit.visitor_name);
              console.log('Photo URL:', imageUrl);
            }}
          />
        );
      } else {
        console.log(`No valid image URL for ${visit.visitor_name}, using placeholder`);
      }
    } else {
      console.log(`No photos found for ${visit.visitor_name}, using placeholder`);
    }
    
    // Fallback to placeholder with visitor's initial
    return (
      <View style={styles.placeholderPhoto}>
        <Text style={styles.placeholderText}>
          {visit.visitor_name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderVisitItem = ({ item }: { item: Visit }) => (
    <Card style={styles.visitCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.visitHeader}>
          <View style={styles.visitInfo}>
            <View style={styles.visitorHeader}>
              {renderVisitorPhoto(item)}
              <View style={styles.visitorDetails}>
                <Text style={styles.visitorName} numberOfLines={2}>
                  {item.visitor_name}
                </Text>
                <Text style={styles.visitorContact} numberOfLines={1}>
                  📧 {item.visitor_email}
                </Text>
                <Text style={styles.visitorContact} numberOfLines={1}>
                  📞 {item.visitor_phone}
                </Text>
              </View>
            </View>
            
            <View style={styles.visitDetails}>
              <Text style={styles.visitPurpose} numberOfLines={3}>
                🎯 <Text style={styles.boldText}>Purpose:</Text> {item.purpose}
              </Text>
            </View>
          </View>
          
          <View style={styles.visitTime}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.checkInTime}>
              <Text style={styles.boldText}>Check-in:</Text> {new Date(item.check_in_time).toLocaleTimeString()}
            </Text>
            <Text style={styles.duration}>
              <Text style={styles.boldText}>Duration:</Text> {item.duration_formatted}
            </Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={() => handleCheckOut(item.id)}
          style={styles.checkOutButton}
          contentStyle={styles.checkOutButtonContent}
          buttonColor="#d32f2f"
        >
          Check Out
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Title style={styles.title}>Active Visitors</Title>
        <Paragraph style={styles.subtitle}>
          Currently checked-in visitors ({activeVisits.length})
        </Paragraph>

        {activeVisits.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title style={styles.emptyTitle}>No Active Visitors</Title>
              <Paragraph style={styles.emptyDescription}>
                There are currently no visitors checked in.
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={activeVisits}
            renderItem={renderVisitItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: isTablet ? 40 : (isSmallScreen ? 16 : 20),
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: isTablet ? 32 : (isSmallScreen ? 20 : 24),
    fontWeight: 'bold',
    marginBottom: isMobile ? 8 : 10,
    textAlign: 'center',
    lineHeight: isTablet ? 40 : (isSmallScreen ? 26 : 30),
  },
  subtitle: {
    fontSize: isTablet ? 18 : (isSmallScreen ? 14 : 16),
    marginBottom: isMobile ? 16 : 20,
    textAlign: 'center',
    color: '#666',
    lineHeight: isTablet ? 24 : (isSmallScreen ? 20 : 22),
  },
  listContainer: {
    paddingBottom: isMobile ? 32 : 40,
  },
  visitCard: {
    marginBottom: isMobile ? 12 : 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: isTablet ? 24 : (isSmallScreen ? 16 : 20),
  },
  visitHeader: {
    flexDirection: 'column',
    marginBottom: isMobile ? 12 : 15,
  },
  visitInfo: {
    marginBottom: isMobile ? 12 : 15,
  },
  visitTime: {
    alignItems: 'flex-start',
    marginTop: isMobile ? 8 : 10,
  },
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isMobile ? 8 : 10,
  },
  visitorPhoto: {
    width: isTablet ? 60 : (isSmallScreen ? 44 : 50),
    height: isTablet ? 60 : (isSmallScreen ? 44 : 50),
    borderRadius: isTablet ? 30 : (isSmallScreen ? 22 : 25),
    marginRight: isMobile ? 8 : 10,
    backgroundColor: '#e0e0e0',
  },
  placeholderPhoto: {
    width: isTablet ? 60 : (isSmallScreen ? 44 : 50),
    height: isTablet ? 60 : (isSmallScreen ? 44 : 50),
    borderRadius: isTablet ? 30 : (isSmallScreen ? 22 : 25),
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? 8 : 10,
  },
  placeholderText: {
    color: '#666',
    fontSize: isTablet ? 24 : (isSmallScreen ? 18 : 20),
  },
  visitorDetails: {
    flex: 1,
  },
  visitorName: {
    fontSize: isTablet ? 20 : (isSmallScreen ? 16 : 18),
    fontWeight: 'bold',
    marginBottom: isMobile ? 4 : 5,
    lineHeight: isTablet ? 26 : (isSmallScreen ? 22 : 24),
  },
  visitorContact: {
    fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    marginBottom: isMobile ? 2 : 2,
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  visitDetails: {
    marginTop: isMobile ? 8 : 10,
  },
  visitPurpose: {
    fontSize: isTablet ? 16 : (isSmallScreen ? 13 : 14),
    fontStyle: 'italic',
    marginTop: isMobile ? 4 : 5,
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  boldText: {
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#4caf50',
    paddingVertical: isMobile ? 4 : 5,
    paddingHorizontal: isMobile ? 8 : 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: isMobile ? 6 : 10,
  },
  statusText: {
    color: 'white',
    fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    fontWeight: 'bold',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  checkInTime: {
    fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    color: '#666',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  duration: {
    fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    color: '#666',
    marginTop: isMobile ? 2 : 2,
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  checkOutButton: {
    marginTop: isMobile ? 8 : 10,
    minHeight: isSmallScreen ? 44 : (isMobile ? 48 : 56),
    width: '100%',
  },
  checkOutButtonContent: {
    height: isSmallScreen ? 44 : (isMobile ? 48 : 56),
  },
  emptyCard: {
    marginTop: isMobile ? 24 : 40,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: isTablet ? 20 : (isSmallScreen ? 16 : 18),
    textAlign: 'center',
    lineHeight: isTablet ? 26 : (isSmallScreen ? 22 : 24),
  },
  emptyDescription: {
    fontSize: isTablet ? 16 : (isSmallScreen ? 13 : 14),
    textAlign: 'center',
    color: '#666',
    marginBottom: isMobile ? 16 : 20,
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
}); 