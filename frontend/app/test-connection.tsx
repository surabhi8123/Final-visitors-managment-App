import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { get } from '../src/utils/api';

const TestConnectionScreen = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const addTestResult = (testName: string, status: 'success' | 'error' | 'skipped', message: string, details?: any) => {
    setTestResults(prev => [
      ...prev,
      {
        testName,
        status,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const testApiConnection = async () => {
    try {
      setIsLoading(true);
      
      // Test 1: Direct fetch to test endpoint
      try {
        const response = await fetch('http://192.168.1.29:8000/api/visitors/test-connection/');
        const data = await response.json();
        addTestResult(
          'Direct Fetch to Backend',
          'success',
          'Successfully connected to backend',
          data
        );
      } catch (error: any) {
        addTestResult(
          'Direct Fetch to Backend',
          'error',
          'Failed to connect directly to backend',
          error?.message || 'Unknown error occurred'
        );
      }

      // Test 2: Using API utility with token
      if (token) {
        try {
          const data = await get('/visitors/test-connection/', token);
          addTestResult(
            'API Utility with Token',
            'success',
            'Successfully used API utility with token',
            data
          );
        } catch (error: any) {
          addTestResult(
            'API Utility with Token',
            'error',
            'Failed to use API utility with token',
            error?.message || 'Unknown error occurred'
          );
        }
      } else {
        addTestResult(
          'API Utility with Token',
          'skipped',
          'No token available, skipping token test'
        );
      }

    } catch (error: any) {
      addTestResult(
        'Test Execution',
        'error',
        'Error running tests',
        error?.message || 'Unknown error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'skipped':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Test</Text>
      
      {isLoading ? (
        <Text>Running tests...</Text>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          {testResults.map((test, index) => (
            <View key={index} style={[styles.testCard, { borderLeftColor: getStatusColor(test.status) }]}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{test.testName}</Text>
                <Text style={[styles.testStatus, { color: getStatusColor(test.status) }]}>
                  {test.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.testMessage}>{test.message}</Text>
              {test.details && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Details:</Text>
                  <Text style={styles.detailsText}>
                    {typeof test.details === 'string' 
                      ? test.details 
                      : JSON.stringify(test.details, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  testStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  testMessage: {
    color: '#333',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
  },
  detailsTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
  },
  detailsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});

export default TestConnectionScreen;
