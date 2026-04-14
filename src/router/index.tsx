import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/router/ProtectedRoute';
import LoginPage from '@/pages/Login/LoginPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import PacientesListPage from '@/pages/Pacientes/PacientesListPage';
import PacienteNuevoPage from '@/pages/Pacientes/PacienteNuevoPage';
import PacienteDetallePage from '@/pages/Pacientes/PacienteDetallePage';
import PacienteEditarPage from '@/pages/Pacientes/PacienteEditarPage';
import NuevaSesionPage from '@/pages/Sesiones/NuevaSesionPage';
import CitasPage from '@/pages/Citas/CitasPage';
import HorariosPage from '@/pages/Horarios/HorariosPage';
import EstadisticasPage from '@/pages/Estadisticas/EstadisticasPage';
import UsuariosPage from '@/pages/Usuarios/UsuariosPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'pacientes',
        element: <PacientesListPage />,
      },
      {
        path: 'pacientes/nuevo',
        element: <PacienteNuevoPage />,
      },
      {
        path: 'pacientes/:id',
        element: <PacienteDetallePage />,
      },
      {
        path: 'pacientes/:id/editar',
        element: <PacienteEditarPage />,
      },
      {
        path: 'pacientes/:id/notas/nueva',
        element: <NuevaSesionPage />,
      },
      {
        path: 'citas',
        element: <CitasPage />,
      },
      {
        path: 'horarios',
        element: <HorariosPage />,
      },
      {
        path: 'estadisticas',
        element: <EstadisticasPage />,
      },
      // Admin-only routes
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute requiredRole="administrador">
            <UsuariosPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
