'use client';
import {
  collection,
  writeBatch,
  updateDoc,
  addDoc,
  DocumentReference,
  Firestore,
} from 'firebase/firestore';
import type { DataItem, DataItemCategory } from './types';
import initialData from './data.json';

const categoryToCollectionMap: Record<DataItemCategory, string> = {
    Bancos: 'institutions',
    Universidades: 'universidades',
    Hospitales: 'hospitales',
};

export async function seedDatabase(db: Firestore) {
  const batch = writeBatch(db);
  const data = initialData as Record<DataItemCategory, any[]>;

  // Iterate over each category in the JSON file
  for (const categoryName of Object.keys(data) as DataItemCategory[]) {
    const collectionName = categoryToCollectionMap[categoryName];
    if (!collectionName) {
      console.warn(`No collection mapping found for category: ${categoryName}`);
      continue;
    }
    const items = data[categoryName];
    const targetCollection = collection(db, collectionName);
    
    console.log(`Seeding ${items.length} items into '${collectionName}'`);
    items.forEach((item) => {
      // Create a new document reference for each item to get a unique ID
      const docRef = doc(targetCollection);
      batch.set(docRef, item);
    });
  }

  await batch.commit();
  console.log('Database seeded successfully with multi-category data!');
  return true;
}


export async function addInstitutionData(
  db: Firestore,
  collectionName: string,
  data: Omit<DataItem, 'id'>
) {
  const itemsCollection = collection(db, collectionName);
  await addDoc(itemsCollection, data);
}

export async function updateInstitutionData(
  itemDocRef: DocumentReference,
  data: Partial<Omit<DataItem, 'id'>>
) {
  await updateDoc(itemDocRef, data);
}
