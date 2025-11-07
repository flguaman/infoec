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

const categoryToCollectionMap: Record<DataItemCategory, string> = {
    Bancos: 'institutions',
    Universidades: 'universidades',
    Hospitales: 'hospitales',
};

type FormState = Omit<DataItem, 'id'>;

type FormErrors = {
  name?: string;
  category?: string;
  color?: string;
  indicators?: { [key: string]: string };
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function DataItemForm({
  dataItem,
  category,
  onClose,
}: {
  dataItem: DataItem | null;
  category: DataItemCategory;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [formState, setFormState] = useState<FormState>({} as FormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<DataItemCategory>(category);

  const isEditing = !!dataItem;
  const currentIndicators = categoryIndicators[currentCategory] || [];

  useEffect(() => {
    if (dataItem) {
      setCurrentCategory(category);
      setFormState({
        name: dataItem.name,
        color: dataItem.color || '#2563eb',
        ...currentIndicators.reduce((acc, key) => ({ ...acc, [key]: dataItem[key] || 0 }), {})
      });
    } else {
      // Initialize with default state for the active category
      const initialIndicators = (categoryIndicators[category] || []).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {}
      );
      setCurrentCategory(category);
      setFormState({
        name: '',
        color: '#2563eb',
        ...initialIndicators
      });
    }
  }, [dataItem, category]);

  const handleChange = (field: keyof FormState, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleCategoryChange = (value: DataItemCategory) => {
    const newIndicators = categoryIndicators[value].reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {}
    );
    setCurrentCategory(value);
    setFormState({
        name: formState.name, // keep name
        color: formState.color, // keep color
        ...newIndicators
    });
  };

  const validate = () => {
    const newErrors: FormErrors = { indicators: {} };
    const nameValidation = dataItemSchema.name(formState.name);
    if (nameValidation !== true) newErrors.name = nameValidation;
    
    if (formState.color) {
      const colorValidation = dataItemSchema.color(formState.color);
      if (colorValidation !== true) newErrors.color = colorValidation;
    }

    currentIndicators.forEach((key) => {
      const value = formState[key];
      if (value === undefined || dataItemSchema.indicator(value) !== true) {
        if (!newErrors.indicators) newErrors.indicators = {};
        newErrors.indicators[key] = 'Debe ser un número válido.';
      }
    });

    setErrors(newErrors);
    // Check if there are any errors in the main object or in the nested indicators object
    return Object.keys(newErrors).length === 1 && Object.keys(newErrors.indicators || {}).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !firestore) return;

    setLoading(true);

    const collectionName = categoryToCollectionMap[currentCategory];
    const dataToSave = { ...formState };
    // Remove non-indicator properties that might have been carried over
    delete (dataToSave as any).category; 

    try {
      if (isEditing && dataItem) {
        const itemRef = doc(firestore, collectionName, dataItem.id);
        await updateInstitutionData(itemRef, dataToSave);
        toast({
          title: 'Datos actualizados',
          description: `Los datos de ${dataItem.name} se han guardado.`,
        });
      } else {
        await addInstitutionData(firestore, collectionName, dataToSave);
        toast({
          title: 'Elemento creado',
          description: `Se ha creado el nuevo elemento ${dataToSave.name}.`,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: `Error al ${isEditing ? 'actualizar' : 'crear'}`,
        description: `No se pudieron guardar los datos. Verifique la consola.`,
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
            onValueChange={(value) => handleCategoryChange(value as DataItemCategory)}
            value={currentCategory}
            disabled={isEditing}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(categoryToCollectionMap).map((cat) => (
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
            {errors.indicators?.[key] && (
              <p className="col-span-4 text-right text-sm text-destructive">
                {errors.indicators[key]}
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