import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { router } from 'expo-router';
import { visitorAPI, testApiConnection } from '../services/api';
import { colors, spacing, borderRadius, shadows, responsive } from '../../src/theme';
import { LoadingView, EmptyState, SectionHeader, AuthGuard } from '../../src/components';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const isMobile = width < 768;

interface DashboardStats {
  totalVisitors: number;
  activeVisitors: number;
  todayVisits: number;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    activeVisitors: 0,
    todayVisits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('checking');
      
      // Fetch active visitors
      const activeResponse = await visitorAPI.getActiveVisitors();
      const activeVisitors = activeResponse.active_visitors.length;
      
      // Fetch visit history for today's count
      const today = new Date().toISOString().split('T')[0];
      const historyResponse = await visitorAPI.getVisitHistory({
        date_from: today,
        date_to: today,
      });
      
      // Calculate total visitors (active + estimated historical)
      const totalVisitors = activeVisitors + Math.floor(historyResponse.count * 0.3);
      
      setStats({
        totalVisitors,
        activeVisitors,
        todayVisits: historyResponse.count,
      });
      setConnectionStatus('connected');
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please check your connection and try again.');
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const navigateToScreen = (screen: string) => {
    router.push(screen);
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      setConnectionStatus('checking');
      const result = await testApiConnection();
      if (result.success) {
        console.log('✅ Backend connection successful!');
        console.log('📍 Working URL:', result.workingUrl);
        setConnectionStatus('connected');
        // If connection is successful, try to fetch dashboard data
        await fetchDashboardData();
      } else {
        console.log('❌ Backend connection failed!');
        setConnectionStatus('disconnected');
        setError(result.error || 'Cannot connect to backend server. Please check if the server is running.');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setConnectionStatus('disconnected');
      setError('Connection test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingView message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconButton
            icon="wifi-off"
            size={48}
            iconColor={colors.error}
          />
          <Title style={styles.errorTitle}>Connection Error</Title>
          <Paragraph style={styles.errorMessage}>{error}</Paragraph>
          <Button
            mode="contained"
            onPress={fetchDashboardData}
            style={styles.retryButton}
            icon="refresh"
          >
            Retry
          </Button>
          <Button
            mode="outlined"
            onPress={testConnection}
            style={styles.testButton}
            icon="wifi"
          >
            Test Connection
          </Button>
        </View>
      </View>
    );
  }

  return (
    <AuthGuard>
      <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header section removed as per request */}
      

             {/* Stats Cards */}
       <View style={styles.statsContainer}>
         <View style={styles.statsRow}>
           <Card style={styles.statCard}>
             <Card.Content style={styles.statContent}>
               <View style={styles.statIcon}>
                 <IconButton
                   icon="account-group"
                   size={isTablet ? 32 : 24}
                   iconColor={colors.primary}
                 />
               </View>
               <Title style={styles.statNumber}>{stats.totalVisitors}</Title>
               <Paragraph style={styles.statLabel}>Total Visitors</Paragraph>
             </Card.Content>
           </Card>

           <Card style={styles.statCard}>
             <Card.Content style={styles.statContent}>
               <View style={styles.statIcon}>
                 <IconButton
                   icon="account-check"
                   size={isTablet ? 32 : 24}
                   iconColor={colors.success}
                 />
               </View>
               <Title style={styles.statNumber}>{stats.activeVisitors}</Title>
               <Paragraph style={styles.statLabel}>Active Visitors</Paragraph>
             </Card.Content>
           </Card>
         </View>

         <View style={styles.statsRow}>
           <Card style={styles.statCard}>
             <Card.Content style={styles.statContent}>
               <View style={styles.statIcon}>
                 <IconButton
                   icon="calendar-today"
                   size={isTablet ? 32 : 24}
                   iconColor={colors.info}
                 />
               </View>
               <Title style={styles.statNumber}>{stats.todayVisits}</Title>
               <Paragraph style={styles.statLabel}>Today's Visits</Paragraph>
             </Card.Content>
           </Card>
         </View>
       </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content style={styles.actionsContent}>
          <Title style={styles.actionsTitle}>Quick Actions</Title>
          
                     <View style={styles.actionsGrid}>
             <Button
               mode="contained"
               onPress={() => navigateToScreen('check-in')}
               style={styles.actionButton}
               contentStyle={styles.actionButtonContent}
               icon="account-plus"
             >
               Check In
             </Button>

             <Button
               mode="outlined"
               onPress={() => navigateToScreen('active-visitors')}
               style={styles.actionButton}
               contentStyle={styles.actionButtonContent}
               icon="account-group"
             >
               Active Visitors
             </Button>

             <Button
               mode="outlined"
               onPress={() => navigateToScreen('history')}
               style={styles.actionButton}
               contentStyle={styles.actionButtonContent}
               icon="history"
             >
               Visit History
             </Button>
           </View>
          
          {error && (
            <View style={styles.offlineNotice}>
              <Paragraph style={styles.offlineText}>
                ⚠️ Offline mode - Some features may be limited
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      
    </ScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  statsContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  statContent: {
    alignItems: 'center',
    padding: responsive.cardPadding,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: responsive.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: responsive.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  actionsContent: {
    padding: responsive.cardPadding,
  },
  actionsTitle: {
    fontSize: responsive.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: isTablet ? '48%' : '100%',
    marginBottom: spacing.md,
    borderRadius: borderRadius.sm,
  },
     actionButtonContent: {
     height: responsive.buttonHeight,
   },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: responsive.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: responsive.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: responsive.fontSize.md * 1.5,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  testButton: {
    marginTop: spacing.sm,
    borderColor: colors.info,
    borderRadius: borderRadius.sm,
  },
  offlineNotice: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.warningLight + '20',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  offlineText: {
    fontSize: responsive.fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
  },
}); 