import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/students/reports/general');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] animate-pulse">
        <Icon icon="mdi:loading" className="animate-spin text-5xl text-primary opacity-50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
        <Icon icon="mdi:alert-circle-outline" className="text-6xl mb-4 text-danger opacity-80" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Ups, algo salió mal</h2>
        <p>{error}</p>
      </div>
    );
  }

  const isAdmin = user?.rol === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main flex items-center">
            <Icon icon="mdi:chart-bar" className="mr-3 text-primary" />
            {isAdmin ? "Reportes Institucionales" : "Mis Reportes Globales"}
          </h1>
          <p className="text-text-muted mt-2 text-sm font-medium">
            {isAdmin ? "Análisis general del rendimiento y uso del sistema en toda la institución." : "Análisis y evolución del nivel de riesgo de todos tus estudiantes."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Gráfico de Pastel: Riesgos */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 flex flex-col">
          <h3 className="font-bold text-text-main flex items-center text-sm uppercase tracking-wide mb-4">
            <Icon icon="mdi:chart-pie" className="mr-2 text-lg text-primary" />
            Distribución de Riesgos Actuales
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.risk_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {data.risk_distribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs font-semibold text-text-muted">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Barras: Actividad */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 flex flex-col">
          <h3 className="font-bold text-text-main flex items-center text-sm uppercase tracking-wide mb-4">
            <Icon icon="mdi:chart-timeline-variant" className="mr-2 text-lg text-primary" />
            Actividad de Evaluaciones (6 Meses)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="evaluations" name="Evaluaciones" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Gráfico Exclusivo Admin: Rendimiento Docente */}
      {isAdmin && data.evaluations_by_teacher && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 flex flex-col">
          <h3 className="font-bold text-text-main flex items-center text-sm uppercase tracking-wide mb-4">
            <Icon icon="mdi:teach" className="mr-2 text-lg text-primary" />
            Rendimiento por Docente (Evaluaciones Realizadas)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.evaluations_by_teacher} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  allowDecimals={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="teacher_name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
                  width={150}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="evaluations" name="Evaluaciones" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.evaluations_by_teacher.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a78bfa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla Crítica */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-danger/5 flex items-center justify-between">
          <h3 className="font-bold text-danger flex items-center text-sm uppercase tracking-wide">
            <Icon icon="mdi:alert" className="mr-2 text-lg" />
            Estudiantes en Riesgo Alto
          </h3>
          <span className="bg-danger/10 text-danger text-xs font-bold px-3 py-1 rounded-full">
            {data.critical_students.length} detectados
          </span>
        </div>
        
        {data.critical_students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Icon icon="mdi:check-circle-outline" className="text-4xl text-success mx-auto mb-3 opacity-60" />
            <p className="font-medium">Excelente, ningún estudiante se encuentra en riesgo alto actualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50/50 text-xs font-bold text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Fecha de Detección</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.critical_students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center font-bold text-xs">
                          {student.nombres[0]}{student.apellidos[0]}
                        </div>
                        <span className="font-bold text-sm text-text-main">{student.nombres} {student.apellidos}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-muted">
                        {new Date(student.fecha_ultima_evaluacion).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/estudiantes/${student.id}`}
                        className="inline-flex items-center justify-center bg-danger text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                      >
                        Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
