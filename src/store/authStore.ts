import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  rol: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user?: User) => void;
  logout: () => void;
}

const getInitialUser = (): User | null => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      return { email: decoded.sub, rol: decoded.rol };
    } catch {
      return null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (token, user) => {
    localStorage.setItem('token', token);
    
    // Si no se provee el usuario, decodificar el token
    let currentUser = user;
    if (!currentUser) {
       const decoded: any = jwtDecode(token);
       currentUser = { email: decoded.sub, rol: decoded.rol };
    }
    
    set({ token, user: currentUser, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
