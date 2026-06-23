import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../services/api';
import NewTeacherModal from '../components/modals/NewTeacherModal';

interface UserData {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  fecha_registro: string;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.filter((u: UserData) => u.rol === 'PROFESORA'));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main flex items-center">
            <Icon icon="mdi:shield-crown" className="mr-3 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-text-muted mt-2 text-sm font-medium">Gestiona los accesos y cuentas de los docentes de la institución.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-400/5 opacity-50 z-0"></div>
          <div className="z-10">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
              Profesoras Registradas
            </p>
            <h3 className="text-4xl font-black text-text-main">{users.length}</h3>
          </div>
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-primary/10 flex items-center justify-center z-10 transform group-hover:scale-110 transition-transform">
            <Icon icon="mdi:account-tie" className="text-3xl text-primary opacity-80" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-surface border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Table Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-text-main flex items-center uppercase tracking-wide text-sm">
            <Icon icon="mdi:account-group" className="mr-2 text-lg text-primary" />
            Directorio Docente
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center transform hover:-translate-y-0.5"
          >
            <Icon icon="mdi:plus" className="text-xl mr-1" />
            Nueva Profesora
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-[40vh] space-y-4">
              <Icon icon="mdi:loading" className="animate-spin text-5xl text-primary opacity-50" />
              <p className="text-text-muted font-medium">Cargando directorio...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 sticky top-0 border-b border-border z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs text-text-muted tracking-wider uppercase">Docente</th>
                  <th className="px-6 py-4 font-bold text-xs text-text-muted tracking-wider uppercase">Correo</th>
                  <th className="px-6 py-4 font-bold text-xs text-text-muted tracking-wider uppercase">Fecha Registro</th>
                  <th className="px-6 py-4 font-bold text-xs text-text-muted tracking-wider uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user, i) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                          {user.nombre_completo.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <span className="font-bold text-text-main">{user.nombre_completo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <div className="flex items-center">
                        <Icon icon="mdi:email-outline" className="mr-2 text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(user.fecha_registro).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5"></span>
                        Activa
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <Icon icon="mdi:account-off-outline" className="text-5xl mx-auto mb-3 opacity-30" />
                      <p className="font-medium text-lg text-text-main">No hay profesoras registradas.</p>
                      <p className="text-sm mt-1">Usa el botón superior para agregar la primera.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <NewTeacherModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchUsers()} 
      />
    </div>
  );
}
