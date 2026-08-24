'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type AppView } from '@/store/useAppStore';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import {
  LayoutDashboard, MessageSquare, BarChart3, Users, Trophy,
  GitCompareArrows, Settings, Search, Sparkles,
  Bell, LogOut, PanelLeftClose, PanelLeft, Menu,
  Zap, TrendingUp, ArrowRight, Clock,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { players, matches, recentSearches } from '@/data/mockData';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  view: AppView;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: MessageSquare, label: 'AI Chat', view: 'chat', badge: 'AI' },
  { icon: BarChart3, label: 'Analytics', view: 'analytics' },
  { icon: Users, label: 'Players', view: 'players' },
  { icon: Trophy, label: 'Matches', view: 'matches' },
  { icon: GitCompareArrows, label: 'Compare', view: 'compare' },
  { icon: Settings, label: 'Settings', view: 'settings' },
];

const notificationItems = [
  { id: 1, icon: Zap, title: 'Live match alert: England vs Pakistan', time: '2m ago', unread: true, color: 'text-[oklch(0.72_0.18_55)]' },
  { id: 2, icon: Trophy, title: 'India won by 44 runs — Kohli MOTM', time: '1h ago', unread: true, color: 'text-[oklch(0.78_0.16_85)]' },
  { id: 3, icon: Users, title: 'New player added: Rashid Khan profile updated', time: '3h ago', unread: true, color: 'text-[oklch(0.65_0.20_155)]' },
  { id: 4, icon: TrendingUp, title: 'Steve Smith rises to ICC rank #6', time: 'Yesterday', unread: false, color: 'text-[oklch(0.72_0.18_30)]' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { view, setView, sidebarOpen, setSidebarOpen, user, searchQuery, setSearchQuery, commandOpen, setCommandOpen } = useAppStore();
  const { logout: firebaseLogout } = useFirebaseAuth();

  const handleLogout = useCallback(async () => {
    await firebaseLogout();
  }, [firebaseLogout]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsUnread, setNotificationsUnread] = useState(true);
  const markNotificationsRead = useCallback(() => setNotificationsUnread(false), [setNotificationsUnread]);
  const [commandQuery, setCommandQuery] = useState('');
  const bellRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);



  // ⌘K / Ctrl+K keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
        if (commandOpen) setCommandQuery('');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen, setCommandOpen]);

  // Auto-focus command input when opened
  useEffect(() => {
    if (commandOpen) {
      // Small delay to allow animation to start
      const timer = setTimeout(() => {
        commandInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [commandOpen]);



  // Close command palette on Escape
  const closeCommandPalette = useCallback(() => {
    setCommandOpen(false);
    setCommandQuery('');
  }, [setCommandOpen]);

  const handleCommandKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCommandPalette();
    }
  }, [closeCommandPalette]);

  // Filtered results for command palette
  const commandResults = useMemo(() => {
    const q = commandQuery.toLowerCase().trim();
    const results: { type: 'nav' | 'player' | 'match' | 'recent'; label: string; sublabel?: string; action: () => void }[] = [];

    // Nav items — always shown
    for (const item of navItems) {
      if (!q || item.label.toLowerCase().includes(q)) {
        results.push({
          type: 'nav',
          label: item.label,
          action: () => { setView(item.view); setCommandOpen(false); },
        });
      }
    }

    // Players matching query
    if (q) {
      for (const p of players) {
        if (
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q)
        ) {
          results.push({
            type: 'player',
            label: p.name,
            sublabel: `${p.country} · ${p.role}`,
            action: () => { setView('players'); setCommandOpen(false); },
          });
        }
      }
    }

    // Matches matching query
    if (q) {
      for (const m of matches) {
        if (
          m.teamA.toLowerCase().includes(q) ||
          m.teamB.toLowerCase().includes(q) ||
          m.competition.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q)
        ) {
          results.push({
            type: 'match',
            label: `${m.flagA} ${m.teamA} vs ${m.flagB} ${m.teamB}`,
            sublabel: m.competition,
            action: () => { setView('matches'); setCommandOpen(false); },
          });
        }
      }
    }

    // Recent searches matching query
    if (q) {
      for (const rs of recentSearches) {
        if (rs.toLowerCase().includes(q)) {
          results.push({
            type: 'recent',
            label: rs,
            action: () => {
              setSearchQuery(rs);
              setView('chat');
              setCommandOpen(false);
            },
          });
        }
      }
    }

    return results;
  }, [commandQuery, setView, setCommandOpen, setSearchQuery]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-8 h-8 rounded-full shrink-0 overflow-hidden"
            style={{
              boxShadow: '0 0 14px rgba(212,69,53,0.25)',
            }}
            whileHover={{ rotateZ: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src="/cricket-ball.png" alt="" className="w-full h-full object-cover" />
          </motion.div>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold tracking-tight"
            >
              <span className="gradient-text">Cric</span>
              <span className="text-foreground">IQ</span>
            </motion.span>
          )}
        </div>
        <button
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <PanelLeftClose size={16} className="text-muted-foreground" /> : <PanelLeft size={16} className="text-muted-foreground" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = view === item.view;
          return (
            <motion.button
              key={item.view}
              onClick={() => { setView(item.view); setShowMobileSidebar(false); }}
              className={cn(
                'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer',
                isActive
                  ? 'bg-[oklch(0.65_0.20_155/12%)] text-[oklch(0.65_0.20_155)]'
                  : 'text-muted-foreground/60 hover:text-foreground/90 hover:bg-muted/30',
              )}
              whileHover={{ x: 3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <item.icon size={18} />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 text-left"
                >
                  {item.label}
                </motion.span>
              )}
              {item.badge && sidebarOpen && (
                <Badge className="bg-[oklch(0.80_0.15_85/12%)] text-[oklch(0.80_0.15_85)] hover:bg-[oklch(0.80_0.15_85/18%)] text-[10px] px-1.5 py-0 border-0">
                  {item.badge}
                </Badge>
              )}
              {isActive && (
                <motion.div
                  className="absolute left-0 w-[3px] h-6 rounded-r-full bg-[oklch(0.65_0.20_155)]"
                  layoutId="sidebar-active"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User section */}
      {sidebarOpen && (
        <motion.div
          className="p-4 border-t border-border/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors duration-300">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-gradient-to-br from-[oklch(0.65_0.20_155/25%)] to-[oklch(0.80_0.15_85/25%)] text-xs font-bold border border-border/20">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground/50 truncate">{user?.email}</p>
            </div>
            <button
              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer group"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut size={14} className="text-muted-foreground/50 group-hover:text-destructive transition-colors" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:block relative border-r border-border/30"
        style={{ background: 'oklch(0.06 0.012 265)' }}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-full overflow-hidden">{sidebarContent}</div>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xl lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-64 border-r border-border/30 lg:hidden"
              style={{ background: 'oklch(0.06 0.012 265 / 98%)', backdropFilter: 'blur(24px)' }}
              initial={{ x: -256, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -256, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border/30 flex items-center gap-4 px-4 md:px-6 glass-strong shrink-0 z-30">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setShowMobileSidebar(true)}
          >
            <Menu size={18} className="text-muted-foreground" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                placeholder="Search players, matches, ask AI..."
                className="pl-9 h-9 bg-muted/30 border-border/30 text-sm focus:border-[oklch(0.65_0.20_155/30%)] focus:bg-muted/50 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded border border-border/30">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sparkles — navigate to AI Chat */}
            <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative cursor-pointer"
                onClick={() => setView('chat')}
              >
                <Sparkles size={16} className="text-[oklch(0.80_0.15_85)]" />
              </Button>
            </motion.div>

            {/* Bell — notifications dropdown */}
            <div ref={bellRef} className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative cursor-pointer"
                  onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsRead();
                }}
                >
                  <Bell size={16} className="text-muted-foreground/60" />
                  {notificationsUnread && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[oklch(0.65_0.20_155)]"
                      style={{ boxShadow: '0 0 6px oklch(0.65 0.20 155 / 50%)' }}
                    />
                  )}
                </Button>
              </motion.div>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border/40 overflow-hidden glass-strong shadow-2xl shadow-black/40 z-50"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      <button
                        className="text-xs text-[oklch(0.65_0.20_155)] hover:text-[oklch(0.55_0.22_155)] transition-colors cursor-pointer font-medium"
                        onClick={markNotificationsRead}
                      >
                        Mark all read
                      </button>
                    </div>

                    {/* Notification items */}
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {notificationItems.map((notif) => (
                        <div
                          key={notif.id}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/15 last:border-b-0"
                        >
                          <div className={cn('mt-0.5 shrink-0', notif.color)}>
                            <notif.icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug text-foreground/90">{notif.title}</p>
                            <p className="text-[11px] text-muted-foreground/50 mt-0.5">{notif.time}</p>
                          </div>
                          {notif.unread && notificationsUnread && (
                            <span className="mt-2 shrink-0 w-2 h-2 rounded-full bg-[oklch(0.65_0.20_155)]" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border/30 px-4 py-2.5">
                      <button
                        className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.65_0.20_155)] hover:text-[oklch(0.55_0.22_155)] transition-colors cursor-pointer mx-auto"
                        onClick={() => setShowNotifications(false)}
                      >
                        View All
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content with 3D transitions */}
        <main className="flex-1 overflow-y-auto no-scrollbar perspective-subtle">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{
                opacity: 0,
                y: 20,
                rotateX: 4,
                translateZ: -30,
                scale: 0.98,
                filter: 'blur(6px)',
              }}
              animate={{
                opacity: 1,
                y: 0,
                rotateX: 0,
                translateZ: 0,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                y: -15,
                rotateX: -2,
                translateZ: -20,
                scale: 0.99,
                filter: 'blur(4px)',
              }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full preserve-3d"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {commandOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCommandOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-lg mx-4 rounded-2xl border border-border/40 overflow-hidden glass-strong shadow-2xl shadow-black/60"
              style={{ maxHeight: 'min(480px, 70vh)' }}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleCommandKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-border/30">
                <Search size={18} className="text-muted-foreground/50 shrink-0" />
                <input
                  ref={commandInputRef}
                  type="text"
                  placeholder="Search players, matches, navigate..."
                  className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                />
                <kbd className="text-[10px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded border border-border/30 shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(min(480px, 70vh) - 49px)' }}>
                {commandResults.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground/50">
                    No results found for &quot;{commandQuery}&quot;
                  </div>
                )}

                {commandResults.length > 0 && (
                  <div className="p-2">
                    {/* Group: Navigation */}
                    {commandResults.some((r) => r.type === 'nav') && (
                      <>
                        <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold">
                          Navigation
                        </p>
                        {commandResults
                          .filter((r) => r.type === 'nav')
                          .map((r, i) => {
                            const navItem = navItems.find((n) => n.label === r.label);
                            const Icon = navItem?.icon || LayoutDashboard;
                            return (
                              <button
                                key={`nav-${r.label}`}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-muted/40 transition-colors cursor-pointer group"
                                onClick={r.action}
                              >
                                <Icon size={16} className="text-muted-foreground/50 group-hover:text-[oklch(0.65_0.20_155)] transition-colors shrink-0" />
                                <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                                  {r.label}
                                </span>
                              </button>
                            );
                          })}
                      </>
                    )}

                    {/* Group: Players */}
                    {commandResults.some((r) => r.type === 'player') && (
                      <>
                        <p className="px-2 py-1.5 mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold">
                          Players
                        </p>
                        {commandResults
                          .filter((r) => r.type === 'player')
                          .map((r) => (
                            <button
                              key={`player-${r.label}`}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-muted/40 transition-colors cursor-pointer group"
                              onClick={r.action}
                            >
                              <Users size={16} className="text-muted-foreground/50 group-hover:text-[oklch(0.65_0.20_155)] transition-colors shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-foreground/80 group-hover:text-foreground transition-colors block truncate">
                                  {r.label}
                                </span>
                                {r.sublabel && (
                                  <span className="text-[11px] text-muted-foreground/40">{r.sublabel}</span>
                                )}
                              </div>
                            </button>
                          ))}
                      </>
                    )}

                    {/* Group: Matches */}
                    {commandResults.some((r) => r.type === 'match') && (
                      <>
                        <p className="px-2 py-1.5 mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold">
                          Matches
                        </p>
                        {commandResults
                          .filter((r) => r.type === 'match')
                          .map((r) => (
                            <button
                              key={`match-${r.label}`}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-muted/40 transition-colors cursor-pointer group"
                              onClick={r.action}
                            >
                              <Trophy size={16} className="text-muted-foreground/50 group-hover:text-[oklch(0.65_0.20_155)] transition-colors shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-foreground/80 group-hover:text-foreground transition-colors block truncate">
                                  {r.label}
                                </span>
                                {r.sublabel && (
                                  <span className="text-[11px] text-muted-foreground/40">{r.sublabel}</span>
                                )}
                              </div>
                            </button>
                          ))}
                      </>
                    )}

                    {/* Group: Recent Searches */}
                    {commandResults.some((r) => r.type === 'recent') && (
                      <>
                        <p className="px-2 py-1.5 mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold">
                          Recent Searches
                        </p>
                        {commandResults
                          .filter((r) => r.type === 'recent')
                          .map((r) => (
                            <button
                              key={`recent-${r.label}`}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-muted/40 transition-colors cursor-pointer group"
                              onClick={r.action}
                            >
                              <Clock size={16} className="text-muted-foreground/50 group-hover:text-[oklch(0.65_0.20_155)] transition-colors shrink-0" />
                              <span className="text-foreground/80 group-hover:text-foreground transition-colors truncate">
                                {r.label}
                              </span>
                            </button>
                          ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}