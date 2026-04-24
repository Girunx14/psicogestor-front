import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLogin, useLoginPaciente } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const loginStaffSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const loginPacienteSchema = z.object({
  numero_control: z.string().min(1, 'El número de control es requerido'),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
});

type LoginStaffForm = z.infer<typeof loginStaffSchema>;
type LoginPacienteForm = z.infer<typeof loginPacienteSchema>;

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'staff' | 'paciente'>('staff');
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const loginPacienteMutation = useLoginPaciente();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // Hooks must be called before any early return!
  // Forms
  const {
    register: registerStaff,
    handleSubmit: handleSubmitStaff,
    formState: { errors: errorsStaff },
  } = useForm<LoginStaffForm>({
    resolver: zodResolver(loginStaffSchema),
  });

  const {
    register: registerPaciente,
    handleSubmit: handleSubmitPaciente,
    formState: { errors: errorsPaciente },
  } = useForm<LoginPacienteForm>({
    resolver: zodResolver(loginPacienteSchema),
  });

  // Submits
  const onSubmitStaff = (data: LoginStaffForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.rol?.nombre === 'paciente') {
          navigate('/portal', { replace: true });
        } else {
          navigate('/bienvenida', { replace: true });
        }
      },
    });
  };

  const onSubmitPaciente = (data: LoginPacienteForm) => {
    loginPacienteMutation.mutate(data, {
      onSuccess: () => {
        navigate('/portal', { replace: true });
      },
    });
  };

  // Errors
  const getErrorMessage = () => {
    const isError = authMode === 'staff' ? loginMutation.isError : loginPacienteMutation.isError;
    const error: any = authMode === 'staff' ? loginMutation.error : loginPacienteMutation.error;
    
    if (!isError) return null;
    if (error?.response?.status === 429) {
      return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
    }
    return authMode === 'staff' 
      ? 'Credenciales inválidas. Verifica tu usuario y contraseña.' 
      : 'No encontramos tu expediente. Verifica tu número de control y fecha de nacimiento.';
  };

  const isPending = authMode === 'staff' ? loginMutation.isPending : loginPacienteMutation.isPending;

  // If already logged in, redirect (after all hooks are called)
  if (isAuthenticated && user) {
    if (user.rol?.nombre === 'paciente') {
      return <Navigate to="/portal" replace />;
    } else {
      return <Navigate to="/bienvenida" replace />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Servicio de Psicoterapia
          </h1>
        </div>

        {/* Form panel */}
        <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden ring-1 ring-black/5">
          
          {/* Toggles */}
          <div className="flex bg-gray-50 border-b border-gray-100 p-2 gap-2">
            <button 
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                authMode === 'staff' ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthMode('staff')}
            >
              Consultorio
            </button>
            <button 
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                authMode === 'paciente' ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthMode('paciente')}
            >
              Paciente
            </button>
          </div>

          <div className="p-8 sm:p-10">
            {getErrorMessage() && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {getErrorMessage()}
              </div>
            )}

            {authMode === 'staff' ? (
              <form onSubmit={handleSubmitStaff(onSubmitStaff)} className="space-y-5">
                <Input
                  label="Usuario"
                  error={errorsStaff.username?.message}
                  {...registerStaff('username')}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  error={errorsStaff.password?.message}
                  {...registerStaff('password')}
                />
                <Button type="submit" className="w-full h-12 text-base font-semibold mt-8" isLoading={isPending}>
                  Iniciar Sesión
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmitPaciente(onSubmitPaciente)} className="space-y-5">
                <Input
                  label="Número de Control"
                  placeholder="Ej. 18320000"
                  error={errorsPaciente.numero_control?.message}
                  {...registerPaciente('numero_control')}
                />
                <Input
                  label="Fecha de Nacimiento"
                  type="date"
                  error={errorsPaciente.fecha_nacimiento?.message}
                  {...registerPaciente('fecha_nacimiento')}
                />
                <Button type="submit" className="w-full h-12 text-base font-semibold mt-8" isLoading={isPending}>
                  Entrar al Portal
                </Button>
              </form>
            )}
            
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200/80 text-sm mt-8 font-medium">
          &copy; {new Date().getFullYear()} Instituto Tecnológico de Villahermosa
        </p>
      </div>
    </div>
  );
}
