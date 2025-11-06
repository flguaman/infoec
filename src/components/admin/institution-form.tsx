'use client';
import React, { useEffect, useState } from 'react';
import type { DataItem, DataItemCategory } from '@/lib/types';
import { dataItemSchema, categoryIndicators } from '@/lib/types';
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
import {
  updateInstitutionData,
  addInstitutionData,
} from '@/lib/firestore-service';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

type FormState = Partial<Omit<DataItem, 'id'>>;
type FormErrors = { [key: string]: string | undefined };

const defaultInitialState: FormState = {
  name: '',
  category: 'Bancos',
  color: '#2563eb', // default primary color
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function DataItemForm({
  dataItem,
  onClose,
}: {
  dataItem: DataItem | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [formState, setFormState] = useState<FormState>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!dataItem;
  const currentCategory = formState.category || 'Bancos';
  const currentIndicators = categoryIndicators[currentCategory] || [];

  useEffect(() => {
    if (dataItem) {
      setFormState({
        ...dataItem,
        color: dataItem.color || defaultInitialState.color,
      });
    } else {
      const initialIndicators = (categoryIndicators['Bancos'] || []).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {}
      );
      setFormState({ ...defaultInitialState, ...initialIndicators });
    }
  }, [dataItem]);

  const handleChange = (field: keyof FormState | string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleCategoryChange = (value: DataItemCategory) => {
    const newIndicators = categoryIndicators[value].reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {}
    );
    // Keep name and color, reset everything else
    setFormState((prev) => ({
      name: prev.name,
      color: prev.color,
      category: value,
      ...newIndicators,
    }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (formState.name !== undefined) {
      const nameValidation = dataItemSchema.name(formState.name);
      if (nameValidation !== true) newErrors.name = nameValidation;
    }
    if (formState.category !== undefined) {
      const categoryValidation = dataItemSchema.category(formState.category);
      if (categoryValidation !== true) newErrors.category = categoryValidation;
    }
    if (formState.color !== undefined) {
      const colorValidation = dataItemSchema.color(formState.color);
      if (colorValidation !== true) newErrors.color = colorValidation;
    }

    currentIndicators.forEach((key) => {
      const value = formState[key];
      if (value === undefined || dataItemSchema.indicator(value) !== true) {
        newErrors[key] = 'Debe ser un número válido.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !firestore) return;

    setLoading(true);

    // Construct the data to save based on the flat structure
    const dataToSave: { [key: string]: any } = {
        name: formState.name || '',
        category: formState.category || 'Bancos',
        color: formState.color || '#2563eb',
    };

    currentIndicators.forEach(key => {
        dataToSave[key] = formState[key] || 0;
    });


    try {
      if (isEditing && dataItem) {
        const itemRef = doc(firestore, 'institutions', dataItem.id);
        await updateInstitutionData(itemRef, dataToSave);
        toast({
          title: 'Datos actualizados',
          description: `Los datos de ${dataItem.name} se han guardado.`,
        });
      } else {
        await addInstitutionData(firestore, dataToSave as Omit<DataItem, 'id'>);
        toast({
          title: 'Elemento creado',
          description: `Se ha creado el nuevo elemento ${dataToSave.name}.`,
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
        <DialogTitle>{isEditing ? 'Editar' : 'Nuevo'} Elemento</DialogTitle>
        <DialogDescription>
          Complete los datos. El formulario se adaptará a la categoría que elija.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre
          </Label>
          <Input
            id="name"
            value={formState.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="col-span-3"
          />
          {errors.name && (
            <p className="col-span-4 text-right text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Categoría
          </Label>
          <Select
            onValueChange={handleCategoryChange}
            value={formState.category}
            disabled={isEditing}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(categoryIndicators).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentIndicators.map((key) => (
          <div key={key} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={key} className="text-right capitalize">
              {capitalize(key)}
            </Label>
            <Input
              id={key}
              type="number"
              step="any"
              value={formState[key] || ''}
              onChange={(e) =>
                handleChange(key, parseFloat(e.target.value) || 0)
              }
              className="col-span-3"
            />
            {errors[key] && (
              <p className="col-span-4 text-right text-sm text-destructive">
                {errors[key]}
              </p>
            )}
          </div>
        ))}

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
                Color
            </Label>
            <div className='col-span-3 flex items-center gap-2'>
                <Input
                    id="color"
                    type="color"
                    value={formState.color || '#000000'}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-10 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">{formState.color}</span>
            </div>
             {errors.color && (
              <p className="col-span-4 text-right text-sm text-destructive">
                {errors.color}
              </p>
            )}
        </div>
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
