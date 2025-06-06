import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { StorageManager } from './storage';
import Cookies from 'js-cookie';

// Types
export interface User {
  id: string | number;
  account: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  token?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
}

// Custom storage implementation
const createCustomStorage = (type: 'local' | 'session' | 'memory' = 'local'): StateStorage => {
  const storage = new StorageManager(type);
  
  return {
    getItem: async (name: string) => {
      const value = storage.get(name);
      return value ? JSON.stringify(value) : null;
    },
    setItem: async (name: string, value: string) => {
      storage.set(name, JSON.parse(value));
    },
    removeItem: async (name: string) => {
      storage.remove(name);
    },
  };
};

// Create store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      login: async (user, token) => {
        set({ isLoading: true });
        try {
          // Set the token in an HTTP-only cookie
          Cookies.set('token', token, { 
            expires: 7, // 7 days
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false // Note: For httpOnly, you'll need to set it server-side
          });
          
          set({
            user: { ...user, token },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        // Remove the token cookie on logout
        Cookies.remove('token', { path: '/' });
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'user-storage', // unique name for the storage key
      storage: createJSONStorage(() => createCustomStorage('local')), // default to localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
      }),
    }
  )
);

// Helper hooks
export const useCurrentUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);

// Example of a selector
export const useUserToken = () => useUserStore((state) => state.user?.token);
