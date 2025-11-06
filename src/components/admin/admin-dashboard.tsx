'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase';
import type { DataItem, DataItemCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DataItemForm } from './institution-form';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/firestore-service';
import {
  Loader2,
  LogOut,
  Pencil,
  Database,
  Building,
  School,
  Hospital,
  PlusCircle,
  Home,
  ShieldCheck,
  BarChart,
} from 'lucide-react';
import Logo from '../shared/logo';
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
} from 'recharts';
import { collection } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryIndicators } from '@/lib/types';

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
        {!data || data.length === 0 ? (
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
                  tickFormatter={(value) => value.slice(0, 3)}
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
};

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [activeTab, setActiveTab] =
    useState<DataItemCategory>('Bancos');

  const dataItemsQuery = useMemoFirebase(
    () =>
      !isUserLoading && user && firestore
        ? collection(firestore, 'institutions')
        : null,
    [firestore, user, isUserLoading]
  );
  
  const { data: allDataItems, isLoading: loading, error } = useCollection<DataItem>(dataItemsQuery);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDataItem, setSelectedDataItem] = useState<DataItem | null>(
    null
  );
  const [isSeeding, setIsSeeding] = useState(false);

  const filteredData = useMemo(() => {
    return allDataItems?.filter(item => item.category === activeTab) || [];
  }, [allDataItems, activeTab]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const handleEdit = (item: DataItem) => {
    setSelectedDataItem(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedDataItem(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDataItem(null);
  };

  const handleSeed = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
      await seedDatabase(firestore);
      toast({
        title: 'Base de datos poblada',
        description:
          'Se han añadido datos de ejemplo para todas las categorías.',
      });
    } catch (error: any) {
      toast({
        title: 'Error al poblar la base de datos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const stats = useMemo(() => {
    if (!allDataItems) {
      return { total: 0, banks: 0, universities: 0, hospitals: 0 };
    }
    return {
      total: allDataItems.length,
      banks: allDataItems.filter((d) => d.category === 'Bancos').length,
      universities: allDataItems.filter((d) => d.category === 'Universidades').length,
      hospitals: allDataItems.filter((d) => d.category === 'Hospitales').length,
    };
  }, [allDataItems]);
  
  const chartData = useMemo(() => {
    return (
      filteredData?.map((item) => ({
        name: item.name,
        color: item.color || '#8884d8',
        ...item.indicators,
      })) || []
    );
  }, [filteredData]);

  const isDatabaseEmpty = !loading && (!allDataItems || allDataItems.length === 0);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6 bg-muted/40 min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <div>
          <Logo className="h-10 mb-2" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Gestione los indicadores de las diferentes categorías.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Link href="/" passHref>
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Página Principal
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Elementos
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bancos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.banks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Universidades</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.universities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hospitales</CardTitle>
            <Hospital className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hospitals}</div>
          </CardContent>
        </Card>
      </main>

       <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as DataItemCategory)} className="w-full">
        <TabsList>
          <TabsTrigger value="Bancos">Bancos</TabsTrigger>
          <TabsTrigger value="Universidades">Universidades</TabsTrigger>
          <TabsTrigger value="Hospitales">Hospitales</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 mt-4">
              <div className="lg:col-span-3 space-y-4">
                {(categoryIndicators[activeTab] || []).map(indicator => (
                  <CustomBarChart
                    key={indicator}
                    data={chartData}
                    dataKey={indicator}
                    label={indicator}
                    unit={indicator.includes('Tiempo') ? 'min' : '%'}
                  />
                ))}
              </div>
              <Card className="lg:col-span-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Lista de {activeTab}</CardTitle>
                    <CardDescription>
                      Cree, edite o pueble la base de datos con datos de ejemplo.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isDatabaseEmpty && (
                      <Button onClick={handleSeed} disabled={isSeeding}>
                        {isSeeding ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Database className="mr-2 h-4 w-4" />
                        )}
                        Poblar Datos
                      </Button>
                    )}
                    <Button onClick={handleAddNew}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nuevo Elemento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                   {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                       <ShieldCheck className="h-16 w-16 text-destructive mb-4" />
                       <h3 className="text-xl font-semibold text-destructive">Error de Permisos</h3>
                       <p className="text-muted-foreground mt-2">
                         No se pudieron cargar los datos de Firestore.
                       </p>
                       <p className="text-xs text-muted-foreground mt-1">
                         Es probable que las reglas de seguridad desplegadas en tu proyecto de Firebase no permitan la lectura.
                       </p>
                    </div>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        {(categoryIndicators[activeTab] || []).map(key => (
                            <TableHead key={key} className="text-right">{key}</TableHead>
                        ))}
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={categoryIndicators[activeTab].length + 2} className="text-center h-24">
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                              Cargando datos...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredData.length > 0 ? (
                        filteredData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#ccc' }} />
                                {item.name}
                            </TableCell>
                            {(categoryIndicators[activeTab] || []).map(key => (
                                <TableCell key={key} className="text-right">
                                    {item.indicators[key]?.toFixed(2) ?? 'N/A'}
                                    {key.includes('Tiempo') ? 'min' : '%'}
                                </TableCell>
                            ))}
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={categoryIndicators[activeTab].length + 2} className="text-center h-24">
                             No hay datos para mostrar en esta categoría.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </div>
        </TabsContent>
      </Tabs>
      

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DataItemForm
            dataItem={selectedDataItem}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
