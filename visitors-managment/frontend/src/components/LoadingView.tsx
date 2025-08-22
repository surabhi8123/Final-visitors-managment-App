import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme, Paragraph } from 'react-native-paper';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
  },
});

export const LoadingView = ({ message = 'Loading...' }: { message?: string }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Paragraph style={styles.loadingText}>{message}</Paragraph>
    </View>
  );
};

export default LoadingView;
