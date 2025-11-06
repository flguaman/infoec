'use client';
import React, { useState, useMemo } from 'react';
import { initialDataItems } from '@/lib/data.json';
import { type DataItem, type DataItemCategory, categoryIndicators } from '@/lib/types';
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
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Comparativa de {label}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer>
            <RechartsBarChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3).toUpperCase()}
              />
              <YAxis unit={unit} />
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
  const [activeTab, setActiveTab] = useState<DataItemCategory>('Bancos');

  const filteredData = useMemo(() => {
    return initialDataItems.filter((item) => item.category === activeTab);
  }, [activeTab]);

  const chartData = useMemo(() => {
    return (
      filteredData?.map((item) => ({
        id: item.name, // using name as id for local data
        name: item.name,
        color: item.color || '#8884d8',
        ...item.indicators,
      })) || []
    );
  }, [filteredData]);
  
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Panel de Indicadores Clave
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore y compare los datos de diferentes instituciones en Ecuador.
        </p>
      </div>

       <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as DataItemCategory)} className="w-full">
        <div className="flex justify-center mb-8">
            <TabsList>
            <TabsTrigger value="Bancos">Bancos</TabsTrigger>
            <TabsTrigger value="Universidades">Universidades</TabsTrigger>
            <TabsTrigger value="Hospitales">Hospitales</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(categoryIndicators[activeTab] || []).map(indicator => (
                  <CustomBarChart
                    key={indicator}
                    data={chartData}
                    dataKey={indicator}
                    label={indicator}
                    unit={indicator.includes('Tiempo') ? 'min' : (indicator.includes('Calidad') ? '' : '%')}
                  />
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
