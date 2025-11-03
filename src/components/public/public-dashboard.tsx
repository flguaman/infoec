'use client';
import { useMemo, useState } from 'react';
import type { Institution } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Badge } from '../ui/badge';

const CustomBarChart = ({
  data,
  dataKey,
  label,
  unit,
}: {
  data: any[];
  dataKey: string;
  label: string;
  unit: string;
}) => {
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label: label,
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa de {label}</CardTitle>
        <CardDescription>
          Visualización del indicador de {label.toLowerCase()} de cada
          institución.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[350px]">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Cargando gráfico...</span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer>
              <BarChart
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
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey={dataKey} radius={8} fill="var(--color-chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default function PublicDashboard() {
  const firestore = useFirestore();
  const institutionsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'institutions')) : null),
    [firestore]
  );
  const { data: institutions, isLoading: loading } = useCollection<Institution>(institutionsQuery);

  const [filterType, setFilterType] = useState<'all' | 'Banco' | 'Cooperativa'>('all');
  const [sortKey, setSortKey] = useState<keyof Institution>('solvencia');

  const filteredAndSortedInstitutions = useMemo(() => {
    if (!institutions) return [];
    return institutions
      .filter((inst) => filterType === 'all' || inst.type === filterType)
      .sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [institutions, filterType, sortKey]);

  const chartData = useMemo(() => {
    return filteredAndSortedInstitutions.map((inst) => ({
      name: inst.name,
      solvencia: inst.solvencia,
      liquidez: inst.liquidez,
      morosidad: inst.morosidad,
      activosTotales: inst.activosTotales,
    }));
  }, [filteredAndSortedInstitutions]);


  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          Indicadores Financieros de Ecuador
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore y compare la salud financiera de los bancos y cooperativas del país.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lista de Instituciones</CardTitle>
                <CardDescription>
                  Datos actualizados sobre las principales instituciones financieras.
                </CardDescription>
              </div>
              <div className="flex gap-4">
                 <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Banco">Bancos</SelectItem>
                      <SelectItem value="Cooperativa">Cooperativas</SelectItem>
                    </SelectContent>
                  </Select>
                   <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solvencia">Solvencia</SelectItem>
                      <SelectItem value="liquidez">Liquidez</SelectItem>
                      <SelectItem value="morosidad">Morosidad</SelectItem>
                      <SelectItem value="activosTotales">Activos Totales</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Solvencia (%)</TableHead>
                    <TableHead className="text-right">Liquidez (%)</TableHead>
                    <TableHead className="text-right">Morosidad (%)</TableHead>
                    <TableHead className="text-right">Activos Totales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Cargando datos...
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : filteredAndSortedInstitutions.length > 0 ? (
                    filteredAndSortedInstitutions.map((inst) => (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium">{inst.name}</TableCell>
                        <TableCell>
                           <Badge variant={inst.type === 'Banco' ? 'default' : 'secondary'}>{inst.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{inst.solvencia.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{inst.liquidez.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{inst.morosidad.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          ${(inst.activosTotales / 1_000_000_000).toFixed(2)}B
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No hay instituciones para mostrar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
            <CustomBarChart data={chartData} dataKey="solvencia" label="Solvencia" unit="%" />
            <CustomBarChart data={chartData} dataKey="liquidez" label="Liquidez" unit="%" />
            <CustomBarChart data={chartData} dataKey="morosidad" label="Morosidad" unit="%" />
        </div>
      </div>
    </div>
  );
}