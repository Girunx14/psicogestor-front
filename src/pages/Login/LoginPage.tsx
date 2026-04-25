import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLogin, useLoginPaciente } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario o número de control es requerido'),
  password: z.string().min(1, 'La contraseña o fecha de nacimiento es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const loginPacienteMutation = useLoginPaciente();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const usernameValue = watch('username', '');

  const isStudentFormat = /^\d{8}$/.test(usernameValue);

  const onSubmit = (data: LoginForm) => {
    setErrorMessage(null);

    if (isStudentFormat) {
      loginPacienteMutation.mutate(
        { numero_control: data.username, fecha_nacimiento: data.password },
        {
          onSuccess: () => {
            navigate('/portal', { replace: true });
          },
          onError: (error: unknown) => {
            console.error('Login paciente error:', error);
            const err = error as { response?: { data?: { detail?: string } } };
            setErrorMessage(err?.response?.data?.detail || 'Número de control o fecha de nacimiento incorrectos.');
          },
        },
      );
    } else {
      loginMutation.mutate(data, {
        onSuccess: () => {
          navigate('/bienvenida', { replace: true });
        },
        onError: (error: unknown) => {
          const err = error as { response?: { status?: number } };
          if (err?.response?.status === 429) {
            setErrorMessage('Demasiados intentos. Espera un momento e intenta de nuevo.');
          } else {
            setErrorMessage('Credenciales inválidas. Verifica tu usuario y contraseña.');
          }
        },
      });
    }
  };

  if (isAuthenticated && user) {
    return <Navigate to={user.rol?.nombre === 'paciente' ? '/portal' : '/bienvenida'} replace />;
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #1A365D 0%, #742A2A 100%)' }}
    >
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
        <div className="flex flex-col items-start gap-6 mb-8">
          <img
            src="/images/logo-itvh.webp"
            alt="ITVH"
            className="h-24 w-auto"
          />
          <img
            src="/images/logo-tecnm.png"
            alt="TecNM"
            className="h-16 w-auto"
          />
        </div>
        <h1
          className="text-6xl xl:text-7xl font-bold text-white tracking-tight mb-4"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          BIENVENIDOS
        </h1>
        <p className="text-xl text-white/90 font-medium">
          Plataforma de Gestión Psicológica
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo header */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <img
              src="/images/logo-itvh.webp"
              alt="ITVH"
              className="h-16 w-auto"
            />
            <img
              src="/images/logo-tecnm.png"
              alt="TecNM"
              className="h-12 w-auto"
            />
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-[0_25px_70px_-10px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-xl font-bold text-[#1A365D] mb-2">
                INICIAR SESIÓN
              </h2>
              <div className="h-1 w-16 bg-[#1A365D] rounded-full"></div>
              {isStudentFormat && (
                <p className="text-xs text-green-600 mt-2">Modo: Acceso Estudiantil</p>
              )}
            </div>

            <div className="p-8">
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label={isStudentFormat ? 'Número de Control' : 'Usuario'}
                  placeholder={isStudentFormat ? 'Ej: 22300608' : 'Usuario'}
                  error={errors.username?.message}
                  {...register('username')}
                />
                <Input
                  label={isStudentFormat ? 'Fecha de Nacimiento' : 'Contraseña'}
                  type={isStudentFormat ? 'text' : 'password'}
                  placeholder={isStudentFormat ? 'DDMMYYYY - Ej: 31122006' : ''}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold mt-6"
                  isLoading={loginMutation.isPending || loginPacienteMutation.isPending}
                >
                  INGRESAR
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Si eres estudiante, ingresa tu número de control y fecha de nacimiento (DDMMYYYY).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}