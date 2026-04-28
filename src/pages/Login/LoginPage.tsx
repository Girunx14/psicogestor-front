import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLogin, useLoginPaciente } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

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
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const usernameValue = watch('username', '');
  // El número de control puede tener 7 u 8 dígitos
  const isStudentFormat = /^\d{7,8}$/.test(usernameValue);

  const formatBirthdate = (dateStr: string) => {
    // Convierte DDMMYYYY a YYYY-MM-DD
    if (dateStr.length !== 8) return dateStr;
    const day = dateStr.slice(0, 2);
    const month = dateStr.slice(2, 4);
    const year = dateStr.slice(4, 8);
    return `${year}-${month}-${day}`;
  };

  const onSubmit = (data: LoginForm) => {
    setErrorMessage(null);
    if (isStudentFormat) {
      loginPacienteMutation.mutate(
        { 
          numero_control: data.username, 
          fecha_nacimiento: formatBirthdate(data.password) 
        },
        {
          onSuccess: () => navigate('/portal', { replace: true }),
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { detail?: string } } };
            setErrorMessage(
              err?.response?.data?.detail ||
              'Número de control o fecha de nacimiento incorrectos.',
            );
          },
        },
      );
    } else {
      loginMutation.mutate(data, {
        onSuccess: () => navigate('/bienvenida', { replace: true }),
        onError: (error: unknown) => {
          const err = error as { response?: { status?: number } };
          setErrorMessage(
            err?.response?.status === 429
              ? 'Demasiados intentos. Espera un momento e intenta de nuevo.'
              : 'Credenciales inválidas. Verifica tu usuario y contraseña.',
          );
        },
      });
    }
  };

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={user.rol?.nombre === 'paciente' ? '/portal' : '/bienvenida'}
        replace
      />
    );
  }

  const isPending = loginMutation.isPending || loginPacienteMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B3A6B] px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md px-10 pt-10 pb-11">

        {/* ── Logos ── */}
        <div className="flex items-center justify-center gap-5 mb-6">
          <img
            src="/images/logo-itvh.webp"
            alt="Instituto Tecnológico de Villahermosa"
            className="h-20 w-auto object-contain"
          />
          <div className="w-px h-16 bg-gray-200" />
          <img
            src="/images/logo-tecnm.png"
            alt="Tecnológico Nacional de México"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* ── School name ── */}
        <p className="text-center text-[#1B3A6B] font-bold text-base uppercase tracking-wide leading-snug mb-1">
          Instituto Tecnológico de Villahermosa
        </p>
        <p className="text-center text-gray-400 text-xs mb-6">
          Plataforma de Gestión Psicológica
        </p>

        {/* ── Divider ── */}
        <div className="border-t border-gray-200 mb-6" />

        {/* ── Form title ── */}
        <h1 className="text-center text-[#1B3A6B] font-bold text-sm uppercase tracking-widest mb-5">
          Iniciar Sesión
        </h1>

        {/* ── Student badge ── */}
        {isStudentFormat && (
          <div className="flex items-center justify-center gap-1.5 mb-4 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 w-fit mx-auto text-emerald-700 text-xs font-semibold">
            <GraduationCap size={13} />
            Modo Acceso Estudiantil
          </div>
        )}

        {/* ── Error ── */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs leading-snug"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-username" className="text-xs font-semibold text-gray-700">
              {isStudentFormat ? 'Número de Control' : 'Número de Control'}
            </label>
            <input
              id="login-username"
              placeholder={isStudentFormat ? 'Ej: 22300608' : 'Número de Control'}
              autoComplete="username"
              className={`w-full h-11 px-3.5 rounded-lg border bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none transition
                focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/15 focus:bg-white
                ${errors.username ? 'border-red-400' : 'border-gray-300'}`}
              {...register('username')}
            />
            {errors.username && (
              <span role="alert" className="text-xs text-red-500">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-gray-700">
              {isStudentFormat ? 'Fecha de Nacimiento' : 'Contraseña'}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={isStudentFormat ? 'text' : showPassword ? 'text' : 'password'}
                placeholder={isStudentFormat ? 'DDMMYYYY — Ej: 31122006' : 'Contraseña'}
                autoComplete={isStudentFormat ? 'off' : 'current-password'}
                className={`w-full h-11 px-3.5 rounded-lg border bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none transition
                  focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/15 focus:bg-white
                  ${!isStudentFormat ? 'pr-11' : ''}
                  ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                {...register('password')}
              />
              {!isStudentFormat && (
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            {errors.password && (
              <span role="alert" className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="mt-2 w-full h-11 rounded-lg bg-[#1B3A6B] hover:bg-[#14306b] active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed
              text-white text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                Verificando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* ── Hint ── */}
        <p className="mt-5 text-center text-xs text-gray-400 leading-relaxed">
          Si eres estudiante, ingresa tu número de control de 7 u 8 dígitos y tu fecha de
          nacimiento en formato <strong className="text-gray-500">DDMMYYYY</strong>.
        </p>
      </div>
    </div>
  );
}