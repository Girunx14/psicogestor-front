import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { usePacientes } from '@/hooks/usePacientes';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6', '#EC4899'];

export default function EstadisticasPage() {
  const { data: pacientesData, isLoading } = usePacientes({ page: 1, per_page: 500 }); // Fetch sufficient for stats
  const pacientesList = pacientesData?.items ?? [];

  // Cálculos dinámicos
  const stats = useMemo(() => {
    if (pacientesList.length === 0) return null;

    // 1. Padres Separados
    const divorciados = pacientesList.filter(p => p.padres_separados === true).length;
    const juntos = pacientesList.length - divorciados;
    const padresData = [
      { name: 'Padres Juntos', value: juntos },
      { name: 'Padres Separados', value: divorciados },
    ].filter(d => d.value > 0);

    // 2. Sexo
    const sexoMap: Record<string, number> = {};
    pacientesList.forEach(p => {
      const g = p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : p.sexo === 'NB' ? 'No Binario' : 'No Esp.';
      sexoMap[g] = (sexoMap[g] || 0) + 1;
    });
    const sexoData = Object.keys(sexoMap).map(key => ({ name: key, value: sexoMap[key] }));

    // 3. Semestres
    const semMap: Record<string, number> = {};
    pacientesList.forEach(p => {
      if (p.semestre) {
        const s = `${p.semestre}°`;
        semMap[s] = (semMap[s] || 0) + 1;
      }
    });
    const semestreData = Object.keys(semMap).sort().map(key => ({ name: key, val: semMap[key] }));

    // 4. Edades
    const edadGrupos = { '18-20': 0, '21-23': 0, '24-26': 0, '27+': 0 };
    pacientesList.forEach(p => {
      if (p.fecha_nacimiento) {
        const age = Math.floor((Date.now() - new Date(p.fecha_nacimiento).getTime()) / 31557600000);
        if (age <= 20) edadGrupos['18-20']++;
        else if (age <= 23) edadGrupos['21-23']++;
        else if (age <= 26) edadGrupos['24-26']++;
        else edadGrupos['27+']++;
      }
    });
    const edadData = [
      { name: '18-20 años', val: edadGrupos['18-20'] },
      { name: '21-23 años', val: edadGrupos['21-23'] },
      { name: '24-26 años', val: edadGrupos['24-26'] },
      { name: '27+ años', val: edadGrupos['27+'] },
    ].filter(d => d.val > 0);

    return { padresData, sexoData, semestreData, edadData };
  }, [pacientesList]);

  return (
    <>
      <Topbar title="Estadísticas Generales" subtitle="Métricas y datos demográficos del servicio clínico" />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : !stats ? (
          <Card>
            <EmptyState
              icon={<Activity size={28} />}
              title="Aún no hay datos suficientes"
              description="Las estadísticas se generarán automáticamente en cuanto agregues pacientes e información clínica al sistema."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfica: Distribución por Semestre */}
            <Card className="shadow-sm border-secondary-200 !p-6 rounded-2xl bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Distribución por semestre</h3>
              <p className="text-sm text-secondary-500 mb-6">Cantidad de pacientes según su semestre actual</p>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.semestreData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} allowDecimals={false} />
                    <BarTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]} fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Gráfica: Distribución por Edad */}
            <Card className="shadow-sm border-secondary-200 !p-6 rounded-2xl bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grupos de Edad</h3>
              <p className="text-sm text-secondary-500 mb-6">Rango de edades de los pacientes atendidos</p>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.edadData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={80} />
                    <BarTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="val" radius={[0, 4, 4, 0]} fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Gráfica: Estructura Familiar (Padres Separados) */}
            <Card className="shadow-sm border-secondary-200 !p-6 rounded-2xl bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Estructura Familiar</h3>
              
              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.padresData} innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                      {stats.padresData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <PieTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {stats.padresData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Gráfica: Proporción por Sexo */}
            <Card className="shadow-sm border-secondary-200 !p-6 rounded-2xl bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Proporción por Sexo</h3>
              
              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.sexoData} innerRadius={0} outerRadius={100} paddingAngle={0} dataKey="value" stroke="#fff" strokeWidth={2}>
                      {stats.sexoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <PieTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {stats.sexoData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                    <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        )}
      </main>
    </>
  );
}
