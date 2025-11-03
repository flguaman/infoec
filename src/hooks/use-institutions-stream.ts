'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, Firestore } from 'firebase/firestore';
import type { Institution } from '@/lib/types';
import { useFirestore } from '@/firebase';

export function useInstitutionsStream() {
  const firestore = useFirestore();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'institutions'));

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
  }, [firestore]);

  return { institutions, loading };
}

    