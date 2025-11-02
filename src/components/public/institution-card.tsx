'use client';

import type { Institution } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import IndicatorChart from './indicator-chart';
import {
  ShieldCheck,
  Droplets,
  TrendingDown,
  Landmark,
} from 'lucide-react';

type Props = {
  institution: Institution;
};

export default function InstitutionCard({ institution }: Props) {
  return (
    <Card className="flex flex-col h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">
          {institution.name}
        </CardTitle>
        <CardDescription>{institution.type}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-2 gap-4">
        <IndicatorChart
          label="Solvencia"
          value={institution.solvencia}
          unit="%"
          icon={<ShieldCheck className="h-5 w-5" />}
          color="hsl(var(--chart-1))"
        />
        <IndicatorChart
          label="Liquidez"
          value={institution.liquidez}
          unit="%"
          icon={<Droplets className="h-5 w-5" />}
          color="hsl(var(--chart-2))"
        />
        <IndicatorChart
          label="Morosidad"
          value={institution.morosidad}
          unit="%"
          icon={<TrendingDown className="h-5 w-5" />}
          color="hsl(var(--chart-3))"
        />
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
          <Landmark className="h-5 w-5 mb-2 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Activos Totales</span>
          <span className="text-xl font-bold">
            ${(institution.activos_totales / 1_000_000_000).toFixed(2)}B
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
