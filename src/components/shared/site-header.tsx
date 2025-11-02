'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { LogIn } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';

export default function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link href={user ? "/admin" : "/login"} passHref>
              <Button variant="ghost">
                <LogIn className="mr-2 h-4 w-4" />
                {user ? "Admin" : "Login"}
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
