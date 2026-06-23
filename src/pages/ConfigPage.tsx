import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../services/api';

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    rol: '',
  });

  const [pwdData, setPwdData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me');
      setFormData({
        nombre_completo: response.data.nombre_completo,
        email: response.data.email,
        rol: response.data.rol,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    
    try {
      await api.put('/users/me/profile', {
        nombre_completo: formData.nombre_completo,
        email: formData.email
      });
      setProfileMsg({ type: 'success', text: 'Perfil actualizado exitosamente.' });
      
      // Update local storage user data to refresh Sidebar
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.nombre_completo = formData.nombre_completo;
        user.email = formData.email;
        localStorage.setItem('user', JSON.stringify(user));
        // Emit event so other components (like Sidebar) can re-render
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error: any) {
      setProfileMsg({ type: 'error', text: error.response?.data?.detail || 'Error al actualizar.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.new_password !== pwdData.confirm_password) {
      setPwdMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    if (pwdData.new_password.length < 6) {
      setPwdMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    
    setPwdSaving(true);
    setPwdMsg({ type: '', text: '' });
    
    try {
      await api.put('/users/me/password', {
        current_password: pwdData.current_password,
        new_password: pwdData.new_password
      });
      setPwdMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setPwdData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      setPwdMsg({ type: 'error', text: error.response?.data?.detail || 'Contraseña actual incorrecta.' });
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] animate-pulse">
        <Icon icon="mdi:loading" className="animate-spin text-5xl text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main flex items-center">
            <Icon icon="mdi:cog" className="mr-3 text-primary" />
            Configuración
          </h1>
          <p className="text-text-muted mt-2 text-sm font-medium">Gestiona tu perfil, credenciales de acceso y preferencias del sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Col: Menu / Info */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* User Preview Card */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-400/5 opacity-50 z-0"></div>
            <div className="w-20 h-20 bg-white rounded-full shadow-sm border-4 border-primary/10 flex items-center justify-center mb-4 z-10">
              <Icon icon="mdi:account-circle" className="text-6xl text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-text-main z-10">{formData.nombre_completo}</h2>
            <p className="text-sm text-text-muted mb-4 z-10">{formData.email}</p>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
              {formData.rol}
            </span>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start">
             <Icon icon="mdi:information-outline" className="text-primary text-xl mr-3 shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-primary mb-1">Información Institucional</h4>
               <p className="text-xs text-slate-600 leading-relaxed">
                 Las opciones de institución y licenciamiento están gestionadas por el administrador de red. Si necesitas actualizar datos del colegio, contacta a soporte.
               </p>
             </div>
          </div>
        </div>

        {/* Right Col: Forms */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Form: Profile */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-text-main flex items-center text-sm uppercase tracking-wide">
                <Icon icon="mdi:card-account-details-outline" className="mr-2 text-lg text-primary" />
                Perfil de Usuario
              </h3>
            </div>
            <div className="p-6">
              {profileMsg.text && (
                <div className={`mb-5 p-3 rounded-xl text-sm font-semibold flex items-center ${profileMsg.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
                   <Icon icon={profileMsg.type === 'error' ? 'mdi:alert-circle' : 'mdi:check-circle'} className="text-lg mr-2" />
                   {profileMsg.text}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      value={formData.nombre_completo}
                      onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={profileSaving}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center disabled:opacity-50"
                  >
                    {profileSaving ? <Icon icon="mdi:loading" className="animate-spin mr-2 text-lg" /> : <Icon icon="mdi:content-save-outline" className="mr-2 text-lg" />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Form: Password */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-text-main flex items-center text-sm uppercase tracking-wide">
                <Icon icon="mdi:lock-outline" className="mr-2 text-lg text-primary" />
                Cambiar Contraseña
              </h3>
            </div>
            <div className="p-6">
              {pwdMsg.text && (
                <div className={`mb-5 p-3 rounded-xl text-sm font-semibold flex items-center ${pwdMsg.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
                   <Icon icon={pwdMsg.type === 'error' ? 'mdi:alert-circle' : 'mdi:check-circle'} className="text-lg mr-2" />
                   {pwdMsg.text}
                </div>
              )}
              <form onSubmit={handlePwdSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Contraseña Actual</label>
                  <input 
                    type="password" 
                    required
                    value={pwdData.current_password}
                    onChange={(e) => setPwdData({...pwdData, current_password: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Nueva Contraseña</label>
                    <input 
                      type="password" 
                      required
                      value={pwdData.new_password}
                      onChange={(e) => setPwdData({...pwdData, new_password: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Confirmar Contraseña</label>
                    <input 
                      type="password" 
                      required
                      value={pwdData.confirm_password}
                      onChange={(e) => setPwdData({...pwdData, confirm_password: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={pwdSaving}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center disabled:opacity-50"
                  >
                    {pwdSaving ? <Icon icon="mdi:loading" className="animate-spin mr-2 text-lg" /> : <Icon icon="mdi:shield-check-outline" className="mr-2 text-lg" />}
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
