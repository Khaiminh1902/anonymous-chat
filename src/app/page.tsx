'use client';

import { useAuth } from '../lib/auth';
import LoginForm from '../components/LoginForm';
import ChatDashboard from '../components/ChatDashboard';
import LoadingScreen from '../components/LoadingScreen';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      {!user ? (
        <LoginForm />
      ) : (
        <ChatDashboard />
      )}
    </div>
  );
}
