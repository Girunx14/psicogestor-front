import Topbar from '@/components/layout/Topbar';
import Card from '@/components/ui/Card';

export default function EstadisticasPage() {
  return (
    <>
      <Topbar title="Estadísticas" subtitle="Panel de análisis del servicio" />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <Card>
          <div className="text-center py-12">
            <p className="text-lg font-medium text-gray-900 mb-2">Estadísticas por Paciente</p>
            <p className="text-sm text-secondary-500 max-w-md mx-auto">
              Las estadísticas individuales están disponibles dentro del expediente de cada paciente.
              Navega a <strong>Pacientes → Detalle del paciente</strong> para ver sus estadísticas clínicas.
            </p>
          </div>
        </Card>
      </main>
    </>
  );
}
