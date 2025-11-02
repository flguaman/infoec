import LoginForm from "@/components/auth/login-form";
import Logo from "@/components/shared/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
           <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">
          Acceso Administrador
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Ingrese sus credenciales para gestionar los datos.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
