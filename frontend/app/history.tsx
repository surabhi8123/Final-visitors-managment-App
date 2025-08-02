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
  TextInput,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { visitorAPI } from './services/api';
import { Visit, VisitHistoryFilters } from '../src/types';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function HistoryScreen() {
  const theme = useTheme();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<VisitHistoryFilters>({});
  const [exporting, setExporting] = useState(false);

  const fetchVisitHistory = async () => {
    try {
      const response = await visitorAPI.getVisitHistory(filters);
      setVisits(response.visits);
    } catch (error) {
      console.error('Error fetching visit history:', error);
      Alert.alert('Error', 'Failed to load visit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitHistory();
  }, [filters]);

  const handleFilterChange = (field: keyof VisitHistoryFilters, value: string) => {
    setFilters((prev: VisitHistoryFilters) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await visitorAPI.exportVisitHistory(filters);
      Alert.alert('Success', 'Visit history exported successfully!');
    } catch (error) {
      console.error('Error exporting visit history:', error);
      Alert.alert('Error', 'Failed to export visit history');
    } finally {
      setExporting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVisitHistory();
    setRefreshing(false);
  };

  const renderVisitItem = ({ item }: { item: Visit }) => (
    <Card style={styles.visitCard}>
      <Card.Content>
        <View style={styles.visitHeader}>
          <View style={styles.visitInfo}>
            <View style={styles.visitorHeader}>
              {item.photos && item.photos.length > 0 ? (
                <Image 
                  source={{ uri: item.photos[0].image }} 
                  style={styles.visitorPhoto}
                />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Title style={styles.placeholderText}>
                    {item.visitor_name.charAt(0).toUpperCase()}
                  </Title>
                </View>
              )}
              <View style={styles.visitorDetails}>
                <Title style={styles.visitorName}>{item.visitor_name}</Title>
                <Paragraph style={styles.visitorContact}>
                  📧 {item.visitor_email}
                </Paragraph>
                <Paragraph style={styles.visitorContact}>
                  📞 {item.visitor_phone}
                </Paragraph>
              </View>
            </View>
            
            <View style={styles.visitDetails}>
              <Paragraph style={styles.visitPurpose}>
                🎯 <Text style={styles.boldText}>Purpose:</Text> {item.purpose}
              </Paragraph>
              {item.host_name && (
                <Paragraph style={styles.hostName}>
                  👤 <Text style={styles.boldText}>Host:</Text> {item.host_name}
                </Paragraph>
              )}
            </View>
          </View>
          
          <View style={styles.visitTime}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === 'Checked In' ? '#4caf50' : '#ff9800' }
            ]}>
              <Paragraph style={styles.statusText}>
                {item.status}
              </Paragraph>
            </View>
            <Paragraph style={styles.checkInTime}>
              <Text style={styles.boldText}>Check-in:</Text> {new Date(item.check_in_time).toLocaleString()}
            </Paragraph>
            {item.check_out_time && (
              <Paragraph style={styles.checkOutTime}>
                <Text style={styles.boldText}>Check-out:</Text> {new Date(item.check_out_time).toLocaleString()}
              </Paragraph>
            )}
            <Paragraph style={styles.duration}>
              <Text style={styles.boldText}>Duration:</Text> {item.duration_formatted}
            </Paragraph>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Title style={styles.title}>Visit History</Title>
        <Paragraph style={styles.subtitle}>
          Complete record of all visits ({visits.length} total)
        </Paragraph>

        <Card style={styles.filtersCard}>
          <Card.Content>
            <Title style={styles.filtersTitle}>Search & Filter</Title>
            
            <View style={styles.filtersRow}>
              <TextInput
                label="Name"
                value={filters.name || ''}
                onChangeText={(text) => handleFilterChange('name', text)}
                style={[styles.filterInput, styles.halfInput]}
                mode="outlined"
              />
              <TextInput
                label="Email"
                value={filters.email || ''}
                onChangeText={(text) => handleFilterChange('email', text)}
                style={[styles.filterInput, styles.halfInput]}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.filtersRow}>
              <TextInput
                label="Phone"
                value={filters.phone || ''}
                onChangeText={(text) => handleFilterChange('phone', text)}
                style={[styles.filterInput, styles.halfInput]}
                mode="outlined"
                keyboardType="phone-pad"
              />
              <TextInput
                label="Date From (YYYY-MM-DD)"
                value={filters.date_from || ''}
                onChangeText={(text) => handleFilterChange('date_from', text)}
                style={[styles.filterInput, styles.halfInput]}
                mode="outlined"
                placeholder="2024-01-01"
              />
            </View>

            <View style={styles.filtersRow}>
              <TextInput
                label="Date To (YYYY-MM-DD)"
                value={filters.date_to || ''}
                onChangeText={(text) => handleFilterChange('date_to', text)}
                style={[styles.filterInput, styles.halfInput]}
                mode="outlined"
                placeholder="2024-12-31"
              />
              <View style={[styles.filterInput, styles.halfInput]} />
            </View>

            <View style={styles.filterButtons}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.filterButton}
              >
                Clear Filters
              </Button>
              <Button
                mode="contained"
                onPress={handleExport}
                loading={exporting}
                disabled={exporting}
                style={styles.filterButton}
              >
                Export CSV
              </Button>
            </View>
          </Card.Content>
        </Card>

        {visits.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title style={styles.emptyTitle}>No Visits Found</Title>
              <Paragraph style={styles.emptyDescription}>
                No visits match your current filters.
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={visits}
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
    padding: isTablet ? 40 : 20,
    maxWidth: isTablet ? 1000 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    marginBottom: 20,
    color: '#666',
  },
  filtersCard: {
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: isTablet ? 20 : 18,
    marginBottom: 15,
  },
  filtersRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 15,
    marginBottom: 15,
  },
  filterInput: {
    marginBottom: 0,
  },
  halfInput: {
    flex: isTablet ? 1 : undefined,
  },
  filterButtons: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 10,
  },
  filterButton: {
    flex: isTablet ? 1 : undefined,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: isTablet ? 20 : 18,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  visitCard: {
    marginBottom: 15,
  },
  visitHeader: {
    flexDirection: isTablet ? 'row' : 'column',
    justifyContent: 'space-between',
  },
  visitInfo: {
    flex: isTablet ? 1 : undefined,
  },
  visitorHeader: {
    flexDirection: isTablet ? 'row' : 'column',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitorPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#e0e0e0',
  },
  placeholderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#888',
  },
  visitorDetails: {
    flex: 1,
  },
  visitorName: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  visitorContact: {
    fontSize: isTablet ? 16 : 14,
    marginBottom: 2,
  },
  visitDetails: {
    marginTop: 10,
  },
  visitPurpose: {
    fontSize: isTablet ? 16 : 14,
    fontStyle: 'italic',
    marginTop: 5,
  },
  hostName: {
    fontSize: isTablet ? 16 : 14,
    fontStyle: 'italic',
    marginTop: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  visitTime: {
    flex: isTablet ? 0.5 : undefined,
    alignItems: isTablet ? 'flex-end' : 'flex-start',
    marginTop: isTablet ? 0 : 10,
  },
  statusBadge: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
    color: 'white',
  },
  checkInTime: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
  },
  checkOutTime: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    marginTop: 2,
  },
  duration: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    marginTop: 2,
  },
}); 