import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserStore } from '../stores/userStore';

export const useAuth = (redirectTo: string = '/chat_login') => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUserStore();

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
};

export const useGuest = (redirectTo: string = '/chat') => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUserStore();

  useEffect(() => {
    // If authenticated and not loading, redirect to home/chat
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isGuest: !isAuthenticated, isLoading };
};
