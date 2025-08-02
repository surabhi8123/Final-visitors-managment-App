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
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { router } from 'expo-router';
import { visitorAPI } from './services/api';
import { Visit } from '../src/types';
import { responsiveSize, shadows, containers, buttons, inputs } from '../src/utils/responsive';
import { getApiBaseUrl } from './config/api';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isSmallScreen = width < 375;
const isMobile = width < 768;

export default function HistoryScreen() {
  const theme = useTheme();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    date: '',
  });

  useEffect(() => {
    loadVisitHistory();
  }, []);

  const loadVisitHistory = async () => {
    try {
      setLoading(true);
      const response = await visitorAPI.getVisitHistory();
      setVisits(response.visits || []);
    } catch (error) {
      console.error('Error loading visit history:', error);
      Alert.alert('Error', 'Failed to load visit history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportHistory = async () => {
    try {
      setExporting(true);
      // Pass current filters to export function
      const exportFilters = {
        name: filters.name || undefined,
        email: filters.email || undefined,
        date_from: filters.date || undefined,
        date_to: filters.date || undefined,
      };
      
      // Only pass filters if at least one is set
      const hasFilters = Object.values(exportFilters).some(value => value !== undefined);
      await visitorAPI.exportVisitHistory(hasFilters ? exportFilters : undefined);
      Alert.alert('Success', 'Visit history CSV file has been downloaded to your device!');
    } catch (error) {
      console.error('Error exporting visit history:', error);
      Alert.alert('Error', 'Failed to export visit history. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisitHistory();
    setRefreshing(false);
  };

  const filteredVisits = visits.filter(visit => {
    const nameMatch = visit.visitor_name.toLowerCase().includes(filters.name.toLowerCase());
    const emailMatch = visit.visitor_email.toLowerCase().includes(filters.email.toLowerCase());
    const dateMatch = !filters.date || visit.check_in_time.includes(filters.date);
    return nameMatch && emailMatch && dateMatch;
  });

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
    if (visit.photos && visit.photos.length > 0) {
      const photo = visit.photos[0];
      
      // Try to use image_url first (full URL from backend), then fallback to image field
      const imageUrl = photo.image_url || getImageUrl(photo.image);
      
      if (imageUrl) {
        return (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.visitorPhoto}
            resizeMode="cover"
            onError={(error) => {
              console.error('Error loading visitor photo:', error.nativeEvent.error);
            }}
          />
        );
      }
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
    <Card style={[styles.visitCard, shadows.medium]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.visitHeader}>
          {/* Visitor Info Section */}
          <View style={styles.visitorSection}>
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
            
            <View style={styles.visitPurpose}>
              <Text style={styles.purposeLabel}>🎯 Purpose:</Text>
              <Text style={styles.purposeText} numberOfLines={3}>
                {item.purpose}
              </Text>
            </View>
          </View>
          
          {/* Visit Time Section */}
          <View style={styles.visitTimeSection}>
            <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#4caf50' : '#ff9800' }]}>
              <Text style={styles.statusText}>
                {item.is_active ? 'Checked In' : 'Checked Out'}
              </Text>
            </View>
            
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Check-in:</Text>
              <Text style={styles.timeValue} numberOfLines={1}>
                {new Date(item.check_in_time).toLocaleString()}
              </Text>
            </View>
            
            {item.check_out_time && (
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Check-out:</Text>
                <Text style={styles.timeValue} numberOfLines={1}>
                  {new Date(item.check_out_time).toLocaleString()}
                </Text>
              </View>
            )}
            
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Duration:</Text>
              <Text style={styles.timeValue} numberOfLines={1}>
                {item.duration_formatted}
              </Text>
            </View>
          </View>
        </View>
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Title style={styles.title}>Visit History</Title>
          <Paragraph style={styles.subtitle}>
            View and manage all visitor check-ins and check-outs
          </Paragraph>

          {/* Filters Card */}
          <Card style={[styles.filtersCard, shadows.medium]}>
            <Card.Content style={styles.filtersCardContent}>
              <Title style={styles.filtersTitle}>Filter Visits</Title>
              
              <View style={styles.filtersRow}>
                <TextInput
                  label="Search by Name"
                  value={filters.name}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, name: text }))}
                  style={styles.filterInput}
                  mode="outlined"
                  dense={isMobile}
                  placeholder="Enter visitor name..."
                />
              </View>
              
              <View style={styles.filtersRow}>
                <TextInput
                  label="Search by Email"
                  value={filters.email}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, email: text }))}
                  style={styles.filterInput}
                  mode="outlined"
                  dense={isMobile}
                  placeholder="Enter email address..."
                />
              </View>
              
              <View style={styles.filtersRow}>
                <TextInput
                  label="Search by Date"
                  value={filters.date}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, date: text }))}
                  style={styles.filterInput}
                  mode="outlined"
                  dense={isMobile}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              
              <View style={styles.filterButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setFilters({ name: '', email: '', date: '' })}
                  style={[styles.filterButton, buttons.secondary]}
                  contentStyle={buttons.content}
                >
                  Clear Filters
                </Button>
                <Button
                  mode="contained"
                  onPress={exportHistory}
                  loading={exporting}
                  disabled={exporting}
                  style={[styles.filterButton, buttons.primary]}
                  contentStyle={buttons.content}
                >
                  Export History
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Results */}
          {filteredVisits.length === 0 ? (
            <Card style={[styles.emptyCard, shadows.small]}>
              <Card.Content style={styles.emptyCardContent}>
                <Title style={styles.emptyTitle}>No Visits Found</Title>
                <Paragraph style={styles.emptyDescription}>
                  {visits.length === 0 
                    ? 'No visits have been recorded yet.' 
                    : 'No visits match your current filters. Try adjusting your search criteria.'
                  }
                </Paragraph>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.listContainer}>
              {filteredVisits.map((visit) => (
                <View key={visit.id}>
                  {renderVisitItem({ item: visit })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Pull to refresh */}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={styles.refreshControl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...containers.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    ...containers.content,
    padding: responsiveSize.padding.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: responsiveSize.title,
    fontWeight: 'bold',
    marginBottom: responsiveSize.margin.medium,
    textAlign: 'center',
    lineHeight: isTablet ? 40 : (isSmallScreen ? 26 : 30),
  },
  subtitle: {
    fontSize: responsiveSize.subtitle,
    marginBottom: responsiveSize.margin.large,
    textAlign: 'center',
    color: '#666',
    lineHeight: isTablet ? 24 : (isSmallScreen ? 20 : 22),
  },
  filtersCard: {
    marginBottom: responsiveSize.margin.large,
    borderRadius: responsiveSize.cardRadius,
  },
  filtersCardContent: {
    padding: responsiveSize.padding.large,
  },
  filtersTitle: {
    fontSize: responsiveSize.subtitle,
    marginBottom: responsiveSize.margin.large,
    fontWeight: 'bold',
    lineHeight: isTablet ? 26 : (isSmallScreen ? 22 : 24),
  },
  filtersRow: {
    marginBottom: responsiveSize.margin.medium,
  },
  filterInput: {
    ...inputs.text,
  },
  filterButtons: {
    gap: responsiveSize.margin.medium,
    marginTop: responsiveSize.margin.medium,
  },
  filterButton: {
    width: '100%',
  },
  listContainer: {
    paddingBottom: responsiveSize.padding.xlarge,
  },
  visitCard: {
    marginBottom: responsiveSize.margin.medium,
    borderRadius: responsiveSize.cardRadius,
    overflow: 'hidden',
  },
  cardContent: {
    padding: responsiveSize.padding.large,
  },
  visitHeader: {
    gap: responsiveSize.margin.large,
  },
  visitorSection: {
    gap: responsiveSize.margin.medium,
  },
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSize.margin.medium,
  },
  visitorPhoto: {
    width: Math.min(isTablet ? 60 : (isSmallScreen ? 44 : 50), width * 0.12),
    height: Math.min(isTablet ? 60 : (isSmallScreen ? 44 : 50), width * 0.12),
    borderRadius: Math.min(isTablet ? 30 : (isSmallScreen ? 22 : 25), width * 0.06),
    backgroundColor: '#e0e0e0',
  },
  placeholderPhoto: {
    width: Math.min(isTablet ? 60 : (isSmallScreen ? 44 : 50), width * 0.12),
    height: Math.min(isTablet ? 60 : (isSmallScreen ? 44 : 50), width * 0.12),
    borderRadius: Math.min(isTablet ? 30 : (isSmallScreen ? 22 : 25), width * 0.06),
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: responsiveSize.body,
    fontWeight: 'bold',
  },
  visitorDetails: {
    flex: 1,
    gap: responsiveSize.margin.small,
  },
  visitorName: {
    fontSize: responsiveSize.subtitle,
    fontWeight: 'bold',
    lineHeight: isTablet ? 26 : (isSmallScreen ? 22 : 24),
  },
  visitorContact: {
    fontSize: responsiveSize.body,
    color: '#666',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  visitPurpose: {
    gap: responsiveSize.margin.small,
  },
  purposeLabel: {
    fontSize: responsiveSize.body,
    fontWeight: 'bold',
    color: '#333',
  },
  purposeText: {
    fontSize: responsiveSize.body,
    fontStyle: 'italic',
    color: '#666',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  visitTimeSection: {
    gap: responsiveSize.margin.medium,
  },
  statusBadge: {
    paddingVertical: responsiveSize.padding.small,
    paddingHorizontal: responsiveSize.padding.medium,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: responsiveSize.body,
    fontWeight: 'bold',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  timeInfo: {
    gap: responsiveSize.margin.small,
  },
  timeLabel: {
    fontSize: responsiveSize.body,
    fontWeight: 'bold',
    color: '#333',
  },
  timeValue: {
    fontSize: responsiveSize.body,
    color: '#666',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  emptyCard: {
    marginTop: responsiveSize.margin.xlarge,
    borderRadius: responsiveSize.cardRadius,
  },
  emptyCardContent: {
    padding: responsiveSize.padding.large,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: responsiveSize.subtitle,
    textAlign: 'center',
    lineHeight: isTablet ? 26 : (isSmallScreen ? 22 : 24),
    marginBottom: responsiveSize.margin.medium,
  },
  emptyDescription: {
    fontSize: responsiveSize.body,
    textAlign: 'center',
    color: '#666',
    lineHeight: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  },
  refreshControl: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
}); 