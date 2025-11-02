'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Institution } from '@/lib/types';

export function useInstitutionsStream() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
