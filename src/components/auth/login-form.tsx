'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Info } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Redirigiendo al panel de administración...',
      });
      router.push('/admin');
    } catch (error: any) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Alert className="mb-6 bg-primary/10 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Cuenta de Demostración</AlertTitle>
        <AlertDescription className="text-primary/80">
          <strong>Email:</strong> admin@infoec.com
          <br />
          <strong>Password:</strong> password123
        </AlertDescription>
      </Alert>
      <Card>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@infoec.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
