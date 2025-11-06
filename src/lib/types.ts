export type DataItemCategory = 'Bancos' | 'Universidades' | 'Hospitales';

// Standardized to lowercase to match Firestore field names
export const categoryIndicators: Record<DataItemCategory, string[]> = {
  Bancos: ['solvencia', 'liquidez', 'morosidad'],
  Universidades: ['nivel academico', 'investigacion', 'empleabilidad'],
  Hospitales: ['calidad de atencion', 'tiempo de espera', 'tasa de recuperacion'],
};

// This flattens the structure.
export type DataItem = {
  id: string;
  name: string;
  category: DataItemCategory;
  type?: string; // To handle legacy "Cooperativa" type
  color?: string;
  [key: string]: any; // Allows for arbitrary indicator keys
};

export const dataItemSchema = {
  name: (v: string) => v.length > 2 || 'El nombre debe tener al menos 3 caracteres.',
  category: (v: string) => ['Bancos', 'Universidades', 'Hospitales'].includes(v) || 'Categoría inválida.',
  indicator: (v: number) => typeof v === 'number' || 'El indicador debe ser un número.',
  color: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v) || 'Formato de color inválido. Use #RRGGBB.',
};
