import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Download, Bell } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { usePacientes } from '@/hooks/usePacientes';

const COLORS = ['#1A365D', '#4A5568', '#A0AEC0', '#CBD5E1', '#E2E8F0', '#F1F5F9'];

export default function EstadisticasPage() {
  const { data: pacientesData, isLoading } = usePacientes({ page: 1, per_page: 500 });
  const pacientesList = pacientesData?.items ?? [];

  const stats = useMemo(() => {
    if (pacientesList.length === 0) return null;
    
    const pList = pacientesList as any[];
    const total = pList.length;

    // 1. Padres Separados
    const divorciados = pList.filter((p) => p.padres_separados === true).length;
    const porcentajeDivorciados = ((divorciados / total) * 100).toFixed(1);

    // 2. Sexo
    const sexoMap: Record<string, number> = {};
    pList.forEach((p) => {
      const g = p.sexo === 'M' ? 'Hombres' : p.sexo === 'F' ? 'Mujeres' : 'Otros';
      sexoMap[g] = (sexoMap[g] || 0) + 1;
    });
    const sexoData = Object.keys(sexoMap).map(key => ({ name: key, value: sexoMap[key] }));

    // 3. Semestres
    const semMap: Record<string, number> = {};
    pList.forEach((p) => {
      if (p.semestre) {
        const s = `${p.semestre}°-${p.semestre + 1}°`; // Para agrupar o formato similar
        semMap[s] = (semMap[s] || 0) + 1;
      }
    });
    const semestreData = Object.keys(semMap).sort().map(key => ({ name: key, val: semMap[key] }));

    // 4. Edades
    const edadGrupos = { '18-20': 0, '21-23': 0, '24-26': 0, '27+': 0 };
    let ageSum = 0;
    let ageCount = 0;
    pList.forEach((p) => {
      if (p.fecha_nacimiento) {
        const age = Math.floor((Date.now() - new Date(p.fecha_nacimiento).getTime()) / 31557600000);
        if (age <= 20) edadGrupos['18-20']++;
        else if (age <= 23) edadGrupos['21-23']++;
        else if (age <= 26) edadGrupos['24-26']++;
        else edadGrupos['27+']++;
        ageSum += age;
        ageCount++;
      }
    });
    const promedioEdad = ageCount > 0 ? (ageSum / ageCount).toFixed(1) : 'N/A';
    const edadData = [
      { name: '18-20 años', val: edadGrupos['18-20'] },
      { name: '21-23 años', val: edadGrupos['21-23'] },
      { name: '24-26 años', val: edadGrupos['24-26'] },
      { name: '27+ años', val: edadGrupos['27+'] },
    ].filter(d => d.val > 0);

    // 5. Carreras
    const carreraMap: Record<string, number> = {};
    pList.forEach((p) => {
      const c = p.carrera || 'No registrada';
      carreraMap[c] = (carreraMap[c] || 0) + 1;
    });
    const carreraData = Object.keys(carreraMap)
      .map(key => ({ name: key, val: carreraMap[key], pct: Math.round((carreraMap[key] / total) * 100) }))
      .sort((a, b) => b.val - a.val);

    // Mes actual pacientes resgistrados
    const currMonth = new Date().getMonth();
    const pacientesMes = pList.filter(p => new Date(p.fecha_registro).getMonth() === currMonth).length;

    return { total, porcentajeDivorciados, sexoData, semestreData, edadData, carreraData, promedioEdad, pacientesMes };
  }, [pacientesList]);

  return (
    <>
      {/* Custom Header for Estadísticas to match mockup */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-[#1A365D]">Panel de Estadísticas</h1>
          {/* Faux Period Dropdown */}
          <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-sm text-gray-700 font-medium">
            <Activity size={14} className="mr-2" />
            Viendo Todo el Histórico
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:inline-flex bg-gray-50 border-gray-200">
            <Bell size={16} className="text-gray-500" />
          </Button>
          <Button className="bg-[#1A365D] hover:bg-[#122643]">
            <Download size={16} className="mr-2" />
            EXPORTAR REPORTE
          </Button>
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-8 bg-gray-50/50 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1A365D] border-t-transparent" />
          </div>
        ) : !stats ? (
          <EmptyState
            icon={<Activity size={28} />}
            title="Aún no hay datos suficientes"
            description="Agrega más pacientes al sistema para generar reportes automáticos."
          />
        ) : (
          <>
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border-t-4 border-t-[#1A365D] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <p className="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Total de Pacientes</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">{stats.total}</h2>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">Acumulado registro clínico</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <p className="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Nuevos del Mes</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">{stats.pacientesMes}</h2>
                  <span className="text-sm font-medium text-gray-500">pacientes</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">Alta durante mes actual</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <p className="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Edad Promedio</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">{stats.promedioEdad}</h2>
                  <span className="text-sm font-medium text-gray-500">años</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">Población estudiantil actual</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <p className="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">% Padres Separados</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">{stats.porcentajeDivorciados}%</h2>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">Factor de riesgo familiar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribución por Semestre */}
              <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col border border-gray-100">
                <h3 className="text-lg font-bold text-[#1A365D] mb-1">Distribución por Semestre</h3>
                <p className="text-sm text-gray-500 mb-6">Carga de pacientes por nivel académico</p>
                <div className="h-64 mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.semestreData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                      <BarTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Bar dataKey="val" radius={[2, 2, 0, 0]} fill="#1A365D" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribución por Sexo */}
              <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col border border-gray-100">
                <h3 className="text-lg font-bold text-[#1A365D] mb-1">Distribución por Sexo</h3>
                <p className="text-sm text-gray-500 mb-6">Población atendida</p>
                <div className="h-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={stats.sexoData} 
                        innerRadius={70} 
                        outerRadius={95} 
                        paddingAngle={2} 
                        dataKey="value" 
                        stroke="none"
                      >
                        {stats.sexoData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <PieTooltip contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Etiqueta central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-[#1A365D]">
                      {stats.sexoData.length > 0 ? Math.round((stats.sexoData[0].value / stats.total) * 100) : 0}%
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-1">
                      {stats.sexoData.length > 0 ? stats.sexoData[0].name : ''}
                    </span>
                  </div>
                </div>
                {/* Leyenda manual */}
                <div className="flex flex-col gap-3 mt-4 px-4 w-full max-w-[200px] mx-auto">
                  {stats.sexoData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-[#1A365D]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pacientes por Carrera */}
              <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
                <h3 className="text-lg font-bold text-[#1A365D] mb-6">Pacientes por Carrera</h3>
                <div className="space-y-6">
                  {stats.carreraData.map((carrera, index) => (
                    <div key={carrera.name}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-600 uppercase tracking-widest">{carrera.name}</span>
                        <span className="text-gray-500">{carrera.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${carrera.pct}%`, 
                            backgroundColor: COLORS[index % COLORS.length] 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edades */}
              <div className="bg-white p-6 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
                <h3 className="text-lg font-bold text-[#1A365D] mb-6">Distribución de Edad</h3>
                <div className="space-y-6">
                  {stats.edadData.map((edad, index) => {
                    const pct = Math.round((edad.val / stats.total) * 100);
                    return (
                      <div key={edad.name}>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-gray-600 uppercase tracking-widest">{edad.name}</span>
                          <div className="space-x-2">
                            <span className="text-[#1A365D] px-2 bg-blue-50 rounded-md">{edad.val} p.</span>
                            <span className="text-gray-500">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${pct}%`, 
                              backgroundColor: COLORS[index % COLORS.length] 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </div>
          </>
        )}
      </main>
    </>
  );
}
