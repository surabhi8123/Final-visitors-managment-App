# Authentication Flow Documentation

## Overview

The app uses a centralized authentication system with Expo Router for navigation. The authentication flow is handled by two main components:

1. **AuthProvider** - Manages authentication state and provides auth methods
2. **AuthWrapper** - Handles navigation based on authentication state

## How It Works

### 1. App Startup
- `AuthProvider` checks for existing authentication tokens
- Sets `isAuthenticated`, `isLoading`, and `hasCheckedAuth` states
- `AuthWrapper` waits for `hasCheckedAuth = true` before making navigation decisions

### 2. Initial Navigation
- **If authenticated**: Redirects to `/(app)` (main app screens)
- **If not authenticated**: Redirects to `/login`

### 3. Login Process
- User enters credentials (`admin` / `admin123`)
- `AuthProvider.login()` validates credentials and stores tokens
- `isAuthenticated` changes from `false` to `true`
- `AuthWrapper` detects the state change and redirects to `/(app)`

### 4. Logout Process
- User triggers logout
- `AuthProvider.logout()` clears stored tokens
- `isAuthenticated` changes from `true` to `false`
- `AuthWrapper` detects the state change and redirects to `/login`

## Key Components

### AuthProvider (`contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}
```

### AuthWrapper (`_layout.tsx`)
```typescript
function AuthWrapper() {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth();
  const [lastAuthState, setLastAuthState] = useState<boolean | null>(null);

  useEffect(() => {
    if (hasCheckedAuth && !isLoading) {
      if (lastAuthState !== isAuthenticated) {
        const targetRoute = isAuthenticated ? '/(app)' : '/login';
        setLastAuthState(isAuthenticated);
        router.replace(targetRoute);
      }
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, lastAuthState]);

  return <RootStack />;
}
```

## State Management

### Authentication States
- `isAuthenticated`: Whether user is logged in
- `isLoading`: Whether auth operations are in progress
- `hasCheckedAuth`: Whether initial auth check is complete
- `lastAuthState`: Previous authentication state (for detecting changes)

### Navigation Logic
- **Loading**: Shows loading screen
- **Not checked**: Shows loading screen
- **Authenticated**: Redirects to `/(app)`
- **Not authenticated**: Redirects to `/login`

## Benefits of This Approach

1. **Centralized Navigation**: All auth-related navigation is handled in one place
2. **State Change Detection**: Only redirects when auth state actually changes
3. **No Stuck States**: Removed the problematic `hasRedirected` flag
4. **Clean Separation**: Auth logic and navigation logic are separate
5. **Predictable Behavior**: Clear flow from startup to login to app

## Troubleshooting

### App Stuck on Login Screen
- Check console logs for auth state changes
- Verify `isAuthenticated` is `true` after login
- Ensure `hasCheckedAuth` is `true`

### App Not Redirecting After Login
- Check that `lastAuthState` is different from current `isAuthenticated`
- Verify `isLoading` is `false`
- Check for any navigation errors in console

### Infinite Redirects
- Ensure `lastAuthState` is properly updated
- Check that auth state isn't changing repeatedly 