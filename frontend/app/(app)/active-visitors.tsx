import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  useTheme,
} from 'react-native-paper';
import { visitorAPI } from '../services/api';
import { Visit } from '../../src/types';
import { colors, spacing, borderRadius, shadows, responsive } from '../../src/theme';
import { 
  LoadingView, 
  EmptyState, 
  SectionHeader, 
  VisitorCard 
} from '../../src/components';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const isMobile = width < 768;

export default function ActiveVisitorsScreen() {
  const theme = useTheme();
  const [visitors, setVisitors] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await visitorAPI.getActiveVisitors();
      setVisitors(response.active_visitors);
    } catch (error) {
      console.error('Error fetching active visitors:', error);
      Alert.alert('Error', 'Failed to load active visitors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveVisitors();
  }, [fetchActiveVisitors]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActiveVisitors();
    setRefreshing(false);
  }, [fetchActiveVisitors]);

  const handleCheckOut = useCallback(async (visitId: string) => {
    Alert.alert(
      'Check Out Visitor',
      'Are you sure you want to check out this visitor?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Check Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await visitorAPI.checkOut({ visit_id: visitId });
              Alert.alert('Success', 'Visitor checked out successfully');
              // Refresh the list
              fetchActiveVisitors();
            } catch (error) {
              console.error('Check out error:', error);
              Alert.alert('Error', 'Failed to check out visitor');
            }
          },
        },
      ]
    );
  }, [fetchActiveVisitors]);

  const renderVisitorItem = useCallback(({ item }: { item: Visit }) => (
    <VisitorCard
      visitor={item}
      onCheckOut={handleCheckOut}
      showActions={true}
    />
  ), [handleCheckOut]);

  const keyExtractor = useCallback((item: Visit) => item.id, []);

  const ListEmptyComponent = useCallback(() => (
    <EmptyState
      title="No Active Visitors"
      message="There are currently no visitors checked in"
      icon="account-off"
    />
  ), []);

  const refreshControl = useCallback(() => (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  ), [refreshing, onRefresh]);

  if (loading) {
    return <LoadingView message="Loading active visitors..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SectionHeader
        title="Active Visitors"
        subtitle={`${visitors.length} visitors currently checked in`}
      />

      {/* Visitors List */}
      <FlatList
        data={visitors}
        renderItem={renderVisitorItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        refreshControl={refreshControl()}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
}); 