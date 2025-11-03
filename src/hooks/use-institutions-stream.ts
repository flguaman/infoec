'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, Firestore } from 'firebase/firestore';
import type { Institution } from '@/lib/types';
import { db } from '@/lib/firebase';

export function useInstitutionsStream() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'institutions'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const institutionsData: Institution[] = [];
        querySnapshot.forEach((doc) => {
          institutionsData.push({ id: doc.id, ...doc.data() } as Institution);
        });
        setInstitutions(institutionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching institutions:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { institutions, loading };
}
