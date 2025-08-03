# EcoMind Authentication System Guide

A comprehensive React Context-based authentication system built on top of Supabase Auth, providing hooks, components, and utilities for managing authentication state throughout the application.

## Architecture Overview

The authentication system is built using React Context and custom hooks to provide a clean, type-safe, and performant authentication layer. It consists of four main parts:

1. **Authentication Context** (`context.tsx`) - Central state management
2. **Custom Hooks** (`hooks.tsx`) - Specialized authentication hooks
3. **Components & Guards** (`components.tsx`) - Route protection and UI components
4. **Supabase Integration** - Direct integration with Supabase Auth

## Quick Start

### 1. Setup AuthProvider

The `AuthProvider` is already integrated into the root layout (`src/app/layout.tsx`):

```tsx
import { AuthProvider } from '@/lib/auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Basic Usage

```tsx
import { useAuth, useUser } from '@/lib/auth';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  const { isAuthenticated } = useUser();

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

## Authentication Hooks

### Core Hooks

#### `useAuth()`
Main authentication hook providing complete auth state and actions.

```tsx
const {
  // State
  user,           // Current user object
  session,        // Current session
  loading,        // Loading state
  error,          // Error state
  
  // Actions
  signUp,         // Sign up function
  signIn,         // Sign in function
  signOut,        // Sign out function
  signInWithGoogle, // Google OAuth
  resetPassword,  // Password reset
  updateUser,     // Update user
  resendConfirmation, // Resend email verification
  
  // Utilities
  isAuthenticated,
  getUserProfile,
  hasCompletedOnboarding,
} = useAuth();
```

#### `useUser()`
Simplified hook focused on user information.

```tsx
const {
  user,           // Current user
  loading,        // Loading state
  error,          // Error state
  isAuthenticated // Boolean auth status
} = useUser();
```

#### `useSession()`
Session-focused hook for session management.

```tsx
const {
  session,        // Current session
  loading,        // Loading state
  error,          // Error state
  isAuthenticated // Boolean auth status
} = useSession();
```

### Specialized Hooks

#### `useUserProfile()`
Manages user profile data with automatic fetching.

```tsx
const {
  profile,        // User profile data
  loading,        // Loading state
  error,          // Error state
  refetch,        // Refetch function
  hasProfile      // Boolean profile status
} = useUserProfile();
```

#### `useOnboardingStatus()`
Tracks user onboarding completion status.

```tsx
const {
  completed,      // Onboarding completion status
  loading,        // Loading state
  error,          // Error state
  refetch,        // Refetch function
  needsOnboarding // Boolean onboarding requirement
} = useOnboardingStatus();
```

#### `useAuthActions()`
Authentication actions with built-in loading states and error handling.

```tsx
const {
  // Action functions
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  resetPassword,
  updateUser,
  resendConfirmation,
  
  // State
  loading,        // Current action loading
  error,          // Action error
  clearError,     // Clear error function
  
  // Specific loading states
  isSigningIn,
  isSigningUp,
  isSigningOut,
  isResettingPassword,
} = useAuthActions();
```

### Route Protection Hooks

#### `useRequireAuth()`
Redirect unauthenticated users to login.

```tsx
function ProtectedPage() {
  const { user, loading } = useRequireAuth('/auth/login');
  
  if (loading) return <div>Loading...</div>;
  
  return <div>Protected content for {user.email}</div>;
}
```

#### `useRequireGuest()`
Redirect authenticated users away from guest pages.

```tsx
function LoginPage() {
  const { isGuest, loading } = useRequireGuest('/dashboard');
  
  if (loading) return <div>Loading...</div>;
  
  return <div>Login form</div>;
}
```

### Utility Hooks

#### `useAuthPersistence()`
Check authentication persistence and rehydration state.

```tsx
const {
  isRehydrated,      // Auth state rehydrated from storage
  hasPersistedSession, // Session exists in storage
  hasPersistedUser,  // User exists in storage
  isReady           // Ready for use
} = useAuthPersistence();
```

#### `useAuthTiming()`
Track authentication session timing.

```tsx
const {
  sessionDuration,   // Current session duration in ms
  sessionStartTime,  // Session start timestamp
  formatDuration     // Function to format duration
} = useAuthTiming();
```

## Authentication Components

### Route Protection

#### `<ProtectedRoute>`
Wrapper component for protecting routes.

```tsx
<ProtectedRoute 
  redirectTo="/auth/login"
  requireOnboarding={true}
  onboardingRedirectTo="/onboarding"
  fallback={<Loading />}
>
  <DashboardContent />
</ProtectedRoute>
```

#### `<GuestRoute>`
Wrapper for guest-only routes.

```tsx
<GuestRoute 
  redirectTo="/dashboard"
  fallback={<Loading />}
>
  <LoginForm />
</GuestRoute>
```

### Conditional Rendering

#### `<AuthConditionalRender>`
Render content based on authentication state.

```tsx
<AuthConditionalRender when="authenticated">
  <UserDashboard />
</AuthConditionalRender>

<AuthConditionalRender when="unauthenticated" fallback={<Loading />}>
  <LoginPrompt />
</AuthConditionalRender>
```

Available conditions:
- `authenticated` - User is signed in
- `unauthenticated` - User is not signed in
- `loading` - Authentication state is loading
- `onboarded` - User has completed onboarding
- `not-onboarded` - User needs to complete onboarding

### UI Components

#### `<UserDisplay>`
Display user information with avatar and status.

```tsx
<UserDisplay 
  showEmail={true}
  showAvatar={true}
  showOnlineStatus={true}
  className="my-custom-class"
/>
```

#### `<AuthStatusIndicator>`
Visual authentication status indicator.

```tsx
<AuthStatusIndicator showText={true} className="status-bar" />
```

#### `<OnboardingStatusIndicator>`
Visual onboarding status indicator.

```tsx
<OnboardingStatusIndicator showText={true} className="onboarding-status" />
```

### Higher-Order Components (HOCs)

#### `withAuth()`
HOC for protecting components.

```tsx
const ProtectedComponent = withAuth(MyComponent, {
  redirectTo: '/auth/login',
  requireOnboarding: true,
  onboardingRedirectTo: '/onboarding'
});
```

#### `withGuest()`
HOC for guest-only components.

```tsx
const GuestComponent = withGuest(LoginComponent, {
  redirectTo: '/dashboard'
});
```

## Usage Patterns

### 1. Authentication Check

```tsx
import { useAuth } from '@/lib/auth';

function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}
```

### 2. Protected Dashboard

```tsx
import { ProtectedRoute, useUserProfile } from '@/lib/auth';

function Dashboard() {
  return (
    <ProtectedRoute requireOnboarding={true}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { profile, loading } = useUserProfile();
  
  if (loading) return <div>Loading profile...</div>;
  
  return (
    <div>
      <h1>Welcome, {profile?.business_name}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### 3. Login Form with Actions

```tsx
import { useAuthActions } from '@/lib/auth';

function LoginForm() {
  const {
    signIn,
    signInWithGoogle,
    loading,
    error,
    isSigningIn,
    clearError
  } = useAuthActions();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await signIn(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      
      <button type="submit" disabled={loading}>
        {isSigningIn ? 'Signing In...' : 'Sign In'}
      </button>
      
      <button 
        type="button" 
        onClick={signInWithGoogle}
        disabled={loading}
      >
        Sign In with Google
      </button>
    </form>
  );
}
```

### 4. Conditional Navigation

```tsx
import { useUser, AuthConditionalRender } from '@/lib/auth';

function Navigation() {
  return (
    <nav>
      <AuthConditionalRender when="authenticated">
        <AuthenticatedNav />
      </AuthConditionalRender>
      
      <AuthConditionalRender when="unauthenticated">
        <GuestNav />
      </AuthConditionalRender>
    </nav>
  );
}
```

### 5. Onboarding Flow

```tsx
import { useOnboardingStatus, ProtectedRoute } from '@/lib/auth';

function App() {
  return (
    <ProtectedRoute requireOnboarding={false}>
      <AppContent />
    </ProtectedRoute>
  );
}

function AppContent() {
  const { needsOnboarding, loading } = useOnboardingStatus();
  
  if (loading) return <div>Loading...</div>;
  
  return needsOnboarding ? <OnboardingFlow /> : <Dashboard />;
}
```

## Error Handling

The authentication system provides comprehensive error handling:

### Automatic Error Handling
- All authentication actions automatically handle errors
- Errors are transformed into user-friendly messages
- Loading states are managed automatically

### Manual Error Handling
```tsx
const { signIn, error, clearError } = useAuthActions();

const handleSignIn = async () => {
  const result = await signIn(email, password);
  
  if (result.error) {
    // Handle specific errors
    if (result.error.includes('Invalid login credentials')) {
      setCustomError('Please check your email and password');
    }
  }
};
```

## Performance Considerations

### Optimizations Included
- **Memoized callbacks** - All functions are memoized to prevent unnecessary re-renders
- **Selective subscriptions** - Hooks only subscribe to needed auth state changes
- **Memory leak prevention** - Automatic cleanup of auth listeners
- **Efficient re-renders** - Components only re-render when relevant auth state changes

### Best Practices
1. Use specific hooks (`useUser`, `useSession`) instead of `useAuth` when you only need partial state
2. Use `useAuthActions` for forms instead of calling auth functions directly
3. Implement proper loading states for better UX
4. Clear errors when appropriate using `clearError()`

## Testing

### Test Authentication State
```tsx
import { renderWithAuth } from '@/test-utils';

test('should display user email when authenticated', () => {
  const mockUser = { email: 'test@example.com' };
  
  render(
    <AuthProvider initialUser={mockUser}>
      <MyComponent />
    </AuthProvider>
  );
  
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
});
```

### Mock Authentication
```tsx
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    loading: false,
    signOut: jest.fn(),
  }),
}));
```

## Integration with Supabase

The system seamlessly integrates with Supabase Auth:

- **Automatic session management** - Sessions are automatically refreshed
- **Real-time auth state** - Changes sync across browser tabs
- **Secure token handling** - Tokens are managed securely
- **OAuth support** - Built-in Google OAuth support
- **Email verification** - Complete email verification flow

## Migration Guide

### From Direct Supabase Auth
```tsx
// Before
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.auth.signIn({
  email, password
});

// After
import { useAuthActions } from '@/lib/auth';
const { signIn } = useAuthActions();
await signIn(email, password);
```

### From Other Auth Libraries
The hooks-based approach makes migration straightforward:
1. Replace auth provider with `AuthProvider`
2. Replace auth hooks with EcoMind auth hooks
3. Update component logic to use new hook patterns
4. Add route protection using provided components

This authentication system provides a robust, type-safe, and developer-friendly foundation for managing authentication in the EcoMind application. 