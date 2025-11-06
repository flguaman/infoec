'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import PublicDashboard from '@/components/public/public-dashboard';
import SiteHeader from '@/components/shared/site-header';

export default function Home() {
  const auth = useAuth();

  useEffect(() => {
    if (auth && auth.currentUser) {
      signOut(auth);
    }
  }, [auth]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1">
        <PublicDashboard />
      </main>
      <footer className="py-6 px-4 md:px-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} InfoEc. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
