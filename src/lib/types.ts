export type DataItemCategory = 'Bancos' | 'Universidades' | 'Hospitales';

// Standardized to lowercase to match Firestore field names
export const categoryIndicators: Record<DataItemCategory, string[]> = {
  Bancos: ['solvencia', 'liquidez', 'morosidad'],
  Universidades: ['nivel academico', 'investigacion', 'empleabilidad'],
  Hospitales: ['calidad de atencion', 'tiempo de espera', 'tasa de recuperacion'],
};

// This type represents the data structure within any of the collections
export type DataItem = {
  id: string;
  name: string;
  color?: string;
  // All other properties are dynamic indicators
  [key: string]: any;
};

// The following types define the specific shape for each category
export type BankItem = {
  id: string;
  name: string;
  color?: string;
  solvencia: number;
  liquidez: number;
  morosidad: number;
  type?: 'Banco' | 'Cooperativa'; // Legacy field
};

export type UniversityItem = {
  id:string;
  name: string;
  color?: string;
  'nivel academico': number;
  investigacion: number;
  empleabilidad: number;
};

export type HospitalItem = {
  id: string;
  name: string;
  color?: string;
  'calidad de atencion': number;
  'tiempo de espera': number;
  'tasa de recuperacion': number;
};


export const dataItemSchema = {
  name: (v: string) => v.length > 2 || 'El nombre debe tener al menos 3 caracteres.',
  category: (v: string) => ['Bancos', 'Universidades', 'Hospitales'].includes(v) || 'Categoría inválida.',
  indicator: (v: number) => typeof v === 'number' || 'El indicador debe ser un número.',
  color: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v) || 'Formato de color inválido. Use #RRGGBB.',
};