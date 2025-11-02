'use client';

import { useState, useMemo } from 'react';
import { useInstitutionsStream } from '@/hooks/use-institutions-stream';
import type { Institution } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const indicadores = [
  { value: 'solvencia', label: 'Solvencia', icon: Landmark },
  { value: 'liquidez', label: 'Liquidez', icon: Percent },
  { value: 'morosidad', label: 'Morosidad', icon: TrendingDown },
  { value: 'activos_totales', label: 'Activos Totales', icon: Building },
];

export default function PublicDashboard() {
  const { institutions, loading } = useInstitutionsStream();
  const [selectedMetric, setSelectedMetric] = useState<keyof Institution | 'activos_totales'>('solvencia');
  const [selectedType, setSelectedType] = useState<'all' | 'Banco' | 'Cooperativa'>('all');

  const filteredData = useMemo(() => {
    return institutions
      .filter(
        (inst) => selectedType === 'all' || inst.type === selectedType
      )
      .sort((a, b) => (b[selectedMetric as keyof Institution] as number) - (a[selectedMetric as keyof Institution] as number));
  }, [institutions, selectedMetric, selectedType]);

  const selectedIndicator = indicadores.find((ind) => ind.value === selectedMetric);

  const formatYAxis = (value: number) => {
    if (selectedMetric === 'activos_totales') {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    return `${value.toFixed(1)}%`;
  };

  const chartConfig = {
    value: {
      label: selectedIndicator?.label,
      color: "hsl(var(--primary))",
    },
  };

  const getInstitutionImage = (institutionName: string) => {
    const imageName = institutionName.toLowerCase().replace(/ /g, '-');
    return PlaceHolderImages.find(p => p.id.includes(imageName))?.imageUrl || 'https://placehold.co/600x400';
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="container mx-auto py-8 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary">
          Análisis Financiero de Ecuador
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Visualice y compare los indicadores clave de las principales instituciones financieras del país.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {selectedIndicator && <selectedIndicator.icon className="h-6 w-6" />}
                Comparativa de {selectedIndicator?.label}
              </CardTitle>
              <CardDescription>
                Análisis comparativo de las instituciones financieras.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as keyof Institution)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar métrica" />
                </SelectTrigger>
                <SelectContent>
                  {indicadores.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'all' | 'Banco' | 'Cooperativa')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de institución" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Banco">Bancos</SelectItem>
                  <SelectItem value="Cooperativa">Cooperativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.substring(0, 10) + (value.length > 10 ? '...' : '')}
                />
                <YAxis tickFormatter={formatYAxis} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent
                    formatter={(value) => selectedMetric === 'activos_totales' ? `$${(Number(value) / 1_000_000_000).toFixed(2)}B` : `${Number(value).toFixed(2)}%`}
                    indicator="dot"
                   />}
                />
                <Bar dataKey={selectedMetric} fill="var(--color-value)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Detalle por Institución</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((inst) => (
            <Card key={inst.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                   <Image
                      src={getInstitutionImage(inst.name)}
                      alt={`Imagen de ${inst.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      data-ai-hint="office building"
                    />
                </div>
              <CardHeader>
                <CardTitle>{inst.name}</CardTitle>
                <CardDescription>{inst.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Solvencia:</span>
                    <span className="font-medium">{inst.solvencia.toFixed(2)}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Liquidez:</span>
                    <span className="font-medium">{inst.liquidez.toFixed(2)}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Morosidad:</span>
                    <span className="font-medium">{inst.morosidad.toFixed(2)}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Activos Totales:</span>
                    <span className="font-medium">${(inst.activos_totales / 1_000_000_000).toFixed(2)}B</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
