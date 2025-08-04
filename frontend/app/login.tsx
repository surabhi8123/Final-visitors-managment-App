import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { useAuth } from './contexts/AuthContext';
import { colors, spacing, borderRadius, shadows, responsive } from '../src/theme';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isSmallScreen = width < 375;
const isMobile = width < 768;

export default function LoginScreen() {
  const theme = useTheme();
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(formData.username, formData.password);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid username or password. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear authentication error when user starts typing
    if (error) {
      clearError();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
                         <View style={styles.logoContainer}>
               <View style={styles.logo}>
                                   <View style={styles.logoFallback}>
                    <Title style={styles.logoText}>TS</Title>
                  </View>
               </View>
             </View>
            <Title style={styles.title}>ThorSignia Visitor Management</Title>
            <Paragraph style={styles.subtitle}>
              Secure access to visitor management system
            </Paragraph>
          </View>

          {/* Login Form */}
          <Card style={styles.loginCard}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.formTitle}>Admin Login</Title>
              
              <TextInput
                label="Username"
                value={formData.username}
                onChangeText={(value: string) => handleInputChange('username', value)}
                placeholder="Enter your username"
                error={!!errors.username}
                autoCapitalize="none"
                autoCorrect={false}
                disabled={isLoading}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username}
              </HelperText>

              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value: string) => handleInputChange('password', value)}
                placeholder="Enter your password"
                error={!!errors.password}
                secureTextEntry
                disabled={isLoading}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              {/* Authentication Error */}
              {error && (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                icon="login"
              >
                Sign In
              </Button>
            </Card.Content>
          </Card>

          {/* Footer */}
                     <View style={styles.footer}>
             <Paragraph style={styles.footerText}>
               © 2025 ThorSignia Visitor Management System
             </Paragraph>
           </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: responsive.padding.lg,
    paddingVertical: responsive.padding.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logo: {
    width: isTablet ? 120 : 96,
    height: isTablet ? 120 : 96,
    borderRadius: isTablet ? 60 : 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  logoFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: isTablet ? 60 : 48,
  },
  logoText: {
    color: colors.white,
    fontSize: isTablet ? 32 : 24,
    fontWeight: '700',
  },
  title: {
    fontSize: responsive.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: responsive.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: responsive.fontSize.md * 1.5,
  },
  loginCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    marginBottom: spacing.xl,
  },
  cardContent: {
    padding: responsive.cardPadding,
  },
  formTitle: {
    fontSize: responsive.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  loginButtonContent: {
    height: responsive.buttonHeight,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: responsive.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
}); 