'use client';
import {
  collection,
  writeBatch,
  updateDoc,
  addDoc,
  DocumentReference,
  Firestore,
  doc,
} from 'firebase/firestore';
import type { DataItem } from './types';
import { initialDataItems } from './data.json';

export async function seedDatabase(db: Firestore) {
  const institutionsCollection = collection(db, 'institutions');
  const batch = writeBatch(db);
  initialDataItems.forEach((item) => {
    // The item from JSON already has the flat structure
    const docRef = doc(institutionsCollection); 
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log('Database seeded successfully with multi-category data!');
  return true;
}

export async function addInstitutionData(
  db: Firestore,
  data: Omit<DataItem, 'id'>
) {
  const itemsCollection = collection(db, 'institutions');
  await addDoc(itemsCollection, data);
}

export async function updateInstitutionData(
  itemDocRef: DocumentReference,
  data: Partial<Omit<DataItem, 'id'>>
) {
  await updateDoc(itemDocRef, data);
}
