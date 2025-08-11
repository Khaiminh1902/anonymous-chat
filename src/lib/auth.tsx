'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface User {
  _id: Id<'users'>;
  codename: string;
  passwordHash: string;
  createdAt: number;
  userCode?: string;
}

interface AuthContextType {
  user: User | null;
  login: (codename: string, password: string) => Promise<boolean>;
  register: (codename: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const convex = useConvex();
  const createUserMutation = useMutation(api.mutations.createUser);

  useEffect(() => {
    const storedUser = localStorage.getItem('anonymousChat_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser._id && typeof parsedUser._id === 'string' && 
            !parsedUser._id.startsWith('user_')) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('anonymousChat_user');
        }
      } catch {
        localStorage.removeItem('anonymousChat_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (codename: string, password: string): Promise<boolean> => {
    try {
      const hashedPassword = await hashPassword(password);
      const existingUser = await convex.query(api.queries.authenticateUser, {
        codename,
        passwordHash: hashedPassword,
      });

      if (!existingUser) return false;

      const authedUser: User = {
        _id: existingUser._id as Id<'users'>,
        codename: existingUser.codename,
        passwordHash: existingUser.passwordHash,
        createdAt: existingUser.createdAt,
        userCode: (existingUser as { userCode?: string }).userCode,
      };

      setUser(authedUser);
      localStorage.setItem('anonymousChat_user', JSON.stringify(authedUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (codename: string, password: string): Promise<boolean> => {
    try {
      const hashedPassword = await hashPassword(password);
      const userId = await createUserMutation({
        codename,
        passwordHash: hashedPassword,
      });

      const profile = await convex.query(api.queries.getUserProfile, { userId });

      const newUser: User = {
        _id: userId,
        codename,
        passwordHash: hashedPassword,
        createdAt: Date.now(),
        userCode: profile?.userCode,
      };

      setUser(newUser);
      localStorage.setItem('anonymousChat_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('anonymousChat_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
