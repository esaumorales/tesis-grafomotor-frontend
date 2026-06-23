import { Link, NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { useState } from 'react';

import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const adminMenuItems = [
    { name: 'Profesoras', path: '/dashboard', icon: 'mdi:account-tie' },
    { name: 'Reportes ', path: '/reportes', icon: 'mdi:chart-bar' },
    { name: 'Configuración ', path: '/configuracion', icon: 'mdi:cog' },
  ];

  const teacherMenuItems = [
    { name: 'Estudiantes', path: '/dashboard', icon: 'mdi:account-group' },
    { name: 'Mis Reportes', path: '/reportes', icon: 'mdi:chart-bar' },
    { name: 'Configuración', path: '/configuracion', icon: 'mdi:cog' },
  ];

  const menuItems = user?.rol === 'ADMIN' ? adminMenuItems : teacherMenuItems;

  return (
    <div className={clsx(
      "bg-surface border-r border-border shadow-sm flex flex-col hidden md:flex z-10 relative transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Botón para colapsar */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-9 w-7 h-7 flex items-center justify-center bg-surface border border-border rounded-full text-text-muted hover:text-primary hover:bg-primary/5 shadow-md z-20 transition-colors"
      >
        <Icon icon={isCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"} className="text-xl" />
      </button>

      <div className="h-18 flex flex-nowrap items-center justify-center border-b border-border bg-surface/80 backdrop-blur-md overflow-hidden relative px-2">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className={clsx(
            "h-16 w-auto object-contain drop-shadow-sm transition-all duration-300 flex-shrink-0",
            isCollapsed ? "scale-75" : "hover:scale-105"
          )} 
        />
        {!isCollapsed && <p className='text-lg font-semibold text-primary whitespace-nowrap overflow-hidden transition-all duration-300'>Portal Educacional</p>}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center py-3.5 text-sm font-medium transition-all duration-200 border-l-4 overflow-hidden',
                    isCollapsed ? 'px-0 justify-center' : 'px-6',
                    isActive
                      ? 'bg-primary/10 text-primary border-primary font-semibold'
                      : clsx('text-text-muted border-transparent hover:bg-primary/5 hover:text-primary', !isCollapsed && 'hover:pl-7')
                  )
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon icon={item.icon} className={clsx("text-xl flex-shrink-0", isCollapsed ? "" : "mr-3")} />
                {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border bg-surface/50 overflow-hidden">
        <Link 
          to='/login' 
          onClick={logout}
          className={clsx(
            "flex items-center text-sm font-medium text-text-muted rounded-xl hover:bg-danger/10 hover:text-danger transition-all duration-200 group overflow-hidden",
            isCollapsed ? "justify-center px-0 py-3" : "w-full px-4 py-2.5"
          )}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <Icon icon="mdi:logout" className={clsx("text-xl flex-shrink-0 group-hover:-translate-x-1 transition-transform", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
        </Link>
      </div>
    </div>
  );
}
