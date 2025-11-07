'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase';
import type { DataItem, DataItemCategory } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryIndicators } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import CustomBarChart from '../shared/custom-bar-chart';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ChartSkeleton = () => (
  <div className="p-4 rounded-lg border bg-card shadow-sm">
    <Skeleton className="h-5 w-3/5 mb-4" />
    <Skeleton className="h-[200px] w-full" />
  </div>
);

export default function PublicDashboard() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<DataItemCategory>('Bancos');

  const { data: institutions, isLoading: loadingInstitutions } = useCollection<DataItem>(
    useMemoFirebase(() => firestore ? collection(firestore, 'institutions') : null, [firestore])
  );
  const { data: universities, isLoading: loadingUniversities } = useCollection<DataItem>(
    useMemoFirebase(() => firestore ? collection(firestore, 'universidades') : null, [firestore])
  );
  const { data: hospitals, isLoading: loadingHospitals } = useCollection<DataItem>(
    useMemoFirebase(() => firestore ? collection(firestore, 'hospitales') : null, [firestore])
  );

  const dataMap = useMemo(() => ({
    Bancos: institutions,
    Universidades: universities,
    Hospitales: hospitals,
  }), [institutions, universities, hospitals]);

  const loadingMap = {
    Bancos: loadingInstitutions,
    Universidades: loadingUniversities,
    Hospitales: loadingHospitals,
  };
  
  const currentData = dataMap[activeTab];
  const isLoading = loadingMap[activeTab];

  const chartData = useMemo(() => {
    return (
      currentData?.map((item) => ({
        name: item.name,
        color: item.color || '#8884d8',
        ...item,
      })) || []
    );
  }, [currentData]);

  const indicators = categoryIndicators[activeTab] || [];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Panel de Indicadores de Ecuador
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Compare indicadores clave de diferentes instituciones a nivel nacional.
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
        {(['Bancos', 'Universidades', 'Hospitales'] as DataItemCategory[]).map(category => (
           <TabsContent key={category} value={category}>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <ChartSkeleton key={index} />
                    ))
                ) : (
                    indicators.map((indicator) => (
                        <CustomBarChart
                            key={indicator}
                            data={chartData}
                            dataKey={indicator}
                            title={`Comparativa de ${capitalize(indicator)}`}
                            isLoading={isLoading}
                            unit={indicator.includes('tiempo') ? 'min' : '%'}
                        />
                    ))
                )}
            </div>
           </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}