'use client';

import React from 'react';
import {
  Card,
  CardContent,
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
import { Loader2 } from 'lucide-react';

interface CustomBarChartProps {
  data: any[];
  dataKey: string;
  title: string;
  isLoading: boolean;
  unit?: string;
}

export default function CustomBarChart({
  data,
  dataKey,
  title,
  isLoading,
  unit = '',
}: CustomBarChartProps) {
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label: title,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Cargando gráfico...</span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                  tickFormatter={(value) => (value && value.length > 3 ? value.slice(0, 3) : value)}
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
        )}
      </CardContent>
    </Card>
  );
}
