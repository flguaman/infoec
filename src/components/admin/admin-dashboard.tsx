'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useCollection, useMemoFirebase } from '@/firebase';
import type { Institution } from '@/lib/types';
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
import { InstitutionForm } from './institution-form';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/firestore-service';
import {
  Loader2,
  LogOut,
  Pencil,
  Database,
  Building,
  Landmark,
  ShieldCheck,
  PlusCircle,
  Home,
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
  Cell,
} from 'recharts';
import { collection, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const CustomBarChart = ({ data, dataKey, label, unit }: { data: any[], dataKey: string, label: string, unit:string }) => {
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label: label,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa de {label}</CardTitle>
        <CardDescription>
          Visualización del indicador de {label.toLowerCase()} de cada institución.
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
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
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
              <Bar dataKey={dataKey} radius={8}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
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

  const institutionsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'institutions')) : null),
    [firestore]
  );
  const { data: institutions, isLoading: loading } =
    useCollection<Institution>(institutionsQuery);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const handleEdit = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedInstitution(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedInstitution(null);
  };

  const handleSeed = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
      const seeded = await seedDatabase(firestore);
      if (seeded) {
        toast({
          title: 'Base de datos poblada',
          description: 'Se han añadido 5 instituciones de ejemplo.',
        });
      } else {
        toast({
          title: 'Base de datos ya poblada',
          description: 'No se realizaron cambios.',
        });
      }
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
    if (!institutions) {
      return {
        total: 0,
        banks: 0,
        cooperatives: 0,
        avgSolvency: 0,
      };
    }
    const banks = institutions.filter((inst) => inst.type === 'Banco').length;
    const cooperatives = institutions.filter(
      (inst) => inst.type === 'Cooperativa'
    ).length;
    const totalSolvency = institutions.reduce(
      (acc, inst) => acc + inst.solvencia,
      0
    );
    const avgSolvency =
      institutions.length > 0 ? totalSolvency / institutions.length : 0;

    return {
      total: institutions.length,
      banks,
      cooperatives,
      avgSolvency,
    };
  }, [institutions]);

  const chartData = useMemo(() => {
    return (
      institutions?.map((inst) => ({
        name: inst.name,
        solvencia: inst.solvencia,
        liquidez: inst.liquidez,
        morosidad: inst.morosidad,
        color: inst.color || (inst.type === 'Banco' ? 'var(--color-bancos)' : 'var(--color-cooperativas)'),
      })) || []
    );
  }, [institutions]);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6 bg-muted/40 min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <div>
          <Logo className="h-10 mb-2" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Visualice y gestione los indicadores de las instituciones financieras.
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
              Instituciones Totales
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bancos</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.banks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cooperativas</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cooperatives}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solvencia Promedio
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgSolvency.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </main>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-3 space-y-4">
           <CustomBarChart data={chartData} dataKey="solvencia" label="Solvencia" unit="%" />
           <CustomBarChart data={chartData} dataKey="liquidez" label="Liquidez" unit="%" />
           <CustomBarChart data={chartData} dataKey="morosidad" label="Morosidad" unit="%" />
        </div>
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lista de Instituciones</CardTitle>
              <CardDescription>
                Cree o edite los indicadores financieros.
              </CardDescription>
            </div>
            <div className="flex gap-2">
            {(!institutions || institutions.length === 0) && !loading && (
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
                Nueva Institución
            </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Solvencia</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Cargando datos...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : institutions && institutions.length > 0 ? (
                  institutions.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: inst.color || '#ccc' }} />
                        {inst.name}
                      </TableCell>
                      <TableCell>{inst.type}</TableCell>
                      <TableCell className="text-right">
                        {inst.solvencia.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(inst)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No hay instituciones para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <InstitutionForm
            institution={selectedInstitution}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
