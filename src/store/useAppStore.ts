import { create } from 'zustand';

export type AppView = 'intro' | 'landing' | 'login' | 'dashboard' | 'chat' | 'analytics' | 'players' | 'matches' | 'compare' | 'settings';

export interface User {
  name: string;
  email: string;
  image?: string;
  favoriteTeam: string;
  favoritePlayer: string;
}

interface AppState {
  view: AppView;
  setView: (view: AppView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  logout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'intro',
  setView: (view) => set({ view }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('criciq-intro-shown');
    }
    set({ user: null, isAuthenticated: false, view: 'landing' });
  },
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
}));