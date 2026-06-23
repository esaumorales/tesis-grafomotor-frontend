import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import NewStudentModal from '../components/modals/NewStudentModal';
import NewEvaluationModal from '../components/modals/NewEvaluationModal';
import AdminDashboardPage from './AdminDashboardPage';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [showNewEvaluation, setShowNewEvaluation] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, statsRes] = await Promise.all([
        api.get('/students/'),
        api.get('/students/stats')
      ]);
      setStudents(studentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.rol !== 'ADMIN') {
      fetchDashboardData();
    }
  }, [user]);

  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  if (user?.rol === 'ADMIN') {
    return <AdminDashboardPage />;
  }

  return (
    <div className="space-y-6 ">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          value={stats ? stats.total_estudiantes : 0} 
          label="Estudiantes Registrados" 
          trendText="" 
          trendUp={true} 
          icon="mdi:account-group-outline" 
        />
        <StatCard 
          value={stats ? stats.evaluaciones_semana : 0} 
          label="Evaluaciones Esta Semana" 
          trendText="" 
          trendUp={true} 
          icon="mdi:file-document-outline" 
        />
        <StatCard 
          value={stats ? stats.no_evaluados_mes : 0} 
          label="No evaluados este mes" 
          trendText="" 
          trendUp={false} 
          icon="mdi:alert-outline" 
        />

        <div 
          onClick={() => setShowNewStudent(true)}
          className="bg-primary hover:bg-primary-hover p-5 rounded-2xl shadow-md flex flex-col justify-center items-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg text-surface group relative overflow-hidden"
        >
           {/* Decoración de fondo */}
           <Icon icon="mdi:account-plus" className="absolute -right-4 -bottom-4 text-9xl text-white/10 group-hover:scale-110 transition-transform" />
           
           <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative z-10 backdrop-blur-sm">
             <Icon icon="mdi:plus" className="text-3xl" />
           </div>
           <h3 className="text-lg font-bold relative z-10">Nuevo Estudiante</h3>
           <p className="text-sm text-surface/80 mt-1 relative z-10">Registrar en el sistema</p>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Table */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-main">Lista Estudiantes</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Buscar Por Nombre" className="pl-9 pr-3 py-1.5 border border-border bg-surface rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48 transition-all" />
              </div>
              <select className="border border-border bg-surface rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:border-primary transition-all">
                <option>Edad</option>
              </select>
              <select className="border border-border bg-surface rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:border-primary transition-all">
                <option>Lateralidad</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-text-muted text-xs uppercase tracking-wider border-y border-border">
                  <th className="px-4 py-3 font-medium">F. Inscripción</th>
                  <th className="px-4 py-3 font-medium">Nombres</th>
                  <th className="px-4 py-3 font-medium">Apellidos</th>
                  <th className="px-4 py-3 font-medium">Edad</th>
                  <th className="px-4 py-3 font-medium">Lateralidad</th>
                  <th className="px-4 py-3 font-medium">Última Evaluación</th>
                </tr>
              </thead>
              <tbody className="text-sm text-text-muted divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                      <Icon icon="mdi:loading" className="animate-spin text-3xl mx-auto mb-2 text-primary" />
                      Cargando estudiantes...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                      No tienes estudiantes registrados. Haz clic en "Nuevo Estudiante" para comenzar.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-primary/5 cursor-pointer transition-colors ${selectedStudent?.id === student.id ? 'bg-primary/10' : ''}`} 
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="px-4 py-3">{new Date(student.fecha_creacion).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-text-main">{student.nombres}</td>
                      <td className="px-4 py-3">{student.apellidos}</td>
                      <td className="px-4 py-3">{calculateAge(student.fecha_nacimiento)}</td>
                      <td className="px-4 py-3">{student.lateralidad}</td>
                      <td className="px-4 py-3">--</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-white flex justify-between items-center text-sm text-text-muted">
            <span className="font-medium">Página 1 de 1</span>
            <div className="flex gap-2">
              <button disabled className="p-1.5 border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon icon="mdi:chevron-left" className="text-xl" />
              </button>
              <button disabled className="p-1.5 border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon icon="mdi:chevron-right" className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Preview & Chart */}
        <div className="space-y-6">
          {/* Estudiante Preview */}
          <div className="bg-white border border-border rounded-2xl shadow-sm p-5 hover-lift">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-text-main">Estudiante</h2>
              {selectedStudent && <div className="w-3 h-3 rounded-full bg-success shadow-sm"></div>}
            </div>
            
            {selectedStudent ? (
              <>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-surface/50 border border-border rounded-xl flex flex-col items-center justify-center text-primary/50">
                    <Icon icon="mdi:account-outline" className="text-6xl" />
                  </div>
                  <div className="text-sm space-y-2 text-text-main">
                    <p><span className="font-semibold text-text-muted">Nombres:</span><br/>{selectedStudent.nombres}</p>
                    <p><span className="font-semibold text-text-muted">Apellidos:</span><br/>{selectedStudent.apellidos}</p>
                    <p><span className="font-semibold text-text-muted">Lateralidad:</span><br/>{selectedStudent.lateralidad}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => navigate(`/estudiante/${selectedStudent.id}`)}
                    className="flex-1 bg-secondary hover:bg-secondary-hover text-surface py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    Ingresar Perfil
                  </button>
                  <button 
                    onClick={() => setShowNewEvaluation(true)}
                    className="flex-1 bg-primary hover:bg-primary-hover text-surface py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    Nueva Evaluación
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-text-muted py-8">
                <Icon icon="mdi:account-search" className="text-5xl mx-auto mb-3 text-border" />
                <p className="text-sm">Selecciona un estudiante de la lista para ver sus detalles</p>
              </div>
            )}
          </div>

          {/* Gráfico de Evolución Preview */}
          <div className="bg-white border border-border rounded-2xl shadow-sm p-5 h-64 flex flex-col hover-lift">
            <h2 className="text-lg font-bold text-text-main mb-3">Gráficos de Evolución</h2>
            <div className="flex-1 flex items-center justify-center bg-surface border border-border rounded-xl text-text-muted">
              <Icon icon="mdi:chart-line" className="text-5xl mr-3 text-border" />
              <span className="text-sm font-medium">Selecciona un estudiante</span>
            </div>
          </div>
        </div>

      </div>

      {showNewStudent && <NewStudentModal onClose={() => setShowNewStudent(false)} onSuccess={() => fetchDashboardData()} />}
      {showNewEvaluation && selectedStudent && (
        <NewEvaluationModal 
          student={selectedStudent}
          onClose={() => setShowNewEvaluation(false)} 
        />
      )}
    </div>
  );
}
