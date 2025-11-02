'use client';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Institution } from './types';

const initialInstitutions: Omit<Institution, 'id'>[] = [
  {
    name: 'Banco del Pacífico',
    type: 'Banco',
    solvencia: 11.5,
    liquidez: 35.2,
    morosidad: 3.1,
    activos_totales: 7800000000,
  },
  {
    name: 'Banco Pichincha',
    type: 'Banco',
    solvencia: 12.1,
    liquidez: 33.8,
    morosidad: 2.8,
    activos_totales: 13500000000,
  },
  {
    name: 'Cooperativa JEP',
    type: 'Cooperativa',
    solvencia: 14.8,
    liquidez: 40.1,
    morosidad: 4.5,
    activos_totales: 2900000000,
  },
  {
    name: 'Banco Guayaquil',
    type: 'Banco',
    solvencia: 10.9,
    liquidez: 30.5,
    morosidad: 3.5,
    activos_totales: 9200000000,
  },
  {
    name: 'Cooperativa Alianza del Valle',
    type: 'Cooperativa',
    solvencia: 13.5,
    liquidez: 38.7,
    morosidad: 5.2,
    activos_totales: 1500000000,
  },
];

export async function seedDatabase() {
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
  id: string,
  data: Partial<Institution>
) {
  const institutionDoc = doc(db, 'institutions', id);
  const batch = writeBatch(db);
  batch.update(institutionDoc, data);
  await batch.commit();
}
