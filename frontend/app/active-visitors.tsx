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

const { width } = Dimensions.get('window');
const isTablet = width > 768;

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
            <View style={styles.statusBadge}>
              <Paragraph style={styles.statusText}>
                {item.status}
              </Paragraph>
            </View>
            <Paragraph style={styles.checkInTime}>
              <Text style={styles.boldText}>Check-in:</Text> {new Date(item.check_in_time).toLocaleTimeString()}
            </Paragraph>
            <Paragraph style={styles.duration}>
              <Text style={styles.boldText}>Duration:</Text> {item.duration_formatted}
            </Paragraph>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={() => handleCheckOut(item.id)}
          style={styles.checkOutButton}
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
        <ActivityIndicator size="large" />
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
    padding: isTablet ? 40 : 20,
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
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    marginBottom: 20,
    color: '#666',
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
    marginBottom: 15,
  },
  visitInfo: {
    flex: isTablet ? 1 : undefined,
  },
  visitTime: {
    flex: isTablet ? 0.5 : undefined,
    alignItems: isTablet ? 'flex-end' : 'flex-start',
    marginTop: isTablet ? 0 : 10,
  },
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitorPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
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
    color: '#666',
    fontSize: 20,
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
  statusBadge: {
    backgroundColor: '#4caf50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  checkInTime: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
  },
  duration: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    marginTop: 2,
  },
  checkOutButton: {
    marginTop: 10,
  },
}); 