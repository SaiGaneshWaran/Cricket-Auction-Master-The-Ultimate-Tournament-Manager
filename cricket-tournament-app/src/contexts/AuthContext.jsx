// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getFromStorage, saveToStorage, removeFromStorage } from '../utils/storage';
import { generateUniqueId } from '../utils/helpers';

// Create context
const AuthContext = createContext();

// Storage keys
const AUTH_STORAGE_KEY = 'cricket_app_auth';
const USER_STORAGE_KEY = 'cricket_app_user';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  
  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Load auth data from storage
        const storedAuth = getFromStorage(AUTH_STORAGE_KEY);
        const storedUser = getFromStorage(USER_STORAGE_KEY);
        
        if (storedAuth && storedAuth.token && storedUser) {
          // Check token expiration
          const now = new Date();
          const expirationDate = new Date(storedAuth.expiresAt);
          
          if (expirationDate > now) {
            // Token is still valid
            setAuthToken(storedAuth.token);
            setCurrentUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Token expired, clean up
            removeFromStorage(AUTH_STORAGE_KEY);
            removeFromStorage(USER_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Register a new user
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For now, we'll simulate a successful registration
      const userId = generateUniqueId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      // Create user object
      const newUser = {
        id: userId,
        ...userData,
        createdAt: now.toISOString()
      };
      
      // Create auth token
      const token = `auth_token_${generateUniqueId(32)}`;
      const authData = {
        token,
        expiresAt: expiresAt.toISOString()
      };
      
      // Save to storage
      saveToStorage(USER_STORAGE_KEY, newUser);
      saveToStorage(AUTH_STORAGE_KEY, authData);
      
      // Update state
      setCurrentUser(newUser);
      setAuthToken(token);
      setIsAuthenticated(true);
      
      toast.success('Account created successfully!');
      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Login user
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would validate credentials against an API
      // For this demo, we'll simulate authentication with mock data
      
      // Simulated validation (in a real app, this would be server-side)
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // For demonstration purposes only - not for production use
      const mockUsers = [
        {
          id: 'admin123',
          email: 'admin@example.com',
          password: 'password123', // In a real app, passwords would be hashed
          name: 'Admin User',
          role: 'admin',
          createdAt: '2023-01-01T00:00:00Z'
        },
        {
          id: 'captain123',
          email: 'captain@example.com',
          password: 'password123',
          name: 'Team Captain',
          role: 'captain',
          createdAt: '2023-01-02T00:00:00Z'
        }
      ];
      
      // Find user by email
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Create auth token
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const token = `auth_token_${generateUniqueId(32)}`;
      
      const authData = {
        token,
        expiresAt: expiresAt.toISOString()
      };
      
      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = user;
      
      // Save to storage
      saveToStorage(USER_STORAGE_KEY, userWithoutPassword);
      saveToStorage(AUTH_STORAGE_KEY, authData);
      
      // Update state
      setCurrentUser(userWithoutPassword);
      setAuthToken(token);
      setIsAuthenticated(true);
      
      toast.success('Logged in successfully!');
      return userWithoutPassword;
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error(error.message || 'Failed to log in. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Logout user
  const logout = useCallback(() => {
    try {
      // Remove from storage
      removeFromStorage(AUTH_STORAGE_KEY);
      removeFromStorage(USER_STORAGE_KEY);
      
      // Update state
      setCurrentUser(null);
      setAuthToken(null);
      setIsAuthenticated(false);
      
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out properly');
    }
  }, []);
  
  // Update user profile
  const updateProfile = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      // Save to storage
      saveToStorage(USER_STORAGE_KEY, updatedUser);
      
      // Update state
      setCurrentUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);
  
  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }
      
      // In a real app, this would validate the current password and update via API
      // For this demo, we'll just simulate success
      
      toast.success('Password changed successfully!');
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);
  
  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  }, [currentUser]);
  
  // For checking specific permissions or access rights
  const can = useCallback((action) => {
    if (!currentUser) return false;
    
    // Simple role-based permission check
    // In a real app, this would be more sophisticated
    switch (action) {
      case 'create_tournament':
        return ['admin', 'organizer'].includes(currentUser.role);
      case 'manage_auction':
        return ['admin', 'organizer'].includes(currentUser.role);
      case 'join_team':
        return true; // Anyone can join a team
      case 'place_bid':
        return ['admin', 'captain'].includes(currentUser.role);
      default:
        return false;
    }
  }, [currentUser]);
  
  return (
    <AuthContext.Provider
      value={{
        // Auth state
        currentUser,
        isAuthenticated,
        isLoading,
        authToken,
        
        // Auth actions
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        
        // Helper methods
        hasRole,
        can
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;