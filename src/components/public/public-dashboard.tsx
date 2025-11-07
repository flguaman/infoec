'use client';

import React, { useMemo } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase';
import type { DataItem, DataItemCategory } from '@/lib/types';
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
} from '@/components/ui/chart';
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { collection } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryIndicators } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <div className="h-[250px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    </CardContent>
  </Card>
);

const CategoryCharts = ({
  data,
  category,
  isLoading,
  error,
}: {
  data: DataItem[] | null;
  category: DataItemCategory;
  isLoading: boolean;
  error: Error | null;
}) => {
  const indicators = categoryIndicators[category];

  const chartData = useMemo(() => {
    return (
      data?.map((item) => ({
        name: item.name,
        color: item.color || '#8884d8',
        ...item,
      })) || []
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {indicators.map((indicator) => (
          <ChartSkeleton key={indicator} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al Cargar Datos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los gráficos para {category}. Es posible que las
          reglas de seguridad de Firestore no permitan el acceso público.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No hay datos disponibles para la categoría &quot;{category}&quot;.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {indicators.map((indicator) => (
        <Card key={indicator}>
          <CardHeader>
            <CardTitle>Comparativa de {capitalize(indicator)}</CardTitle>
            <CardDescription>
              Análisis para la categoría &quot;{category}&quot;
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer>
                <RechartsBarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value.length > 10 ? `${value.slice(0, 8)}...` : value
                    }
                  />
                  <YAxis unit={indicator.includes('tiempo') ? 'm' : '%'} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <RechartsBar dataKey={indicator} radius={8}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsBar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function PublicDashboard() {
  const firestore = useFirestore();

  const institutionsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'institutions') : null),
    [firestore]
  );
  const universitiesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'universidades') : null),
    [firestore]
  );
  const hospitalsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'hospitales') : null),
    [firestore]
  );

  const {
    data: institutions,
    isLoading: loadingInstitutions,
    error: errorInstitutions,
  } = useCollection<DataItem>(institutionsQuery);
  const {
    data: universities,
    isLoading: loadingUniversities,
    error: errorUniversities,
  } = useCollection<DataItem>(universitiesQuery);
  const {
    data: hospitals,
    isLoading: loadingHospitals,
    error: errorHospitals,
  } = useCollection<DataItem>(hospitalsQuery);

  return (
    <section className="w-full py-8">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Panel de Indicadores Clave
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Visualiza y compara los indicadores de rendimiento de diferentes
            instituciones en Ecuador.
          </p>
        </div>

        <Tabs defaultValue="Bancos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="Bancos">Bancos y Cooperativas</TabsTrigger>
            <TabsTrigger value="Universidades">Universidades</TabsTrigger>
            <TabsTrigger value="Hospitales">Hospitales</TabsTrigger>
          </TabsList>
          <TabsContent value="Bancos">
            <CategoryCharts
              data={institutions}
              category="Bancos"
              isLoading={loadingInstitutions}
              error={errorInstitutions}
            />
          </TabsContent>
          <TabsContent value="Universidades">
            <CategoryCharts
              data={universities}
              category="Universidades"
              isLoading={loadingUniversities}
              error={errorUniversities}
            />
          </TabsContent>
          <TabsContent value="Hospitales">
            <CategoryCharts
              data={hospitals}
              category="Hospitales"
              isLoading={loadingHospitals}
              error={errorHospitals}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
