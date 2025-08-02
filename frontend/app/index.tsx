import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { testApiConnection, getApiUrl } from './services/api';
import { responsiveSize, lineHeight, layout } from '../src/utils/responsive';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isSmallScreen = width < 375;
const isMobile = width < 768;

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
      <View style={[styles.contentContainer, layout.flexible]}>
        <Title style={styles.title}>Visitor Management System</Title>
        <Paragraph style={styles.subtitle}>
          Manage visitor check-ins and check-outs efficiently
        </Paragraph>
        
        <View style={[styles.cardsContainer, layout.grid]}>
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
                  contentStyle={styles.cardButtonContent}
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
    padding: responsiveSize.padding.large,
    paddingBottom: isMobile ? 32 : 40,
    width: '100%',
  },
  contentContainer: {
    padding: isTablet ? 40 : (isSmallScreen ? 12 : 16),
    maxWidth: '100%',
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: responsiveSize.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: responsiveSize.margin.small,
    lineHeight: lineHeight.title,
  },
  subtitle: {
    fontSize: responsiveSize.subtitle,
    textAlign: 'center',
    marginBottom: isMobile ? 24 : 40,
    color: '#666',
    lineHeight: lineHeight.subtitle,
    paddingHorizontal: isMobile ? 8 : 0,
  },
  cardsContainer: {
    gap: responsiveSize.margin.large,
    width: '100%',
  },
  card: {
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  cardContent: {
    padding: isTablet ? 30 : (isSmallScreen ? 16 : 20),
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: responsiveSize.margin.large,
  },
  cardIcon: {
    fontSize: isTablet ? 40 : (isSmallScreen ? 28 : 30),
    marginBottom: responsiveSize.margin.small,
  },
  cardTitle: {
    fontSize: isTablet ? 20 : (isSmallScreen ? 16 : 18),
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: lineHeight.body,
  },
  cardDescription: {
    fontSize: responsiveSize.body,
    textAlign: 'center',
    color: '#666',
    marginBottom: responsiveSize.margin.large,
    lineHeight: lineHeight.body,
  },
  cardButton: {
    borderRadius: 8,
    paddingVertical: responsiveSize.padding.small,
    width: '100%',
  },
  cardButtonContent: {
    height: responsiveSize.buttonHeight,
  },
}); 