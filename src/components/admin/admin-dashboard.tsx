'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useInstitutionsStream } from '@/hooks/use-institutions-stream';
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
import { Loader2, LogOut, Pencil, Database, RefreshCw } from 'lucide-react';
import Logo from '../shared/logo';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { institutions, loading } = useInstitutionsStream();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleEdit = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedInstitution(null);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const seeded = await seedDatabase();
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
    } catch (error) {
      toast({
        title: 'Error al poblar la base de datos',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <Logo className="h-10 mb-2" />
            <h1 className="text-3xl font-bold text-foreground">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground">
              Gestione los indicadores de las instituciones financieras.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </header>

        <div className="bg-card border rounded-lg shadow-sm">
          <div className="p-6 flex justify-between items-center">
             <h2 className="text-xl font-semibold">Instituciones</h2>
             {institutions.length === 0 && !loading && (
              <Button onClick={handleSeed} disabled={isSeeding}>
                {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4" />}
                Poblar Datos Iniciales
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Solvencia (%)</TableHead>
                  <TableHead className="text-right">Liquidez (%)</TableHead>
                  <TableHead className="text-right">Morosidad (%)</TableHead>
                  <TableHead className="text-right">Activos Totales</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Cargando datos...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : institutions.length > 0 ? (
                  institutions.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.name}</TableCell>
                      <TableCell>{inst.type}</TableCell>
                      <TableCell className="text-right">{inst.solvencia.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{inst.liquidez.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{inst.morosidad.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${(inst.activos_totales / 1_000_000_000).toFixed(2)}B
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
                    <TableCell colSpan={7} className="text-center h-24">
                      No hay instituciones para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
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
