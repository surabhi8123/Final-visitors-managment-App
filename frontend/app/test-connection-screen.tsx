import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { testConnection, getAlternativeUrls } from './config/api';

interface TestResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  response?: any;
  error?: string;
}

export default function TestConnectionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [lastWorkingUrl, setLastWorkingUrl] = useState<string | null>(null);

  const runTests = async () => {
    try {
      setIsTesting(true);
      setTestResults([]);
      setLastWorkingUrl(null);

      // Get all URLs to test
      const urls = [
        ...new Set([ // Remove duplicates
          ...getAlternativeUrls(),
          'http://10.0.2.2:8000/api',
          'http://localhost:8000/api',
          'http://192.168.1.29:8000/api',
          'http://127.0.0.1:8000/api',
        ].filter(Boolean)) // Remove any empty strings
      ];

      console.log('Testing URLs:', urls);

      for (const url of urls) {
        if (!url) continue;

        const cleanUrl = String(url).replace(/\/$/, ''); // Remove trailing slashes
        
        const result: TestResult = {
          url: cleanUrl,
          status: 'pending',
          message: 'Testing connection...',
          timestamp: new Date().toISOString(),
        };

        setTestResults(prev => [...prev, result]);

        try {
          const testUrl = `${cleanUrl}/test-connection/`;
          console.log(`Testing: ${testUrl}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const updatedResult: TestResult = {
              ...result,
              status: 'success',
              message: `Connected successfully (${response.status} ${response.statusText})`,
              response: data,
              timestamp: new Date().toISOString(),
            };
            
            setTestResults(prev => 
              prev.map(r => r.url === cleanUrl ? updatedResult : r)
            );
            
            setLastWorkingUrl(cleanUrl);
            console.log(`✅ Success: ${cleanUrl}`);
            break; // Stop testing after first successful connection
          } else {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Unknown error';
          console.error(`❌ Test failed for ${cleanUrl}:`, errorMessage);
          
          const updatedResult: TestResult = {
            ...result,
            status: 'error',
            message: `Failed: ${errorMessage}`,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          };
          
          setTestResults(prev => 
            prev.map(r => r.url === cleanUrl ? updatedResult : r)
          );
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Connection Tester
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
          Testing backend connectivity...
        </Text>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultCard, 
              { 
                borderLeftColor: getStatusColor(result.status),
                backgroundColor: theme.colors.surface,
              }
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={[styles.url, { color: theme.colors.text }]}>
                {result.url}
              </Text>
              <Text style={{ color: getStatusColor(result.status), fontWeight: 'bold' }}>
                {result.status.toUpperCase()}
              </Text>
            </View>
            <Text style={{ color: theme.colors.text }}>{result.message}</Text>
            
            {result.response && (
              <View style={styles.responseContainer}>
                <Text style={[styles.responseLabel, { color: theme.colors.primary }]}>
                  Response:
                </Text>
                <Text style={{ color: theme.colors.text }}>
                  {JSON.stringify(result.response, null, 2)}
                </Text>
              </View>
            )}
            
            {result.error && (
              <Text style={{ color: 'red', marginTop: 4 }}>
                Error: {result.error}
              </Text>
            )}
          </View>
        ))}

        {isTesting && testResults.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Testing connections, please wait...
            </Text>
          </View>
        )}

        {!isTesting && testResults.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={[styles.summaryText, { color: theme.colors.text }]}>
              {lastWorkingUrl 
                ? `✅ Found working connection at: ${lastWorkingUrl}`
                : '❌ Could not connect to any of the backend URLs.'}
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Run Tests Again"
                onPress={runTests}
                color={theme.colors.primary}
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="Go Back"
                onPress={() => router.back()}
                color={theme.colors.secondary}
              />
            </View>
            
            {lastWorkingUrl && (
              <View style={styles.fixInstructions}>
                <Text style={[styles.instructionsTitle, { color: theme.colors.primary }]}>
                  How to fix connection issues:
                </Text>
                <Text style={{ color: theme.colors.text, marginTop: 8 }}>
                  1. Make sure your backend server is running
                </Text>
                <Text style={{ color: theme.colors.text }}>
                  2. Check that the server is accessible from your device/emulator
                </Text>
                <Text style={{ color: theme.colors.text }}>
                  3. Verify that CORS is properly configured on the backend
                </Text>
                <Text style={{ color: theme.colors.text }}>
                  4. Ensure your device/emulator is on the same network as the server
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  url: {
    flex: 1,
    marginRight: 8,
  },
  responseContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  responseLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  summaryContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  summaryText: {
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonSpacer: {
    width: 16,
  },
  fixInstructions: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
