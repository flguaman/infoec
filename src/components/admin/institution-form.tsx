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
import { updateInstitutionData } from '@/lib/firestore-service';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

type Props = {
  institution: Institution | null;
  onClose: () => void;
};

type FormState = Partial<Institution>;
type FormErrors = { [K in keyof FormState]?: string };

export function InstitutionForm({ institution, onClose }: Props) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [formState, setFormState] = useState<FormState>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institution) {
      setFormState(institution);
    }
  }, [institution]);

  const handleChange = (field: keyof Institution, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (value: 'Banco' | 'Cooperativa') => {
    setFormState((prev) => ({ ...prev, type: value }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (formState.name) {
      const nameValidation = institutionSchema.name(formState.name);
      if (nameValidation !== true) newErrors.name = nameValidation;
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !institution?.id || !firestore) return;

    setLoading(true);
    try {
      const dataToUpdate = {
        name: formState.name,
        type: formState.type,
        solvencia: Number(formState.solvencia),
        liquidez: Number(formState.liquidez),
        morosidad: Number(formState.morosidad),
        activosTotales: Number(formState.activosTotales),
      };
      
      const institutionRef = doc(firestore, 'institutions', institution.id);
      await updateInstitutionData(institutionRef, dataToUpdate);

      toast({
        title: 'Datos actualizados',
        description: `Los datos de ${institution.name} se han guardado.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error al actualizar',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Editar Institución</DialogTitle>
        <DialogDescription>
          Modifique los indicadores para {institution?.name}.
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

            return (
              <div
                key={fieldKey}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label htmlFor={fieldKey} className="text-right capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace('totales', 'Totales')}
                </Label>
                <Input
                  id={fieldKey}
                  type={
                    typeof formState[fieldKey] === 'number' ? 'number' : 'text'
                  }
                  step="any"
                  value={formState[fieldKey] || ''}
                  onChange={(e) =>
                    handleChange(
                      fieldKey,
                      typeof formState[fieldKey] === 'number'
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

    