export type Institution = {
  id: string;
  name: string;
  type: 'Banco' | 'Cooperativa';
  solvencia: number;
  liquidez: number;
  morosidad: number;
  activosTotales: number;
  color?: string;
};

export const institutionSchema = {
  name: (v: string) => v.length > 2 || 'El nombre debe tener al menos 3 caracteres.',
  type: (v: string) => ['Banco', 'Cooperativa'].includes(v) || 'Tipo inválido.',
  solvencia: (v: number) => (v >= 0 && v <= 100) || 'La solvencia debe estar entre 0 y 100.',
  liquidez: (v: number) => (v >= 0 && v <= 100) || 'La liquidez debe estar entre 0 y 100.',
  morosidad: (v: number) => (v >= 0 && v <= 100) || 'La morosidad debe estar entre 0 y 100.',
  activosTotales: (v: number) => v > 0 || 'Los activos totales deben ser un número positivo.',
  color: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v) || 'Formato de color inválido. Use #RRGGBB.',
};
