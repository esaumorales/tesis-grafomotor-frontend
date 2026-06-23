import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import EvolutionChart from '../components/student/EvolutionChart';
import ShapDashboardChart from '../components/student/ShapDashboardChart';
import RadarSkillsChart from '../components/student/RadarSkillsChart';
import DiagnosisDonutChart from '../components/student/DiagnosisDonutChart';
import NewEvaluationModal from '../components/modals/NewEvaluationModal';
import EvaluationResultModal from '../components/modals/EvaluationResultModal';
import api from '../services/api';

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showNewEvaluation, setShowNewEvaluation] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoModal, setInfoModal] = useState<{title: string, text: string} | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(false);
  const fetchData = async () => {
    try {
      if (!id) return;
      const [studentRes, evalRes] = await Promise.all([
        api.get(`/students/${id}`),
        api.get(`/students/${id}/evaluations`)
      ]);
      setStudent(studentRes.data);
      const sortedEvals = evalRes.data.sort((a: any, b: any) => new Date(b.fecha_creacion || b.fecha_evaluacion).getTime() - new Date(a.fecha_creacion || a.fecha_evaluacion).getTime());
      setEvaluations(sortedEvals);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDeleteEvaluation = async (evaluationId: string) => {
    try {
      await api.delete(`/students/${id}/evaluations/${evaluationId}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      alert('Error al eliminar la evaluación');
    }
  };

  const handleDeleteStudent = async () => {
    try {
      await api.delete(`/students/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error al eliminar el estudiante');
    }
  };

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <Icon icon="mdi:loading" className="animate-spin text-4xl mb-2" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-500">
        <Icon icon="mdi:account-alert-outline" className="text-4xl mb-2" />
        <p>Estudiante no encontrado</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 underline">Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-slate-600 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => navigate('/dashboard')}>
          <Icon icon="mdi:arrow-left" className="mr-2 text-xl" />
          <span className="font-medium">Volver a Estudiantes</span>
        </div>
        <button 
          onClick={() => setShowNewEvaluation(true)}
          className="bg-primary hover:bg-primary-hover text-surface px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center hover:-translate-y-0.5"
        >
          <Icon icon="mdi:plus-circle-outline" className="mr-2 text-lg" />
          Nueva Evaluación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Foto y Acciones */}
        <div className="bg-white border border-border shadow-sm p-6 rounded-2xl flex flex-col items-center hover-lift">
          <h2 className="text-lg font-bold text-text-main w-full mb-6 text-center border-b border-border pb-3">Estudiante</h2>
          <div className="w-32 h-32 bg-primary/5 border-2 border-dashed border-primary/30 rounded-full flex items-center justify-center text-primary/50 mb-6 relative overflow-hidden group">
            <Icon icon="mdi:account-outline" className="text-6xl group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex gap-3 w-full justify-center mt-2">
            <button className="flex items-center justify-center gap-2 flex-1 border border-border hover:border-primary hover:bg-primary/5 text-text-muted hover:text-primary py-2 rounded-xl text-sm font-semibold transition-all">
              <Icon icon="mdi:pencil-outline" className="text-lg" />
              Editar
            </button>
            {confirmDeleteStudent ? (
              <div className="flex flex-col flex-1 border border-danger/30 bg-danger/5 py-1 px-2 rounded-xl text-sm transition-all justify-center items-center">
                <span className="text-[10px] font-bold text-danger mb-1 text-center leading-tight">¿Eliminar permanentemente?</span>
                <div className="flex gap-2 w-full justify-center">
                  <button onClick={handleDeleteStudent} className="bg-danger text-white text-xs font-bold px-3 py-1 rounded-lg hover:bg-red-600 transition-colors shadow-sm">Sí</button>
                  <button onClick={() => setConfirmDeleteStudent(false)} className="bg-surface text-text-muted border border-border hover:text-text-main text-xs font-bold px-3 py-1 rounded-lg transition-colors">No</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDeleteStudent(true)} className="flex items-center justify-center gap-2 flex-1 border border-border hover:border-danger hover:bg-danger/5 text-text-muted hover:text-danger py-2 rounded-xl text-sm font-semibold transition-all">
                <Icon icon="mdi:trash-can-outline" className="text-lg" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Datos Personales */}
        <div className="md:col-span-2 bg-white border border-border shadow-sm p-6 rounded-2xl hover-lift">
          <h2 className="text-lg font-bold text-text-main mb-6 border-b border-border pb-3">Datos Personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Nombres</p>
              <p className="text-text-main font-bold text-base">{student.nombres}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Apellidos</p>
              <p className="text-text-main font-bold text-base">{student.apellidos}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">F. Nacimiento</p>
              <p className="text-text-main font-bold text-base">{new Date(student.fecha_nacimiento).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Edad</p>
              <p className="text-text-main font-bold text-base">{calculateAge(student.fecha_nacimiento)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Mano Dominante</p>
              <p className="text-text-main font-bold text-base">{student.lateralidad}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">F. Registro</p>
              <p className="text-text-main font-bold text-base">{new Date(student.fecha_creacion).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-8 bg-surface p-4 rounded-xl border border-border/50">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Notas Clínicas / Médicas</p>
            <p className="text-text-main text-sm">{student.notas_clinicas || 'Ninguna observación.'}</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Historial de Evaluaciones */}
        <div className="bg-white border border-border shadow-sm rounded-2xl flex flex-col hover-lift overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-main">Historial de Evaluaciones</h2>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[280px]">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-slate-50 border-y border-border">
                <tr className="text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Hora</th>
                  <th className="px-5 py-3 font-medium">Can. Figuras</th>
                  <th className="px-5 py-3 font-medium">Puntaje</th>
                  <th className="px-5 py-3 font-medium">Nota</th>
                  <th className="px-5 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm text-text-main divide-y divide-border">
                {evaluations.length === 0 ? (
                  <tr>
                     <td colSpan={6} className="px-5 py-10 text-center text-text-muted">
                        <Icon icon="mdi:file-document-outline" className="text-4xl mx-auto mb-2 opacity-50" />
                        No hay evaluaciones todavía. ¡Haz la primera!
                     </td>
                  </tr>
                ) : (
                  evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-5 py-3">{new Date(ev.fecha_evaluacion).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-text-muted">{new Date(ev.fecha_evaluacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-5 py-3">{ev.hojas?.length || 1} Hojas</td>
                      <td className="px-5 py-3 font-medium">{ev.confianza_ia.toFixed(1)}%</td>
                      <td className="px-5 py-3">
                         <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${ev.clase_predicha === 0 ? 'bg-success/10 text-success' : ev.clase_predicha === 1 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                           {ev.clase_predicha === 0 ? 'Normal' : ev.clase_predicha === 1 ? 'Riesgo Leve' : 'Riesgo Alto'}
                         </span>
                      </td>
                      <td className="px-5 py-3 relative min-w-[120px]">
                        {confirmDeleteId === ev.id && (
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10 flex gap-2 items-center justify-center bg-white p-2 rounded-xl border border-danger/30 shadow-lg w-max animate-fade-in">
                            <span className="text-[11px] font-bold text-danger uppercase tracking-wider mr-1">¿Eliminar?</span>
                            <button onClick={() => setConfirmDeleteId(null)} className="text-[11px] font-bold text-text-muted hover:text-text-main px-2.5 py-1.5 bg-surface border border-border rounded-lg transition-colors">Cancelar</button>
                            <button onClick={() => handleDeleteEvaluation(ev.id)} className="text-[11px] font-bold bg-danger text-white px-2.5 py-1.5 rounded-lg hover:bg-red-600 shadow-sm transition-colors">Sí, borrar</button>
                          </div>
                        )}
                        
                        <div className={`flex gap-2 text-lg justify-end w-full transition-opacity ${confirmDeleteId === ev.id ? 'opacity-0' : 'opacity-100'}`}>
                          <button 
                            onClick={() => setSelectedEvaluation(ev)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Ver Resultados"
                          >
                            <Icon icon="mdi:eye-outline" />
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(ev.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Eliminar Evaluación"
                          >
                            <Icon icon="mdi:trash-can-outline" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white border border-border shadow-sm p-5 rounded-2xl hover-lift relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-text-main">Evolución del Estudiante</h2>
            <button 
              onClick={() => setInfoModal({
                title: 'Evolución del Estudiante',
                text: 'Muestra la progresión del puntaje de confianza (0 a 100%) a lo largo del tiempo. Te permite ver rápidamente si el estudiante está mejorando o empeorando en sus evaluaciones recientes.'
              })}
              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
              title="¿Qué es esto?"
            >
              <Icon icon="mdi:help-circle-outline" className="text-xl" />
            </button>
          </div>
          <EvolutionChart evaluations={evaluations} />
        </div>

      </div>

      {/* Nueva fila de gráficos pedagógicos basados en la última evaluación */}
      {evaluations.length > 0 && (
        <div className="pt-4">
          <h2 className="text-lg font-bold text-text-main mb-4 flex items-center">
            <Icon icon="mdi:chart-box-outline" className="mr-2 text-xl text-primary" />
            Análisis de la Última Evaluación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Gráfico SHAP */}
            <div className="bg-white border border-border shadow-sm p-6 rounded-2xl flex flex-col hover-lift relative">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center">
                   <Icon icon="mdi:brain" className="text-xl text-primary mr-2" />
                   <h3 className="text-base font-bold text-text-main">Caracteristicas del Trazo</h3>
                 </div>
                 <button 
                   onClick={() => setInfoModal({
                     title: 'Caracteristicas del Trazo',
                     text: 'Muestra qué partes o características del dibujo influyeron más en la decisión final de la Inteligencia Artificial. Entre mayor sea el porcentaje, más determinante fue ese aspecto para calcular el riesgo.'
                   })}
                   className="p-1 rounded text-text-muted hover:text-primary transition-colors"
                   title="¿Qué es esto?"
                 >
                   <Icon icon="mdi:help-circle-outline" className="text-lg" />
                 </button>
              </div>
              <div className="flex-1">
                <ShapDashboardChart evaluation={evaluations[0]} />
              </div>
            </div>

            {/* Radar Habilidades */}
            <div className="bg-white border border-border shadow-sm p-6 rounded-2xl flex flex-col hover-lift relative">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center">
                   <Icon icon="mdi:radar" className="text-xl text-secondary mr-2" />
                   <h3 className="text-base font-bold text-text-main">Perfil de Habilidades</h3>
                 </div>
                 <button 
                   onClick={() => setInfoModal({
                     title: 'Perfil de Habilidades',
                     text: 'Un gráfico de radar que evalúa distintas áreas grafomotoras. Si la figura es amplia y cercana al 100%, indica un desempeño normal. Si está encogida hacia el centro, señala deficiencias en esas habilidades específicas.'
                   })}
                   className="p-1 rounded text-text-muted hover:text-secondary transition-colors"
                   title="¿Qué es esto?"
                 >
                   <Icon icon="mdi:help-circle-outline" className="text-lg" />
                 </button>
              </div>
              <div className="flex-1">
                <RadarSkillsChart evaluation={evaluations[0]} />
              </div>
            </div>

            {/* Pastel Diagnóstico */}
            <div className="bg-white border border-border shadow-sm p-6 rounded-2xl flex flex-col hover-lift relative">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center">
                   <Icon icon="mdi:chart-donut" className="text-xl text-accent mr-2" />
                   <h3 className="text-base font-bold text-text-main">Distribución</h3>
                 </div>
                 <button 
                   onClick={() => setInfoModal({
                     title: 'Distribución',
                     text: 'Representa las probabilidades estimadas por el modelo de IA. Te ayuda a entender qué tan segura está la IA sobre su diagnóstico o si hubo "dudas" con otra categoría.'
                   })}
                   className="p-1 rounded text-text-muted hover:text-accent transition-colors"
                   title="¿Qué es esto?"
                 >
                   <Icon icon="mdi:help-circle-outline" className="text-lg" />
                 </button>
              </div>
              <div className="flex-1">
                <DiagnosisDonutChart evaluation={evaluations[0]} />
              </div>
            </div>

          </div>
        </div>
      )}

      {showNewEvaluation && (
        <NewEvaluationModal 
          student={student} 
          onClose={() => {
            setShowNewEvaluation(false);
            fetchData();
          }} 
        />
      )}
      {selectedEvaluation && (
        <EvaluationResultModal 
          student={student} 
          evaluation={selectedEvaluation} 
          onClose={() => setSelectedEvaluation(null)} 
        />
      )}

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-border">
            <div className="flex justify-between items-center p-5 border-b border-border bg-surface">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:information" className="text-2xl text-primary" />
                <h2 className="text-lg font-bold text-text-main">{infoModal.title}</h2>
              </div>
              <button onClick={() => setInfoModal(null)} className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors">
                <Icon icon="mdi:close" className="text-2xl" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-main text-sm leading-relaxed">{infoModal.text}</p>
            </div>
            <div className="flex justify-end p-5 border-t border-border bg-surface/50">
              <button onClick={() => setInfoModal(null)} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
