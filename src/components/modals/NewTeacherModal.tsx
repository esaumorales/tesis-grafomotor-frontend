import { useState } from 'react';
import { Icon } from '@iconify/react';
import api from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewTeacherModal({ isOpen, onClose, onSuccess }: Props) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await api.post('/auth/register', {
        nombre_completo: nombreCompleto,
        email,
        password,
        rol: 'PROFESORA'
      });
      onSuccess();
      onClose();
      // Reset form
      setNombreCompleto('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Ocurrió un error al registrar la profesora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 pt-6 pb-4 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
              <Icon icon="mdi:account-plus-outline" className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Registrar Profesora</h2>
              <p className="text-sm text-slate-500 mt-1">Ingresa los datos para registrar una nueva docente en el sistema.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {errorMsg && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <Icon icon="mdi:alert-circle-outline" className="text-red-600 text-xl shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Completo</label>
              <input
                type="text"
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                placeholder="Ej. María Sánchez"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Institucional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                placeholder="profesora@colegio.edu"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña Temporal</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
            
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
              >
                {loading && <Icon icon="mdi:loading" className="animate-spin mr-2 text-lg" />}
                Crear Profesora
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
