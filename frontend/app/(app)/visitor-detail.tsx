import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, ViewStyle } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  Text, 
  Title, 
  Card, 
  IconButton, 
  Divider,
  useTheme,
} from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import { visitorAPI } from '../services/api';
import { colors, spacing, borderRadius } from '../../src/theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface VisitorDetailParams {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  signatureUrl?: string;
  signature_data?: string; // For direct base64 data
  photoUrl?: string;
}

export default function VisitorDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<Partial<VisitorDetailParams>>();
  
  // Format date and time for display
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Check if the signature is vector data
  const isVectorSignature = (data?: string): boolean => {
    if (!data) return false;
    try {
      const parsed = JSON.parse(data);
      return parsed && parsed.paths && Array.isArray(parsed.paths);
    } catch (e) {
      return false;
    }
  };

  // Render vector signature
  const renderVectorSignature = (data: string) => {
    try {
      const signature = JSON.parse(data);
      if (!signature.paths || !Array.isArray(signature.paths)) {
        throw new Error('Invalid vector signature format');
      }

      return (
        <Svg 
          style={styles.signatureImage as ViewStyle} 
          viewBox="0 0 300 150" 
          preserveAspectRatio="xMidYMid meet"
        >
          {signature.paths.map((path: any[], index: number) => {
            if (path.length < 2) return null;
            let d = `M${path[0].x},${path[0].y}`;
            for (let i = 1; i < path.length; i++) {
              d += ` L${path[i].x},${path[i].y}`;
            }
            return (
              <Path
                key={`path-${index}`}
                d={d}
                stroke={signature.lineColor || '#000000'}
                strokeWidth={signature.lineWidth || 2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </Svg>
      );
    } catch (error) {
      console.error('Error rendering vector signature:', error);
      return (
        <Text style={styles.errorText}>
          Error displaying signature
        </Text>
      );
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.white}
          size={24}
          onPress={handleBack}
          style={styles.backButton}
        />
        <Title style={styles.headerTitle}>Visitor Details</Title>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Visitor Info Card */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.visitorHeader}>
                {params.photoUrl ? (
                  <Image 
                    source={{ uri: params.photoUrl }} 
                    style={styles.visitorImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.visitorInitials, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.initialsText}>
                      {params.name ? params.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'NA'}
                    </Text>
                  </View>
                )}
                <View style={styles.visitorInfo}>
                  <Title style={styles.visitorName}>{params.name || 'N/A'}</Title>
                  <Text style={styles.visitorContact}>{params.email || 'No email'}</Text>
                  <Text style={styles.visitorContact}>{params.phone || 'No phone'}</Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Visit Details */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purpose of Visit:</Text>
                <Text style={styles.detailValue}>{params.purpose || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Check-in Time:</Text>
                <Text style={styles.detailValue}>{formatDateTime(params.checkInTime)}</Text>
              </View>

              {params.checkOutTime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Check-out Time:</Text>
                  <Text style={styles.detailValue}>{formatDateTime(params.checkOutTime)}</Text>
                </View>
              )}

              {/* Signature Section */}
              <View style={styles.signatureSection}>
                <Text style={[styles.detailLabel, { marginBottom: spacing.sm }]}>
                  Visitor's Signature:
                </Text>
                <View style={styles.signatureContainer}>
                  {(() => {
                    console.log('Rendering signature section with params:', {
                      hasSignatureUrl: !!params.signatureUrl,
                      hasSignatureData: !!params.signature_data,
                      signatureUrlType: params.signatureUrl ? 'present' : 'missing',
                      signatureDataType: params.signature_data ? 'present' : 'missing',
                      isVector: params.signature_data ? isVectorSignature(params.signature_data) : false
                    });

                    // Try to display signature from URL first (image only)
                    if (params.signatureUrl) {
                      const signatureUrl = params.signatureUrl.startsWith('data:') || params.signatureUrl.startsWith('http')
                        ? params.signatureUrl 
                        : `http://192.168.1.33:8000${params.signatureUrl.startsWith('/') ? '' : '/'}${params.signatureUrl}`;
                      
                      console.log('Attempting to load signature from URL:', signatureUrl);
                      
                      return (
                        <Image 
                          source={{ uri: signatureUrl }} 
                          style={styles.signatureImage}
                          resizeMode="contain"
                          onError={(e) => {
                            console.error('Failed to load signature from URL:', {
                              url: signatureUrl,
                              error: e.nativeEvent.error,
                              errorType: e.nativeEvent.error?.message || 'Unknown error'
                            });
                          }}
                          onLoad={() => console.log('Successfully loaded signature from URL')}
                        />
                      );
                    }
                    
                    // Handle signature data (could be vector or base64)
                    if (params.signature_data) {
                      // Check if it's a vector signature
                      if (isVectorSignature(params.signature_data)) {
                        console.log('Rendering vector signature');
                        return renderVectorSignature(params.signature_data);
                      }
                      
                      // Handle base64 image data
                      console.log('Attempting to load signature from base64 data, length:', 
                        params.signature_data.length);
                      
                      const signatureData = params.signature_data.startsWith('data:') 
                        ? params.signature_data 
                        : `data:image/png;base64,${params.signature_data}`;
                      
                      return (
                        <Image 
                          source={{ uri: signatureData }} 
                          style={styles.signatureImage}
                          resizeMode="contain"
                          onError={(e) => {
                            console.error('Failed to load signature from base64 data', {
                              dataLength: params.signature_data?.length,
                              dataStart: params.signature_data?.substring(0, 30),
                              error: e.nativeEvent.error,
                              errorType: e.nativeEvent.error?.message || 'Unknown error'
                            });
                          }}
                          onLoad={() => console.log('Successfully loaded signature from base64 data')}
                        />
                      );
                    }
                    
                    // No signature available
                    return (
                      <Text style={styles.noSignatureText}>
                        No signature available for this visit
                      </Text>
                    );
                  })()}
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    ...(isTablet ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : {}),
  },
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  visitorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  visitorInitials: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  visitorContact: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  divider: {
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.textSecondary,
  },
  signatureSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    minHeight: 150,
    justifyContent: 'center',
  },
  signatureImage: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 10,
  },
  noSignatureText: {
    color: colors.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
