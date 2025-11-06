'use client';
import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { DataItem, DataItemCategory } from '@/lib/types';
import { categoryIndicators } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

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

  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.name,
      [dataKey]: item.indicators[dataKey],
      color: item.color,
    }));
  }, [data, dataKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={120}
              />
              <XAxis dataKey={dataKey} type="number" unit={unit} />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey={dataKey} radius={5}>
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};


export default function PublicDashboard() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] =
    useState<DataItemCategory>('Bancos');

  const dataItemsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'dataItems')) : null),
    [firestore]
  );
  
  const { data: allDataItems, isLoading } = useCollection<DataItem>(dataItemsQuery);

  const filteredData = useMemo(() => {
    return allDataItems?.filter(item => item.category === activeTab) || [];
  }, [allDataItems, activeTab]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Indicadores Clave de Ecuador
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Una plataforma para visualizar y comparar datos de diferentes
          sectores.
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

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
             <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="mr-4 h-12 w-12 animate-spin text-primary" />
              <span className='text-xl text-muted-foreground'>Cargando datos...</span>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryIndicators[activeTab].map((indicator) => (
                <CustomBarChart
                  key={indicator}
                  data={filteredData}
                  dataKey={indicator}
                  label={indicator}
                  unit={indicator.includes('Tiempo') ? 'min' : '%'}
                />
              ))}
            </div>
          ) : (
             <div className="flex items-center justify-center h-[400px]">
              <p className="text-xl text-muted-foreground">No hay datos disponibles para esta categoría.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
