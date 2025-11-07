'use client';
import React, { useState, useMemo } from 'react';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { DataItem, DataItemCategory } from '@/lib/types';
import { categoryIndicators } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const categoryToCollectionMap: Record<DataItemCategory, string> = {
  Bancos: 'institutions',
  Universidades: 'universidades',
  Hospitales: 'hospitales',
};

// Componente de gráfico reutilizable y corregido
const CustomBarChart = ({
  data,
  dataKey,
  label,
  unit = '',
}: {
  data: any[];
  dataKey: string;
  label: string;
  unit?: string;
}) => {
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label: label,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa de {label}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <RechartsBarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis unit={unit} />
            {/* El Tooltip de Recharts debe tener su contenido definido por ChartTooltipContent de ShadCN */}
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey={dataKey} radius={8} fill={`var(--color-${dataKey})`}>
              {data.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={entry.color || '#8884d8'} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};


export default function PublicDashboard() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] =
    useState<DataItemCategory>('Bancos');

  const { data: institutions, isLoading: loadingInstitutions } = useCollection<DataItem>(
    useMemoFirebase(() => firestore ? collection(firestore, 'institutions') : null, [firestore])
  );
  const { data: universities, isLoading: loadingUniversities } = useCollection<DataItem>(
    useMemoFirebase(() => firestore ? collection(firestore, 'universidades') : null, [firestore])
  );
  const { data: hospitals, isLoading: loadingHospitals } = useCollection<DataItem>(
    useMemoFirebase(() => firestore ? collection(firestore, 'hospitales') : null, [firestore])
  );
  
  const isLoading = loadingInstitutions || loadingUniversities || loadingHospitals;

  const dataMap = useMemo(() => ({
    Bancos: institutions,
    Universidades: universities,
    Hospitales: hospitals,
  }), [institutions, universities, hospitals]);

  const renderCategoryCharts = (category: DataItemCategory) => {
    const data = dataMap[category];
    const indicators = categoryIndicators[category];

    if (!data) {
       return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((indicator) => (
            <Card key={indicator}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if(data.length === 0){
        return <p className="text-center text-muted-foreground mt-8">No hay datos para mostrar en esta categoría.</p>
    }

    const chartData = data.map((item) => ({
      name: item.name,
      color: item.color || '#8884d8',
      ...item,
    }));

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {indicators.map((indicator) => (
          <CustomBarChart
            key={indicator}
            data={chartData}
            dataKey={indicator}
            label={capitalize(indicator)}
            unit={indicator.includes('tiempo') ? 'min' : '%'}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Panel de Indicadores Clave
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore y compare datos de diferentes sectores en Ecuador.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DataItemCategory)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Bancos">Bancos</TabsTrigger>
          <TabsTrigger value="Universidades">Universidades</TabsTrigger>
          <TabsTrigger value="Hospitales">Hospitales</TabsTrigger>
        </TabsList>
        <TabsContent value="Bancos">
          {renderCategoryCharts('Bancos')}
        </TabsContent>
        <TabsContent value="Universidades">
          {renderCategoryCharts('Universidades')}
        </TabsContent>
        <TabsContent value="Hospitales">
          {renderCategoryCharts('Hospitales')}
        </TabsContent>
      </Tabs>
    </section>
  );
}
