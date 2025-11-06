'use client';
import {
  collection,
  writeBatch,
  updateDoc,
  addDoc,
  DocumentReference,
  Firestore,
} from 'firebase/firestore';
import type { DataItem } from './types';

const initialDataItems: Omit<DataItem, 'id'>[] = [
  // Banks
  {
    name: 'Banco del Pacífico',
    category: 'Bancos',
    indicators: { Solvencia: 11.5, Liquidez: 35.2, Morosidad: 3.1 },
    color: '#0033a0',
  },
  {
    name: 'Banco Pichincha',
    category: 'Bancos',
    indicators: { Solvencia: 12.1, Liquidez: 33.8, Morosidad: 2.8 },
    color: '#ffd100',
  },
  // Universities
  {
    name: 'Universidad San Francisco de Quito',
    category: 'Universidades',
    indicators: { 'Nivel Académico': 95, Investigación: 88, Empleabilidad: 92 },
    color: '#8c1d40',
  },
  {
    name: 'Escuela Politécnica Nacional',
    category: 'Universidades',
    indicators: { 'Nivel Académico': 92, Investigación: 91, Empleabilidad: 85 },
    color: '#004b8d',
  },
  // Hospitals
  {
    name: 'Hospital Metropolitano',
    category: 'Hospitales',
    indicators: { 'Calidad de Atención': 9.5, 'Tiempo de Espera': 20, 'Tasa de Recuperación': 98 },
    color: '#00a99d',
  },
  {
    name: 'Hospital de los Valles',
    category: 'Hospitales',
    indicators: { 'Calidad de Atención': 9.2, 'Tiempo de Espera': 25, 'Tasa de Recuperación': 97 },
    color: '#e4002b',
  },
];

export async function seedDatabase(db: Firestore) {
  const dataItemsCollection = collection(db, 'dataItems');
  const batch = writeBatch(db);
  initialDataItems.forEach((item) => {
    const docRef = doc(dataItemsCollection); // Create a new doc with a random ID
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
  const itemsCollection = collection(db, 'dataItems');
  await addDoc(itemsCollection, data);
}

export async function updateInstitutionData(
  itemDocRef: DocumentReference,
  data: Partial<Omit<DataItem, 'id'>>
) {
  await updateDoc(itemDocRef, data);
}
