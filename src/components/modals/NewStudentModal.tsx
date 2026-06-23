import { useState } from 'react';
import { Icon } from '@iconify/react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';
import api from '../../services/api';

registerLocale('es', es);

interface NewStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewStudentModal({ onClose, onSuccess }: NewStudentModalProps) {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('M');
  const [lateralidad, setLateralidad] = useState('Derecha');
  const [tieneCorreccionVisual, setTieneCorreccionVisual] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const calculateEdad = () => {
    if (!fechaNacimiento) return '';
    const birth = new Date(fechaNacimiento);
    const today = new Date();
    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();
    
    if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birth.getDate())) {
      ageYears--;
      ageMonths += 12;
    }
    
    return `${ageYears} años, ${ageMonths} meses`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let lateralidadAPI = "DIESTRO";
      if (lateralidad === "Izquierda") lateralidadAPI = "ZURDO";
      if (lateralidad === "Ambidextro") lateralidadAPI = "AMBIDIESTRO";

      await api.post('/students/', {
        nombres,
        apellidos,
        fecha_nacimiento: fechaNacimiento,
        lateralidad: lateralidadAPI,
        notas_clinicas: observaciones
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      let message = 'Error al registrar el estudiante';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
           message = error.response.data.detail.map((e: any) => `${e.loc?.join('.')} - ${e.msg}`).join(', ');
        } else {
           message = error.response.data.detail;
        }
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-border">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-surface">
          <h2 className="text-xl font-bold text-text-main">Nuevo Estudiante</h2>
          <button onClick={onClose} className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors">
            <Icon icon="mdi:close" className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {errorMsg && (
            <div className="md:col-span-3 mb-2 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
              {errorMsg}
            </div>
          )}
          
          {/* Columna Izquierda: Foto */}
          <div className="flex flex-col items-center border-r border-border pr-6">
            <div className="w-32 h-32 border-2 border-dashed border-primary/40 rounded-3xl flex items-center justify-center text-primary/50 mb-5 bg-primary/5 transition-colors hover:bg-primary/10 hover:border-primary cursor-pointer">
              <Icon icon="mdi:camera-plus-outline" className="text-5xl" />
            </div>
            <button className="bg-surface border-2 border-primary/20 hover:border-primary text-primary w-full py-2.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center">
              <Icon icon="mdi:upload" className="mr-2 text-lg" />
              Subir Foto
            </button>
          </div>

          {/* Columna Derecha: Formulario */}
          <form onSubmit={handleSubmit} id="new-student-form" className="md:col-span-2 space-y-4">
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Nombres:</label>
                <input 
                  type="text" 
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ingresar Nombres" 
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface shadow-sm transition-all text-text-main" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Apellidos:</label>
                <input 
                  type="text" 
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ingresar Apellidos" 
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface shadow-sm transition-all text-text-main" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Fecha de Nacimiento:</label>
                <DatePicker 
                  selected={fechaNacimiento ? new Date(fechaNacimiento + "T00:00:00") : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setFechaNacimiento(date.toISOString().split('T')[0]);
                    } else {
                      setFechaNacimiento('');
                    }
                  }}
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/aaaa"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface shadow-sm transition-all text-text-main" 
                  wrapperClassName="w-full"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Edad:</label>
                <input 
                  type="text" 
                  disabled 
                  value={calculateEdad()}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-text-muted shadow-inner cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Género:</label>
                <select 
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface shadow-sm transition-all text-text-main"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Mano Dominante:</label>
                <select 
                  value={lateralidad}
                  onChange={(e) => setLateralidad(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface shadow-sm transition-all text-text-main"
                >
                  <option value="Derecha">Derecha</option>
                  <option value="Izquierda">Izquierda</option>
                  <option value="Ambidextro">Ambidextro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Corrección Visual (Usa lentes):</label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center text-sm cursor-pointer group">
                  <input type="radio" name="visual" checked={tieneCorreccionVisual} onChange={() => setTieneCorreccionVisual(true)} className="mr-2 w-4 h-4 text-primary focus:ring-primary" /> 
                  <span className="group-hover:text-primary transition-colors">Sí</span>
                </label>
                <label className="flex items-center text-sm cursor-pointer group">
                  <input type="radio" name="visual" checked={!tieneCorreccionVisual} onChange={() => setTieneCorreccionVisual(false)} className="mr-2 w-4 h-4 text-primary focus:ring-primary" /> 
                  <span className="group-hover:text-primary transition-colors">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Observaciones Médicas (Opcional):</label>
              <textarea 
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej. TDAH, problemas motores leves, etc." 
                rows={2} 
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface shadow-sm transition-all text-text-main resize-none"
              ></textarea>
            </div>

          </form>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-border bg-surface/50">
          <button onClick={onClose} type="button" className="px-5 py-2.5 border border-border bg-surface hover:bg-slate-50 text-text-muted rounded-xl text-sm font-bold transition-all shadow-sm">
            Cancelar
          </button>
          <button type="submit" form="new-student-form" disabled={loading} className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-surface rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
            {loading && <Icon icon="mdi:loading" className="animate-spin mr-2 text-lg" />}
            Registrar Estudiante
          </button>
        </div>

      </div>
    </div>
  );
}
