import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import PatientLayout from '@/components/layout/PatientLayout';
import ProtectedRoute from '@/router/ProtectedRoute';
import LoginPage from '@/pages/Login/LoginPage';
import BienvenidaPage from '@/pages/Bienvenida/BienvenidaPage';
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

import DashboardPacientePage from '@/pages/PortalPaciente/DashboardPacientePage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/portal',
    element: (
      <ProtectedRoute requiredRole="paciente">
        <PatientLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPacientePage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute requiredRole="psicologo">
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/bienvenida" replace />,
      },
      {
        path: 'bienvenida',
        element: <BienvenidaPage />,
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
