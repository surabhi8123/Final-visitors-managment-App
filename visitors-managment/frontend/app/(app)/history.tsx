import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  Share,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  useTheme,
  Menu,
  Button,
  Text,
  Divider,
} from 'react-native-paper';
import { visitorAPI } from '../services/api';
import { Visit } from '../../src/types';

type TimeFilterDates = {
  dateFrom: string;
  dateTo: string;
};
import { 
  colors, 
  spacing, 
  borderRadius, 
  shadows, 
  responsive, 
  isTablet, 
  isMobile,
  isSmallScreen,
  responsiveSpacing,
  layoutPatterns,
  getResponsiveSpacing,
} from '../../src/theme';
import { exportVisitorsToPDF } from '../utils/pdfExport';
import { exportVisitorHistoryDocx } from '../utils/docxExport';
import { exportVisitorHistoryCSV } from '../utils/csvExport';
import { 
  LoadingView, 
  EmptyState, 
  SectionHeader, 
  VisitorCard,
  FilterCard,
  EnhancedButton,
  AuthGuard
} from '../../src/components';

const { width, height } = Dimensions.get('window');

export default function HistoryScreen() {
  const theme = useTheme();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async (format: 'pdf' | 'csv') => {
    try {
      // Show loading indicator
      setLoading(true);
      
      // Fetch fresh data with current filters
      const timeFilterDates = timeFilter !== 'all' 
        ? getTimeFilterDates(timeFilter) 
        : { dateFrom: '', dateTo: '' };
      
      const apiFilters: { date_from?: string; date_to?: string } = {};
      if (timeFilterDates.dateFrom) apiFilters.date_from = timeFilterDates.dateFrom;
      if (timeFilterDates.dateTo) apiFilters.date_to = timeFilterDates.dateTo;
      
      const response = await visitorAPI.getVisitHistory(apiFilters);
      const visitsToExport = response?.visits || [];
      
      if (visitsToExport.length === 0) {
        Alert.alert('No Data', 'No visitors to export for the selected filters.');
        return;
      }

      if (format === 'pdf') {
        await exportVisitorsToPDF({
          visitors: visitsToExport,
          title: 'ThorSignia Visitor History',
          onSuccess: (filePath) => {
            console.log('PDF exported successfully:', filePath);
          },
          onError: (error) => {
            console.error('PDF export error:', error);
            Alert.alert('Error', 'Failed to export visitor history. Please try again.');
          },
        });
      } else {
        await exportVisitorHistoryCSV({
          visitors: visitsToExport,
          title: 'ThorSignia Visitor History',
          onSuccess: (filePath) => {
            console.log('CSV exported successfully:', filePath);
          },
          onError: (error) => {
            console.error('CSV export error:', error);
            Alert.alert('Error', 'Failed to export visitor history. Please try again.');
          },
        });
      }
    } catch (error) {
      console.error(`Error in handleExport (${format}):`, error);
      Alert.alert('Error', 'An unexpected error occurred during export.');
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  const fetchVisitHistory = useCallback(async () => {
    try {
      setError(null);

      console.log('🔍 Fetching visit history with time filter:', { timeFilter, sortBy });
      
      // Get time filter dates if applicable
      const timeFilterDates = timeFilter !== 'all' 
        ? getTimeFilterDates(timeFilter) 
        : { dateFrom: '', dateTo: '' };
      
      // Convert filter names to match API expectations
      const apiFilters: { date_from?: string; date_to?: string } = {};
      
      if (timeFilterDates.dateFrom) apiFilters.date_from = timeFilterDates.dateFrom;
      if (timeFilterDates.dateTo) apiFilters.date_to = timeFilterDates.dateTo;
      
      console.log('📡 API filters:', apiFilters);
      const response = await visitorAPI.getVisitHistory(apiFilters);
      console.log('✅ Visit history response:', response);
      
      if (response && response.visits) {
        // Sort the visits based on the selected sort option
        const sortedVisits = sortVisits(response.visits, sortBy);
        setVisits(sortedVisits);
        console.log('📊 Sorted visits:', sortedVisits.length);
      } else {
        console.warn('⚠️ No visits data in response:', response);
        setVisits([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching visit history:', error);
      setError(error.message || 'Failed to load visit history');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [timeFilter, sortBy]);

  useEffect(() => {
    fetchVisitHistory();
  }, [fetchVisitHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVisitHistory();
    setRefreshing(false);
  }, [fetchVisitHistory]);

  const getTimeFilterDates = useCallback((filter: string): TimeFilterDates => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          dateFrom: today.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0]
        };
      case 'thisWeek': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          dateFrom: startOfWeek.toISOString().split('T')[0],
          dateTo: endOfWeek.toISOString().split('T')[0]
        };
      }
      case 'thisMonth': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          dateFrom: startOfMonth.toISOString().split('T')[0],
          dateTo: endOfMonth.toISOString().split('T')[0]
        };
      }
      default:
        return { dateFrom: '', dateTo: '' };
    }
  }, []);

  const sortVisits = useCallback((visits: Visit[], sortType: string) => {
    const sortedVisits = [...visits];
    sortedVisits.sort((a, b) => {
      const dateA = new Date(a.check_in_time).getTime();
      const dateB = new Date(b.check_in_time).getTime();
      return sortType === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sortedVisits;
  }, []);

  const renderVisitItem = useCallback(({ item }: { item: Visit }) => (
    <VisitorCard
      visitor={item}
      showActions={false}
    />
  ), []);

  const keyExtractor = useCallback((item: Visit) => item.id, []);

  const ListEmptyComponent = useCallback(() => {
    if (error) {
      return (
        <EmptyState
          title="Error Loading Data"
          message={error}
          icon="alert-circle"
        />
      );
    }
    
    return (
      <EmptyState
        title="No Visit History"
        message="No visit history found matching your filters"
        icon="history"
      />
    );
  }, [error]);

  const refreshControl = useCallback(() => (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  ), [refreshing, onRefresh]);

  const getTimeFilterLabel = useCallback((filter: string) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      default: return 'All Time';
    }
  }, []);

  const getSortLabel = useCallback((sort: string) => {
    return sort === 'newest' ? 'Newest → Oldest' : 'Oldest → Newest';
  }, []);

  if (loading) {
    return <LoadingView message="Loading visit history..." />;
  }

  return (
    <AuthGuard>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <SectionHeader
              title="Visit History"
              subtitle={`${visits.length} visits found`}
            />
            {/* Export button has been moved to the main content area */}
          </View>

          {/* Quick Filters Section */}
          <FilterCard title="Quick Filters">
            <View style={styles.quickFiltersContainer}>
              {/* Filter Dropdown */}
              <View style={styles.dropdownWrapper}>
                <Menu
                  visible={filterMenuVisible}
                  onDismiss={() => setFilterMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setFilterMenuVisible(true)}
                      icon="filter-variant"
                      style={styles.dropdownButton}
                      contentStyle={styles.dropdownButtonContent}
                      labelStyle={styles.dropdownButtonLabel}
                    >
                      {getTimeFilterLabel(timeFilter)}
                    </Button>
                  }
                >
                  <Menu.Item 
                    onPress={() => {
                      setTimeFilter('all');
                      setFilterMenuVisible(false);
                    }} 
                    title="All Time" 
                  />
                  <Menu.Item 
                    onPress={() => {
                      setTimeFilter('today');
                      setFilterMenuVisible(false);
                    }} 
                    title="Today" 
                  />
                  <Menu.Item 
                    onPress={() => {
                      setTimeFilter('thisWeek');
                      setFilterMenuVisible(false);
                    }} 
                    title="This Week" 
                  />
                  <Menu.Item 
                    onPress={() => {
                      setTimeFilter('thisMonth');
                      setFilterMenuVisible(false);
                    }} 
                    title="This Month" 
                  />
                </Menu>
              </View>

              {/* Sort Dropdown */}
              <View style={styles.dropdownWrapper}>
                <Menu
                  visible={sortMenuVisible}
                  onDismiss={() => setSortMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setSortMenuVisible(true)}
                      icon="sort"
                      style={styles.dropdownButton}
                      contentStyle={styles.dropdownButtonContent}
                      labelStyle={styles.dropdownButtonLabel}
                    >
                      {getSortLabel(sortBy)}
                    </Button>
                  }
                >
                  <Menu.Item 
                    onPress={() => {
                      setSortBy('newest');
                      setSortMenuVisible(false);
                    }} 
                    title="Newest → Oldest" 
                  />
                  <Menu.Item 
                    onPress={() => {
                      setSortBy('oldest');
                      setSortMenuVisible(false);
                    }} 
                    title="Oldest → Newest" 
                  />
                </Menu>
              </View>
            </View>
          </FilterCard>

          {/* Export Button */}
          <View style={styles.exportContainer}>
            <EnhancedButton
              mode="contained"
              onPress={() => handleExport('csv')}
              style={styles.exportButton}
              icon="file-document-outline"
              compact={isMobile}
              loading={loading}
              disabled={loading || visits.length === 0}
            >
              Export CSV
            </EnhancedButton>
          </View>

          {/* Results Section */}
          <View style={styles.resultsContainer}>
            <FlatList
              data={visits}
              renderItem={renderVisitItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContainer}
              refreshControl={refreshControl()}
              ListEmptyComponent={ListEmptyComponent}
              showsVerticalScrollIndicator={false}
              numColumns={isTablet ? 2 : 1}
              columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
              scrollEnabled={false} // Disable scroll since we're in a ScrollView
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'column',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  exportButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  exportButton: {
    marginLeft: spacing.sm,
  },
  exportButtonLabel: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getResponsiveSpacing(spacing.xxl),
  },
  quickFiltersContainer: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: getResponsiveSpacing(spacing.md),
    marginBottom: getResponsiveSpacing(spacing.sm),
  },
  dropdownWrapper: {
    flex: isTablet ? 1 : undefined,
    minWidth: isTablet ? 200 : undefined,
  },
  dropdownButton: {
    borderRadius: borderRadius.sm,
    borderColor: colors.border,
    width: '100%',
  },
  dropdownButtonContent: {
    height: responsive.buttonHeight,
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing(spacing.md),
  },
  dropdownButtonLabel: {
    fontSize: responsive.fontSize.md,
    fontWeight: '500',
  },
  exportContainer: {
    marginTop: getResponsiveSpacing(spacing.md),
    marginBottom: getResponsiveSpacing(spacing.md),
  },
  exportButton: {
    width: '100%',
  },
  resultsContainer: {
    flex: 1,
    marginTop: getResponsiveSpacing(spacing.md),
  },
  listContainer: {
    padding: getResponsiveSpacing(spacing.md),
    paddingBottom: getResponsiveSpacing(spacing.xl),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: getResponsiveSpacing(spacing.md),
  },
}); 