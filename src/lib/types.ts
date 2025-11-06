export type DataItemCategory = 'Bancos' | 'Universidades' | 'Hospitales';

export const categoryIndicators: Record<DataItemCategory, string[]> = {
  Bancos: ['Solvencia', 'Liquidez', 'Morosidad'],
  Universidades: ['Nivel Académico', 'Investigación', 'Empleabilidad'],
  Hospitales: ['Calidad de Atención', 'Tiempo de Espera', 'Tasa de Recuperación'],
};

export type DataItem = {
  id: string;
  name: string;
  category: DataItemCategory;
  indicators: { [key: string]: number };
  color?: string;
};

export const dataItemSchema = {
  name: (v: string) => v.length > 2 || 'El nombre debe tener al menos 3 caracteres.',
  category: (v: string) => ['Bancos', 'Universidades', 'Hospitales'].includes(v) || 'Categoría inválida.',
  indicator: (v: number) => typeof v === 'number' || 'El indicador debe ser un número.',
  color: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v) || 'Formato de color inválido. Use #RRGGBB.',
};
