'use client';
import { useEffect, useState } from 'react';
import type { Institution } from '@/lib/types';
import { institutionSchema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateInstitutionData, addInstitutionData } from '@/lib/firestore-service';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

type Props = {
  institution: Institution | null;
  onClose: () => void;
};

type FormState = Partial<Omit<Institution, 'id'>>;
type FormErrors = { [K in keyof FormState]?: string };

const defaultInitialState: FormState = {
    name: '',
    type: 'Banco',
    solvencia: 0,
    liquidez: 0,
    morosidad: 0,
    activosTotales: 0,
    color: '#2563eb' // default primary color
}

export function InstitutionForm({ institution, onClose }: Props) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [formState, setFormState] = useState<FormState>(defaultInitialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!institution;

  useEffect(() => {
    if (institution) {
      setFormState({
        ...institution,
        color: institution.color || defaultInitialState.color
      });
    } else {
      setFormState(defaultInitialState)
    }
  }, [institution]);

  const handleChange = (field: keyof FormState, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (value: 'Banco' | 'Cooperativa') => {
    setFormState((prev) => ({ ...prev, type: value }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (formState.name !== undefined) {
        const nameValidation = institutionSchema.name(formState.name);
        if (nameValidation !== true) newErrors.name = nameValidation;
    }
     if (formState.type !== undefined) {
      const typeValidation = institutionSchema.type(formState.type);
      if (typeValidation !== true) newErrors.type = typeValidation;
    }
    if (formState.solvencia !== undefined) {
      const solvenciaValidation = institutionSchema.solvencia(
        formState.solvencia
      );
      if (solvenciaValidation !== true)
        newErrors.solvencia = solvenciaValidation;
    }
    if (formState.liquidez !== undefined) {
      const liquidezValidation = institutionSchema.liquidez(formState.liquidez);
      if (liquidezValidation !== true) newErrors.liquidez = liquidezValidation;
    }
    if (formState.morosidad !== undefined) {
      const morosidadValidation = institutionSchema.morosidad(
        formState.morosidad
      );
      if (morosidadValidation !== true)
        newErrors.morosidad = morosidadValidation;
    }
    if (formState.activosTotales !== undefined) {
      const activosValidation = institutionSchema.activosTotales(
        formState.activosTotales
      );
      if (activosValidation !== true)
        newErrors.activosTotales = activosValidation;
    }
    if (formState.color !== undefined) {
      const colorValidation = institutionSchema.color(
        formState.color
      );
      if (colorValidation !== true)
        newErrors.color = colorValidation;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !firestore) return;

    setLoading(true);
    try {
      const dataToSave = {
        name: formState.name || '',
        type: formState.type || 'Banco',
        solvencia: Number(formState.solvencia) || 0,
        liquidez: Number(formState.liquidez) || 0,
        morosidad: Number(formState.morosidad) || 0,
        activosTotales: Number(formState.activosTotales) || 0,
        color: formState.color || '#2563eb',
      };

      if (isEditing && institution) {
          const institutionRef = doc(firestore, 'institutions', institution.id);
          await updateInstitutionData(institutionRef, dataToSave);
          toast({
            title: 'Datos actualizados',
            description: `Los datos de ${institution.name} se han guardado.`,
          });
      } else {
          await addInstitutionData(firestore, dataToSave);
           toast({
            title: 'Institución creada',
            description: `Se ha creado la nueva institución ${dataToSave.name}.`,
          });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: `Error al ${isEditing ? 'actualizar' : 'crear'}`,
        description: `No se pudieron guardar los datos.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar' : 'Nueva'} Institución</DialogTitle>
        <DialogDescription>
          {isEditing ? `Modifique los indicadores para ${institution?.name}.` : 'Complete los datos de la nueva institución.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {Object.keys(institutionSchema)
          .filter((key) => !['id'].includes(key))
          .map((key) => {
            const fieldKey = key as keyof Omit<Institution, 'id'>;

            if (fieldKey === 'type') {
              return (
                <div
                  key={fieldKey}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor={fieldKey} className="text-right">
                    Tipo
                  </Label>
                  <Select
                    onValueChange={handleSelectChange}
                    value={formState.type}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Banco">Banco</SelectItem>
                      <SelectItem value="Cooperativa">Cooperativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            }
             if (fieldKey === 'color') {
              return (
                <div
                  key={fieldKey}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor={fieldKey} className="text-right">
                    Color
                  </Label>
                  <div className='col-span-3 flex items-center gap-2'>
                    <Input
                      id={fieldKey}
                      type="color"
                      value={formState.color || '#000000'}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="w-10 h-10 p-1"
                    />
                    <span className="text-sm text-muted-foreground">{formState.color}</span>
                  </div>
                </div>
              )
            }


            return (
              <div
                key={fieldKey}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label htmlFor={fieldKey} className="text-right capitalize">
                  {key === 'activosTotales' ? 'Activos Totales' : key.replace(/([A-Z])/g, ' $1')}
                </Label>
                <Input
                  id={fieldKey}
                  type={
                    typeof formState[fieldKey] === 'number' || fieldKey === 'solvencia' || fieldKey === 'liquidez' || fieldKey === 'morosidad' || fieldKey === 'activosTotales' ? 'number' : 'text'
                  }
                  step="any"
                  value={formState[fieldKey] || ''}
                  onChange={(e) =>
                    handleChange(
                      fieldKey,
                      typeof formState[fieldKey] === 'number' || e.target.type === 'number'
                        ? parseFloat(e.target.value)
                        : e.target.value
                    )
                  }
                  className="col-span-3"
                />
                {errors[fieldKey] && (
                  <p className="col-span-4 text-right text-sm text-destructive">
                    {errors[fieldKey]}
                  </p>
                )}
              </div>
            );
          })}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Cambios
        </Button>
      </DialogFooter>
    </form>
  );
}
