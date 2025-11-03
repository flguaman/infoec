'use client';
import { useState, useMemo } from 'react';
import type { Institution } from '@/lib/types';
import { useInstitutionsStream } from '@/hooks/use-institutions-stream';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, Building, Landmark, Percent } from 'lucide-react';
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
      color: 'hsl(var(--primary))',
    },
    bancos: {
      label: 'Bancos',
      color: 'hsl(var(--chart-1))',
    },
    cooperativas: {
      label: 'Cooperativas',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Comparativa de {label}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {!data || data.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center">
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
                <Bar
                  dataKey={dataKey}
                  radius={8}
                  fill="var(--color-primary)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default function PublicDashboard() {
  const { institutions, loading } = useInstitutionsStream();
  const [indicador, setIndicador] = useState('solvencia');
  const [tipo, setTipo] = useState('todos');

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      if (tipo === 'todos') return true;
      return inst.type.toLowerCase() === tipo;
    });
  }, [institutions, tipo]);

  const chartData = useMemo(() => {
    return filteredInstitutions.map((inst) => ({
      name: inst.name,
      [indicador]: inst[indicador as keyof Institution],
    }));
  }, [filteredInstitutions, indicador]);

  const stats = useMemo(() => {
    const data = filteredInstitutions;
    if (!data || data.length === 0)
      return { total: 0, avgSolvencia: 0, avgLiquidez: 0, avgMorosidad: 0 };
    const total = data.length;
    const avgSolvencia =
      data.reduce((acc, inst) => acc + inst.solvencia, 0) / total;
    const avgLiquidez =
      data.reduce((acc, inst) => acc + inst.liquidez, 0) / total;
    const avgMorosidad =
      data.reduce((acc, inst) => acc + inst.morosidad, 0) / total;
    return { total, avgSolvencia, avgLiquidez, avgMorosidad };
  }, [filteredInstitutions]);

  const indicadores = [
    { value: 'solvencia', label: 'Solvencia', unit: '%' },
    { value: 'liquidez', label: 'Liquidez', unit: '%' },
    { value: 'morosidad', label: 'Morosidad', unit: '%' },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Explorador Financiero de Ecuador
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Visualice y compare los indicadores clave de bancos y cooperativas.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Instituciones
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solvencia Prom.
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgSolvencia.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Liquidez Prom.
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgLiquidez.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Morosidad Prom.
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgMorosidad.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>Análisis Comparativo</CardTitle>
                  <CardDescription>
                    Seleccione un indicador y tipo de institución para comparar.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={indicador} onValueChange={setIndicador}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Indicador" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicadores.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="banco">Bancos</SelectItem>
                      <SelectItem value="cooperativa">Cooperativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <span>Cargando datos...</span>
                </div>
              ) : (
                <CustomBarChart
                  data={chartData}
                  dataKey={indicador}
                  label={
                    indicadores.find((ind) => ind.value === indicador)
                      ?.label || ''
                  }
                  unit={
                    indicadores.find((ind) => ind.value === indicador)?.unit ||
                    ''
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Listado de Instituciones</CardTitle>
              <CardDescription>
                Datos financieros clave de cada entidad.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[480px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Solvencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : filteredInstitutions.length > 0 ? (
                    filteredInstitutions.map((inst) => (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium">
                          {inst.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inst.type === 'Banco' ? 'default' : 'secondary'
                            }
                          >
                            {inst.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {inst.solvencia.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No hay instituciones para mostrar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
