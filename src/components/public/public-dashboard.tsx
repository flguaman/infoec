'use client';
import { useState, useMemo } from 'react';
import { useInstitutionsStream } from '@/hooks/use-institutions-stream';
import type { Institution } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Loader2, Building, TrendingUp, TrendingDown, Percent, Landmark } from 'lucide-react';

const INDICATORS = [
  { value: 'solvencia', label: 'Solvencia', icon: Landmark },
  { value: 'liquidez', label: 'Liquidez', icon: Percent },
  { value: 'morosidad', label: 'Morosidad', icon: TrendingDown },
  { value: 'activos_totales', label: 'Activos Totales', icon: TrendingUp },
];

const getImageForInstitution = (institutionName: string) => {
    const nameId = institutionName.toLowerCase().replace(/\s/g, '-');
    const image = PlaceHolderImages.find(img => img.id.includes(nameId.split('-')[1]));
    return image || PlaceHolderImages[0];
};

export default function PublicDashboard() {
  const { institutions, loading } = useInstitutionsStream();
  const [selectedIndicator, setSelectedIndicator] = useState('solvencia');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const chartData = useMemo(() => {
    return institutions.map((inst) => ({
      name: inst.name,
      value: inst[selectedIndicator as keyof Institution] as number,
    }));
  }, [institutions, selectedIndicator]);

  const CurrentIndicator = INDICATORS.find(ind => ind.value === selectedIndicator);
  const Icon = CurrentIndicator?.icon;

  const handleSelectInstitution = (name: string) => {
    const institution = institutions.find(inst => inst.name === name);
    setSelectedInstitution(institution || null);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Plataforma de Indicadores Financieros de Ecuador</h1>
        <p className="mt-4 text-lg text-muted-foreground">Visualice y compare los indicadores financieros clave de los principales bancos y cooperativas del país.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="flex items-center">
                        {Icon && <Icon className="mr-2 h-6 w-6" />}
                        Comparativa de {CurrentIndicator?.label}
                    </CardTitle>
                    <CardDescription>Comparación entre instituciones</CardDescription>
                </div>
                <div className="w-48">
                    <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar indicador" />
                        </SelectTrigger>
                        <SelectContent>
                        {INDICATORS.map(ind => (
                            <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-96 w-full">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={false} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} onClick={(data) => handleSelectInstitution(data.name)} className="cursor-pointer"/>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
            {selectedInstitution ? (
                <>
                <CardHeader>
                    <div className="relative h-40 w-full mb-4">
                        <Image src={getImageForInstitution(selectedInstitution.name).imageUrl} alt={selectedInstitution.name} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint={getImageForInstitution(selectedInstitution.name).imageHint} />
                    </div>
                    <CardTitle>{selectedInstitution.name}</CardTitle>
                    <CardDescription>{selectedInstitution.type}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {INDICATORS.map(ind => (
                             <li key={ind.value} className="flex items-center justify-between">
                                <span className="flex items-center text-muted-foreground">
                                    <ind.icon className="mr-2 h-4 w-4" />
                                    {ind.label}
                                </span>
                                <span className="font-semibold text-foreground">
                                    {(selectedInstitution[ind.value as keyof Institution] as number).toFixed(2)}
                                    {ind.value !== 'activos_totales' ? '%' : ''}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                </>
            ): (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <Building className="mx-auto h-12 w-12" />
                        <p className="mt-2">Seleccione una institución en el gráfico para ver sus detalles.</p>
                    </div>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
}
