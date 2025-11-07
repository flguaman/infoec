'use client';
import React, { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { collection } from 'firebase/firestore';
import type { DataItem, DataItemCategory } from '@/lib/types';
import { categoryIndicators } from '@/lib/types';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
        <CardTitle>{label}</CardTitle>
        <CardDescription>Comparativa entre todas las categorías</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer>
            <RechartsBarChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
              layout="vertical"
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={120}
              />
              <XAxis type="number" unit={unit} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <RechartsBar dataKey={dataKey} radius={8}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                ))}
              </RechartsBar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default function PublicDashboard() {
  const firestore = useFirestore();

  const { data: banks, isLoading: loadingBanks } = useCollection<DataItem>(
    useMemoFirebase(
      () => (firestore ? collection(firestore, 'institutions') : null),
      [firestore]
    )
  );
  const { data: universities, isLoading: loadingUniversities } =
    useCollection<DataItem>(
      useMemoFirebase(
        () => (firestore ? collection(firestore, 'universidades') : null),
        [firestore]
      )
    );
  const { data: hospitals, isLoading: loadingHospitals } =
    useCollection<DataItem>(
      useMemoFirebase(
        () => (firestore ? collection(firestore, 'hospitales') : null),
        [firestore]
      )
    );

  const isLoading = loadingBanks || loadingUniversities || loadingHospitals;

  const combinedData = useMemo(() => {
    const allData = [
      ...(banks || []),
      ...(universities || []),
      ...(hospitals || []),
    ];
    return allData;
  }, [banks, universities, hospitals]);


  const getChartDataForIndicator = (indicatorName: string) => {
    if (!combinedData) return [];
    return combinedData
      .filter(item => typeof item[indicatorName] === 'number')
      .map(item => ({
        name: item.name,
        [indicatorName]: item[indicatorName],
        color: item.color || '#8884d8'
      }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">
          Cargando indicadores...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Panel de Indicadores de Ecuador
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Visualiza y compara datos clave de diferentes sectores del país.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Bancos y Cooperativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {categoryIndicators.Bancos.map(indicator => (
                <CustomBarChart
                    key={indicator}
                    data={getChartDataForIndicator(indicator)}
                    dataKey={indicator}
                    label={capitalize(indicator)}
                    unit={indicator.includes('tiempo') ? 'min' : '%'}
                />
             ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Universidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {categoryIndicators.Universidades.map(indicator => (
                <CustomBarChart
                    key={indicator}
                    data={getChartDataForIndicator(indicator)}
                    dataKey={indicator}
                    label={capitalize(indicator)}
                    unit={indicator.includes('tiempo') ? 'min' : '%'}
                />
             ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Hospitales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {categoryIndicators.Hospitales.map(indicator => (
                <CustomBarChart
                    key={indicator}
                    data={getChartDataForIndicator(indicator)}
                    dataKey={indicator}
                    label={capitalize(indicator)}
                    unit={indicator.includes('tiempo') ? 'min' : '%'}
                />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
