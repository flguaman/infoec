'use client';
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  updateDoc,
  DocumentReference,
  Firestore,
} from 'firebase/firestore';

import type { Institution } from './types';

const initialInstitutions: Omit<Institution, 'id'>[] = [
  {
    name: 'Banco del Pacífico',
    type: 'Banco',
    solvencia: 11.5,
    liquidez: 35.2,
    morosidad: 3.1,
    activosTotales: 7800000000,
  },
  {
    name: 'Banco Pichincha',
    type: 'Banco',
    solvencia: 12.1,
    liquidez: 33.8,
    morosidad: 2.8,
    activosTotales: 13500000000,
  },
  {
    name: 'Cooperativa JEP',
    type: 'Cooperativa',
    solvencia: 14.8,
    liquidez: 40.1,
    morosidad: 4.5,
    activosTotales: 2900000000,
  },
  {
    name: 'Banco Guayaquil',
    type: 'Banco',
    solvencia: 10.9,
    liquidez: 30.5,
    morosidad: 3.5,
    activosTotales: 9200000000,
  },
  {
    name: 'Cooperativa Alianza del Valle',
    type: 'Cooperativa',
    solvencia: 13.5,
    liquidez: 38.7,
    morosidad: 5.2,
    activosTotales: 1500000000,
  },
];

export async function seedDatabase(db: Firestore) {
  const institutionsCollection = collection(db, 'institutions');
  const snapshot = await getDocs(institutionsCollection);
  if (snapshot.empty) {
    const batch = writeBatch(db);
    initialInstitutions.forEach((institution) => {
      const docRef = doc(institutionsCollection);
      batch.set(docRef, institution);
    });
    await batch.commit();
    console.log('Database seeded successfully!');
    return true;
  } else {
    console.log('Database already contains data, skipping seed.');
    return false;
  }
}

export async function updateInstitutionData(
  institutionDocRef: DocumentReference,
  data: Partial<Omit<Institution, 'id'>>
) {
  await updateDoc(institutionDocRef, data);
}

    