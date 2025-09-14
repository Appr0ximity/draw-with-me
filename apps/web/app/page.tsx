'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/chat');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 p-8 relative z-10">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 2.828A1 1 0 016 15H4a2 2 0 01-2-2V9a2 2 0 012-2h2.172l1.766-2.828A1 1 0 019 5h2a2 2 0 012 2v2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
            Draw With Me
          </h1>
          <p className="text-indigo-100 text-xl mb-8 font-medium">
            Connect, chat, and create together in real-time
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/login')}
            className="w-full text-lg font-semibold bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 shadow-2xl"
            size="lg"
          >
            Sign In
          </Button>
          <Button
            onClick={() => router.push('/signup')}
            variant="outline"
            className="w-full text-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-white shadow-2xl"
            size="lg"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}
