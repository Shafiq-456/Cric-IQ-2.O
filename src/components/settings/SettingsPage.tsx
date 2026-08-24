'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  User, Bell, Palette, Shield, Database, Key,
  Moon, Globe, Mail, ChevronRight, Save, Loader2, Upload, Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

const LANGUAGES = ['English', 'Hindi', 'Spanish'] as const;
type Language = (typeof LANGUAGES)[number];

interface NotificationsState {
  matchStartAlerts: boolean;
  aiInsightDigest: boolean;
  playerPerformanceAlerts: boolean;
  weeklyAnalyticsReport: boolean;
}

interface SettingsState {
  darkMode: boolean;
  language: Language;
  emailNotifications: boolean;
  notifications: NotificationsState;
}

function loadSettings(): SettingsState {
  if (typeof window === 'undefined') {
    return {
      darkMode: true,
      language: 'English',
      emailNotifications: true,
      notifications: {
        matchStartAlerts: true,
        aiInsightDigest: true,
        playerPerformanceAlerts: false,
        weeklyAnalyticsReport: true,
      },
    };
  }
  try {
    const raw = localStorage.getItem('criciq-settings');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      return {
        darkMode: parsed.darkMode ?? true,
        language: parsed.language ?? 'English',
        emailNotifications: parsed.emailNotifications ?? true,
        notifications: {
          matchStartAlerts: parsed.notifications?.matchStartAlerts ?? true,
          aiInsightDigest: parsed.notifications?.aiInsightDigest ?? true,
          playerPerformanceAlerts: parsed.notifications?.playerPerformanceAlerts ?? false,
          weeklyAnalyticsReport: parsed.notifications?.weeklyAnalyticsReport ?? true,
        },
      };
    }
  } catch {
    // ignore parse errors
  }
  return {
    darkMode: true,
    language: 'English',
    emailNotifications: true,
    notifications: {
      matchStartAlerts: true,
      aiInsightDigest: true,
      playerPerformanceAlerts: false,
      weeklyAnalyticsReport: true,
    },
  };
}

function persistSettings(settings: SettingsState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('criciq-settings', JSON.stringify(settings));
  }
}

export default function SettingsPage() {
  const { user, setUser } = useAppStore();

  // --- Profile state ---
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [favoriteTeam, setFavoriteTeam] = useState(user?.favoriteTeam ?? '');
  const [favoritePlayer, setFavoritePlayer] = useState(user?.favoritePlayer ?? '');

  // --- Settings state (persisted to localStorage) ---
  const [settings, setSettings] = useState<SettingsState>(loadSettings);

  // Persist settings whenever they change
  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  // --- Knowledge Base state ---
  const [docCount, setDocCount] = useState(12);
  const [chunkCount, setChunkCount] = useState(1847);
  const [storageMB, setStorageMB] = useState(24);

  // --- Security state ---
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // --- Save button state ---
  const [saving, setSaving] = useState(false);

  // --- File upload ref ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const cycleLanguage = useCallback(() => {
    setSettings((prev) => {
      const idx = LANGUAGES.indexOf(prev.language);
      const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
      return { ...prev, language: next };
    });
  });

  const toggleNotification = useCallback((key: keyof NotificationsState) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['.pdf', '.csv', '.json', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Unsupported file type. Allowed: PDF, CSV, JSON, DOCX, TXT.');
      return;
    }
    // Simulate upload success
    setDocCount((c) => c + 1);
    setChunkCount((c) => c + Math.floor(Math.random() * 200) + 50);
    setStorageMB((c) => c + Math.floor(Math.random() * 5) + 1);
    toast.success(`"${file.name}" uploaded successfully.`);
    // Reset the input so the same file can be re-uploaded
    e.target.value = '';
  });

  const handlePasswordChange = useCallback(() => {
    setPasswordError('');
    if (!oldPassword.trim()) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    // Simulate password change
    toast.success('Password changed successfully.');
    setPasswordDialogOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  });

  const handleTwoFactorToggle = useCallback(() => {
    setTwoFactorEnabled((prev) => {
      const next = !prev;
      toast.success(next ? 'Two-Factor Authentication enabled.' : 'Two-Factor Authentication disabled.');
      return next;
    });
  });

  const handleSave = useCallback(() => {
    setSaving(true);
    // Update user in store (this also syncs with Firebase context via page.tsx)
    setUser({
      name,
      email,
      favoriteTeam,
      favoritePlayer,
      image: user?.image,
    });
    // Persist user profile to localStorage for session restore
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('criciq-auth', JSON.stringify({
          name,
          email,
          favoriteTeam,
          favoritePlayer,
          image: user?.image,
        }));
      } catch {
        // ignore
      }
    }
    // Persist settings (already done via useEffect, but be explicit)
    persistSettings(settings);
    // Brief loading state
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully.');
    }, 500);
  });

  // Derived display values
  const initials = name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';
  const chunkDisplay = chunkCount.toLocaleString();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, preferences, and account settings.</p>
      </motion.div>

      <div className="space-y-6">
        {/* ───── Profile ───── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[oklch(0.65_0.22_240)]" />
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.22_240/30)] to-[oklch(0.78_0.16_85/30)] flex items-center justify-center text-xl font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold">{name || 'Unnamed User'}</p>
                    <p className="text-sm text-muted-foreground">{email || 'No email set'}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">Pro Plan</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted/50 border-border/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-muted/50 border-border/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Favorite Team</Label>
                    <Input
                      value={favoriteTeam}
                      onChange={(e) => setFavoriteTeam(e.target.value)}
                      className="bg-muted/50 border-border/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Favorite Player</Label>
                    <Input
                      value={favoritePlayer}
                      onChange={(e) => setFavoritePlayer(e.target.value)}
                      className="bg-muted/50 border-border/50 text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ───── Preferences ───── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-[oklch(0.65_0.22_240)]" />
                <CardTitle className="text-sm font-medium">Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Dark Mode */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Moon size={16} className="text-[oklch(0.65_0.22_240)]" />
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-[10px] text-muted-foreground">Use dark theme across the app</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, darkMode: checked }))
                    }
                  />
                </div>

                {/* Language */}
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={cycleLanguage}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleLanguage(); } }}
                  aria-label={`Current language: ${settings.language}. Click to change.`}
                >
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-[oklch(0.72_0.18_170)]" />
                    <div>
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-[10px] text-muted-foreground">Set your preferred language</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[oklch(0.72_0.18_170/15)] text-[oklch(0.72_0.18_170)] text-[10px]">
                      {settings.language}
                    </Badge>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </div>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[oklch(0.78_0.16_85)]" />
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-[10px] text-muted-foreground">Match alerts, AI insights, weekly digest</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ───── Notifications ───── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[oklch(0.65_0.22_240)]" />
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {([
                  { key: 'matchStartAlerts' as const, label: 'Match Start Alerts', desc: 'Get notified when a match begins' },
                  { key: 'aiInsightDigest' as const, label: 'AI Insight Digest', desc: 'Daily AI-generated cricket insights' },
                  { key: 'playerPerformanceAlerts' as const, label: 'Player Performance Alerts', desc: 'Notifications for tracked players' },
                  { key: 'weeklyAnalyticsReport' as const, label: 'Weekly Analytics Report', desc: 'Summary of weekly cricket statistics' },
                ]).map((n) => (
                  <div
                    key={n.key}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={settings.notifications[n.key] ? 'on' : 'off'}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Switch
                          checked={settings.notifications[n.key]}
                          onCheckedChange={() => toggleNotification(n.key)}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ───── Knowledge Base ───── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[oklch(0.65_0.22_240)]" />
                <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage your uploaded documents and private knowledge base for AI queries.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { label: 'Documents', value: String(docCount), color: 'oklch(0.65 0.22 240)' },
                    { label: 'Chunks', value: chunkDisplay, color: 'oklch(0.78 0.16 85)' },
                    { label: 'Storage', value: `${storageMB} MB`, color: 'oklch(0.72 0.18 170)' },
                  ]).map((s) => (
                    <motion.div
                      key={s.label}
                      className="p-3 rounded-xl bg-muted/50 text-center"
                      initial={false}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.csv,.json,.docx,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  className="w-full border-border/50 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-2" />
                  Upload New Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ───── Security ───── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[oklch(0.65_0.22_240)]" />
                <CardTitle className="text-sm font-medium">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Change Password */}
                <div
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setPasswordDialogOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPasswordDialogOpen(true); } }}
                  aria-label="Change password"
                >
                  <div className="flex items-center gap-3">
                    <Key size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-[10px] text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>

                {/* Two-Factor Authentication */}
                <div
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={handleTwoFactorToggle}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTwoFactorToggle(); } }}
                  aria-label={`Two-Factor Authentication: ${twoFactorEnabled ? 'Enabled' : 'Disabled'}. Click to toggle.`}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-[10px] text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={twoFactorEnabled ? 'enabled' : 'setup'}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {twoFactorEnabled ? (
                        <Badge className="bg-[oklch(0.72_0.18_170/15)] text-[oklch(0.72_0.18_170)] text-[10px] flex items-center gap-1">
                          <Check size={10} /> Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-[oklch(0.78_0.16_85/30)] text-[oklch(0.78_0.16_85)]">
                          Setup
                        </Badge>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ───── Save Button ───── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Button
          className="w-full bg-[oklch(0.65_0.22_240)] hover:bg-[oklch(0.58_0.24_240)] text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save size={14} className="mr-2" /> Save Changes
            </>
          )}
        </Button>
      </motion.div>

      {/* ───── Change Password Dialog ───── */}
      <Dialog open={passwordDialogOpen} onOpenChange={(open) => {
        setPasswordDialogOpen(open);
        if (!open) {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
        }
      }}>
        <DialogContent className="glass sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Current Password</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-muted/50 border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-muted/50 border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-muted/50 border-border/50 text-sm"
              />
            </div>
            {passwordError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400"
              >
                {passwordError}
              </motion.p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPasswordDialogOpen(false);
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError('');
            }}>
              Cancel
            </Button>
            <Button
              className="bg-[oklch(0.65_0.22_240)] hover:bg-[oklch(0.58_0.24_240)] text-white"
              onClick={handlePasswordChange}
            >
              Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}