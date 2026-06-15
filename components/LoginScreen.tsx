import React, { useState } from 'react';
import { Eye, EyeOff, Key, Loader } from 'lucide-react';
import { signInWithEmail, signInWithAccessCode, getCurrentProfile } from '../lib/supabase';
import { UserRole } from '../types';

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

interface Props {
  onLogin: (role: UserRole, supplierId?: string) => void;
}

type LoginStep = 'role' | 'credentials';

const ROLES: { id: UserRole; label: string; emoji: string; desc: string; color: string }[] = [
  { id: 'customer',  label: 'Client',       emoji: '👤', desc: 'Commander & suivre mes livraisons', color: 'border-green-400 bg-green-50' },
  { id: 'delivery',  label: 'Livreur',      emoji: '🛵', desc: 'Gérer mes livraisons & gains',      color: 'border-blue-400 bg-blue-50' },
  { id: 'supplier',  label: 'Fournisseur',  emoji: '🏪', desc: 'Gérer mes commandes & produits',    color: 'border-emerald-400 bg-emerald-50' },
  { id: 'admin',     label: 'Admin',        emoji: '🏢', desc: "Tableau de bord de l'application",  color: 'border-gray-400 bg-gray-50' },
];

const DEMO_CREDENTIALS: Record<UserRole, { email?: string; password?: string; code?: string }> = {
  customer:  { email: 'client@demo.ci',        password: 'demo1234' },
  delivery:  { email: 'livreur@demo.ci',        password: 'demo1234' },
  supplier:  { code: 'MAR001' },
  admin:     { email: 'admin@abengourou.ci',    password: 'admin1234' },
};

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState<LoginStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    // Client en mode démo — pas besoin de credentials
    if (role === 'customer' && !isSupabaseConfigured) {
      onLogin('customer');
      return;
    }
    setStep('credentials');
    // Pré-remplir les identifiants démo
    const demo = DEMO_CREDENTIALS[role];
    if (demo.email) setEmail(demo.email);
    if (demo.password) setPassword(demo.password);
    if (demo.code) setAccessCode(demo.code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    try {
      if (!isSupabaseConfigured) {
        // Mode démo — connexion directe sans Supabase
        if (selectedRole === 'supplier') {
          const code = accessCode.toUpperCase();
          if (!['MAR001', 'PHA002', 'BON003', 'ROI004'].includes(code)) {
            setError('Code d\'accès invalide. Codes démo : MAR001, PHA002, BON003, ROI004');
            setLoading(false);
            return;
          }
          onLogin('supplier', code);
          return;
        }
        onLogin(selectedRole);
        return;
      }

      // Connexion réelle via Supabase
      if (selectedRole === 'supplier') {
        const { error: authError, supplier } = await signInWithAccessCode(accessCode);
        if (authError) { setError(authError.message); return; }
        onLogin('supplier', supplier?.id);
        return;
      }

      const { data, error: authError } = await signInWithEmail(email, password);
      if (authError) { setError(authError.message); return; }
      if (!data.user) { setError('Erreur de connexion'); return; }

      const profile = await getCurrentProfile();
      const role = profile?.role ?? selectedRole;
      onLogin(role, profile?.supplier_id ?? undefined);

    } catch (e) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const role = selectedRole ? ROLES.find(r => r.id === selectedRole) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
          <span className="text-4xl">🛵</span>
        </div>
        <h1 className="text-3xl font-black text-white">Abengourou Express</h1>
        <p className="text-green-300 text-sm mt-1">Livraison & Courses rapides</p>
        {!isSupabaseConfigured && (
          <span className="mt-2 inline-block text-[10px] font-bold text-yellow-300 bg-yellow-900/50 px-3 py-1 rounded-full">
            MODE DÉMO — Supabase non configuré
          </span>
        )}
      </div>

      <div className="w-full max-w-sm">
        {step === 'role' ? (
          <div className="space-y-3">
            <p className="text-green-200 text-sm font-bold text-center mb-4">Choisissez votre rôle</p>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => selectRole(r.id)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {r.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-black text-white">{r.label}</p>
                  <p className="text-green-300 text-xs mt-0.5">{r.desc}</p>
                </div>
                <span className="text-white/50 text-lg">›</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {/* Back button */}
            <button onClick={() => { setStep('role'); setError(''); }} className="flex items-center gap-1.5 text-gray-400 text-sm font-bold mb-5 hover:text-gray-600 transition-colors">
              ← Retour
            </button>

            {role && (
              <div className={`border-2 rounded-2xl p-4 mb-5 ${role.color}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{role.emoji}</span>
                  <div>
                    <p className="font-black text-gray-900">{role.label}</p>
                    <p className="text-xs text-gray-500">{role.desc}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedRole === 'supplier' ? (
                <div>
                  <label className="text-xs font-black text-gray-600 block mb-1.5 uppercase tracking-wide">
                    Code d'accès fournisseur
                  </label>
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition-colors">
                    <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={accessCode}
                      onChange={e => setAccessCode(e.target.value.toUpperCase())}
                      placeholder="Ex: MAR001"
                      maxLength={10}
                      className="flex-1 outline-none text-base font-black tracking-widest text-gray-900 placeholder-gray-300"
                      autoComplete="off"
                    />
                  </div>
                  {!isSupabaseConfigured && (
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Codes démo : MAR001, PHA002, BON003, ROI004
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-black text-gray-600 block mb-1.5 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre@email.ci"
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-600 block mb-1.5 uppercase tracking-wide">Mot de passe</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-green-500 transition-colors">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="flex-1 outline-none text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-base hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Connexion...</>
                ) : (
                  `Se connecter en tant que ${role?.label}`
                )}
              </button>
            </form>

            {!isSupabaseConfigured && selectedRole !== 'supplier' && (
              <p className="text-center text-[10px] text-gray-400 mt-4">
                Mode démo — cliquez sur "Se connecter" directement
              </p>
            )}
          </div>
        )}
      </div>

      <p className="text-green-400/50 text-xs mt-8 text-center">
        📍 Abengourou, Côte d'Ivoire
      </p>
    </div>
  );
};

export default LoginScreen;
