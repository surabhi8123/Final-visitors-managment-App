import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { testApiConnection, getApiUrl } from './services/api';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function Dashboard() {
  const theme = useTheme();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);

  const navigationCards = [
    {
      title: 'Check In Visitor',
      description: 'Register new visitors and capture their photos',
      route: '/check-in',
      icon: '👤',
      color: '#2196F3',
    },
    {
      title: 'Active Visitors',
      description: 'View and manage currently checked-in visitors',
      route: '/active-visitors',
      icon: '📋',
      color: '#4CAF50',
    },
    {
      title: 'Visit History',
      description: 'Browse complete visit records and export data',
      route: '/history',
      icon: '📊',
      color: '#FF9800',
    },
  ];

  const testConnection = async () => {
    setTesting(true);
    try {
      const connected = await testApiConnection();
      setIsConnected(connected);
      if (connected) {
        Alert.alert('Success', 'Backend connection successful!');
      } else {
        Alert.alert('Error', 'Cannot connect to backend. Check if Django server is running.');
      }
    } catch (error) {
      setIsConnected(false);
      Alert.alert('Error', 'Connection test failed. Check your network and backend server.');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Test connection on app start (silently in background)
    testConnection();
    
    // Debug: Log card information
    console.log('Dashboard loaded with', navigationCards.length, 'cards:');
    navigationCards.forEach((card, index) => {
      console.log(`Card ${index + 1}: ${card.title} (${card.icon})`);
    });
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentContainer}>
        <Title style={styles.title}>Visitor Management System</Title>
        <Paragraph style={styles.subtitle}>
          Manage visitor check-ins and check-outs efficiently
        </Paragraph>
        
        <View style={styles.cardsContainer}>
          {navigationCards.map((card, index) => (
            <Card
              key={index}
              style={[styles.card, { borderLeftColor: card.color, borderLeftWidth: 4 }]}
              onPress={() => router.push(card.route)}
              mode="elevated"
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Title style={[styles.cardIcon, { color: card.color }]}>
                    {card.icon}
                  </Title>
                  <Title style={styles.cardTitle}>{card.title}</Title>
                </View>
                <Paragraph style={styles.cardDescription}>
                  {card.description}
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => router.push(card.route)}
                  style={[styles.cardButton, { backgroundColor: card.color }]}
                >
                  Open {card.title}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
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
    maxWidth: isTablet ? 1000 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  cardsContainer: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 20,
  },
  card: {
    flex: isTablet ? 1 : undefined,
    marginBottom: isTablet ? 0 : 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardContent: {
    padding: isTablet ? 30 : 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: isTablet ? 40 : 30,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  cardButton: {
    borderRadius: 8,
    paddingVertical: 10,
  },
}); 