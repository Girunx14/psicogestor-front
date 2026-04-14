import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Brain } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate('/dashboard', { replace: true });
      },
    });
  };

  // Extract error message for display
  const getErrorMessage = () => {
    if (!loginMutation.isError) return null;
    const error = loginMutation.error as { response?: { status?: number } };
    if (error?.response?.status === 429) {
      return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
    }
    return 'Credenciales inválidas. Verifica tu usuario y contraseña.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      {/* Login card */}
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PsicoGestor</h1>
          <p className="text-primary-200 text-sm mt-1">
            Instituto Tecnológico de Villahermosa
          </p>
          <p className="text-primary-300 text-xs mt-0.5">
            Servicio de Psicoterapia — Subdirección Académica
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Iniciar Sesión</h2>
          <p className="text-sm text-secondary-500 mb-6">
            Ingresa tus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Usuario"
              placeholder="Ingresa tu usuario"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              error={errors.password?.message}
              {...register('password')}
            />

            {loginMutation.isError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">
                  {getErrorMessage()}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loginMutation.isPending}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Dev hint */}
          <div className="mt-4 p-3 rounded-lg bg-secondary-50 border border-secondary-100">
            <p className="text-[11px] text-secondary-400 font-medium mb-1">Credenciales de prueba:</p>
            <p className="text-[11px] text-secondary-500">Admin: <code className="bg-secondary-100 px-1 rounded">admin</code> / <code className="bg-secondary-100 px-1 rounded">admin1234</code></p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-300 text-xs mt-6">
          Departamento de Desarrollo Académico
        </p>
      </div>
    </div>
  );
}
