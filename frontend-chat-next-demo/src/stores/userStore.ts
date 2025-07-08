import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { StorageManager } from './storage';
import Cookies from '../../node_modules/@types/js-cookie';

// Types
export interface User {
  id: string;
  account: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface UserState {
  token: string | null;
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
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      login: async (user, token) => {
        try {
          set({
            token: token,
            user: user,
            isAuthenticated: true,
          });
        } catch (error) {
          throw error;
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'user-storage', // unique name for the storage key
      storage: createJSONStorage(() => createCustomStorage()), // default to localStorage
      partialize: (state) => ({
        token: state.token,
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
export const useUserToken = () => useUserStore((state) => state.token);
