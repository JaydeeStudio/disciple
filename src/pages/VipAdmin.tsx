import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Gift,
  CheckCircle2,
  HelpCircle,
  Compass
} from 'lucide-react';
import { ARCHETYPES } from '../data/archetypes';
import { 
  createVipToken, 
  getAllVipTokens, 
  deleteVipToken, 
  VipTokenData 
} from '../services/vipService';
import { triggerHaptic } from '../lib/haptics';

// Default administration passcode (can be overridden via VITE_ADMIN_PASSCODE)
const DEFAULT_PASSCODE = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSCODE) || 
  'bio2026';

const VipAdmin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('vip_admin_auth') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Creation form state
  const [recipientName, setRecipientName] = useState<string>('');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('');
  const [linkDestination, setLinkDestination] = useState<'test' | 'direct'>('test');
  const [note, setNote] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [lastCreatedLink, setLastCreatedLink] = useState<{ name: string; link: string; type: string } | null>(null);

  // Tokens list state
  const [tokens, setTokens] = useState<VipTokenData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showPasscodeHelp, setShowPasscodeHelp] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadTokens();
    }
  }, [isAuthenticated]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const list = await getAllVipTokens();
      setTokens(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === DEFAULT_PASSCODE) {
      sessionStorage.setItem('vip_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      triggerHaptic('success');
    } else {
      triggerHaptic('warning');
      setAuthError('Code d\'accès administrateur incorrect.');
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) return;

    setCreating(true);
    triggerHaptic('medium');

    try {
      const res = await createVipToken(
        recipientName.trim(),
        selectedArchetype || undefined,
        note.trim() || undefined
      );

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://discipledejesus.netlify.app';
      const finalLink = linkDestination === 'test' 
        ? `${origin}/test?vip=${res.token}` 
        : `${origin}/commande-succes?vip=${res.token}`;

      setLastCreatedLink({
        name: recipientName.trim(),
        link: finalLink,
        type: linkDestination === 'test' ? 'Invitation Test personnalisé (3 min)' : 'Accès direct téléchargement'
      });

      setRecipientName('');
      setNote('');
      triggerHaptic('success');
      await loadTokens();
    } catch (err) {
      console.error("Erreur création token VIP :", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (token: string, directUrl?: string, destination: 'test' | 'direct' = 'test') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://discipledejesus.netlify.app';
    const link = directUrl || (destination === 'test' ? `${origin}/test?vip=${token}` : `${origin}/commande-succes?vip=${token}`);
    navigator.clipboard.writeText(link);
    setCopiedToken(`${token}_${destination}`);
    triggerHaptic('success');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDeleteToken = async (token: string) => {
    if (!confirm(`Supprimer définitivement l'invitation VIP ${token} ?`)) return;
    triggerHaptic('medium');
    await deleteVipToken(token);
    setTokens(prev => prev.filter(t => t.token !== token));
  };

  const activeTokensCount = tokens.filter(t => !t.used).length;
  const usedTokensCount = tokens.filter(t => t.used).length;

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 pb-20 px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-brand-ochre/20 shadow-xl text-center"
        >
          <div className="w-14 h-14 bg-brand-ochre/10 text-brand-ochre rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-7 h-7" />
          </div>

          <h1 className="font-display text-2xl text-brand-charcoal mb-2">
            Espace d'Administration
          </h1>
          <p className="text-xs text-brand-charcoal/60 mb-6">
            Gestion confidentielle des invitations VIP à usage unique (dossier 35 pages offert).
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Entrez le code secret..."
                className="w-full bg-brand-bg border border-brand-ochre/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-ochre text-center tracking-widest font-mono"
                required
              />
            </div>

            {authError && (
              <div className="text-xs text-red-600 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brand-charcoal hover:bg-brand-ochre text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              Déverrouiller
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-brand-ochre/10 text-center">
            <Link to="/" className="text-xs text-brand-charcoal/50 hover:text-brand-charcoal flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au site public</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Bar Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/"
              className="p-2.5 bg-white border border-brand-ochre/20 rounded-xl text-brand-charcoal hover:text-brand-ochre transition-colors"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[11px] font-bold text-brand-ochre uppercase tracking-wider block">
                Espace Réservé • Gestion Privée
              </span>
              <h1 className="font-display text-2xl sm:text-3xl text-brand-charcoal">
                Générateur de Liens Magiques VIP
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasscodeHelp(!showPasscodeHelp)}
              className="px-3 py-2 bg-white border border-brand-ochre/20 text-xs font-medium text-brand-charcoal/70 hover:text-brand-ochre rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Changer le mot de passe</span>
            </button>
            <button
              onClick={loadTokens}
              className="p-2.5 bg-white border border-brand-ochre/20 rounded-xl text-brand-charcoal/70 hover:text-brand-ochre transition-colors cursor-pointer"
              title="Actualiser la liste"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-ochre' : ''}`} />
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('vip_admin_auth');
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 bg-white border border-brand-ochre/20 text-xs font-bold text-brand-charcoal/70 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
            >
              Verrouiller
            </button>
          </div>
        </div>

        {/* Passcode Help Card */}
        {showPasscodeHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-2"
          >
            <div className="flex items-center justify-between font-bold text-amber-900 text-sm">
              <span>🔐 Comment modifier le code d'accès de cette page ?</span>
              <button 
                onClick={() => setShowPasscodeHelp(false)}
                className="text-amber-800 hover:text-amber-950 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="leading-relaxed">
              Le code actuel par défaut est <strong className="font-mono bg-amber-200/60 px-1 py-0.5 rounded">{DEFAULT_PASSCODE}</strong>. Vous pouvez le changer de deux manières :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                <strong>Sur Netlify (Recommandé)</strong> : Rendez-vous dans <em>Site configuration &gt; Environment variables</em> et ajoutez <code className="font-mono bg-white px-1 py-0.5 rounded">VITE_ADMIN_PASSCODE</code> avec la valeur secrète de votre choix.
              </li>
              <li>
                <strong>Dans le code source</strong> : Modifiez la variable <code className="font-mono bg-white px-1 py-0.5 rounded">DEFAULT_PASSCODE</code> dans le fichier <code className="font-mono bg-white px-1 py-0.5 rounded">src/pages/VipAdmin.tsx</code>.
              </li>
            </ul>
          </motion.div>
        )}

        {/* Counters summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-ochre/15 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-charcoal/60 uppercase">Total Invitations</span>
              <Gift className="w-4 h-4 text-brand-ochre" />
            </div>
            <span className="text-3xl font-display font-bold text-brand-charcoal">{tokens.length}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-ochre/15 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase">Actifs (Non utilisés)</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-3xl font-display font-bold text-emerald-700">{activeTokensCount}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-ochre/15 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-charcoal/60 uppercase">Consommés (1 usage fait)</span>
              <ShieldCheck className="w-4 h-4 text-brand-charcoal/40" />
            </div>
            <span className="text-3xl font-display font-bold text-brand-charcoal/60">{usedTokensCount}</span>
          </div>
        </div>

        {/* Link Creation Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-ochre/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand-ochre/10 text-brand-ochre rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl text-brand-charcoal">
                Créer un nouveau Lien Magique VIP
              </h2>
              <p className="text-xs text-brand-charcoal/60">
                L'invité passe le test ou accède directement au guide complet de 35 pages sans payer. Le lien se scelle automatiquement après le premier téléchargement.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateToken} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-xs font-bold text-brand-charcoal/80 block mb-1">
                  Nom ou Titre de l'invité *
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ex: Pasteur Thomas, Sophie..."
                  className="w-full bg-brand-bg border border-brand-ochre/20 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-ochre"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-charcoal/80 block mb-1">
                  Type de lien à générer
                </label>
                <select
                  value={linkDestination}
                  onChange={(e) => setLinkDestination(e.target.value as any)}
                  className="w-full bg-brand-bg border border-brand-ochre/20 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-ochre font-medium"
                >
                  <option value="test">Passer le test en 1er (Recommandé)</option>
                  <option value="direct">Accès direct au téléchargement</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-charcoal/80 block mb-1">
                  Note interne / Contexte
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Partenaire conférence, Bêta..."
                  className="w-full bg-brand-bg border border-brand-ochre/20 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-ochre"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={creating || !recipientName.trim()}
                className="px-6 py-3 bg-brand-ochre hover:bg-brand-ochre/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Création du lien en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Générer mon lien magique VIP</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Last created link banner with quick copy */}
          <AnimatePresence>
            {lastCreatedLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    ✨ Lien VIP généré pour {lastCreatedLink.name} ({lastCreatedLink.type}) !
                  </span>
                  <p className="text-xs text-emerald-950 font-mono mt-1 break-all">
                    {lastCreatedLink.link}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyLink('', lastCreatedLink.link)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le lien</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Existing Tokens Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-ochre/15 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-brand-charcoal">
                Historique des invitations VIP ({tokens.length})
              </h2>
              <p className="text-xs text-brand-charcoal/50">
                Vous pouvez copier le lien du test ou le lien direct pour chacun
              </p>
            </div>
            <span className="text-xs text-brand-charcoal/50">
              Usage unique scellé
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-brand-charcoal/60 text-sm">
              <div className="w-8 h-8 border-2 border-brand-ochre border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Chargement des invitations...</span>
            </div>
          ) : tokens.length === 0 ? (
            <div className="py-12 text-center text-brand-charcoal/50 text-sm">
              Aucune invitation VIP créée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-ochre/10 text-xs font-bold text-brand-charcoal/50 uppercase tracking-wider">
                    <th className="pb-3">Destinataire</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3">Note</th>
                    <th className="pb-3 text-right">Copier lien invité</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-ochre/10">
                  {tokens.map((tok) => {
                    const isUsed = tok.used || tok.useCount >= 1;

                    return (
                      <tr key={tok.token} className="hover:bg-brand-bg/50 transition-colors">
                        <td className="py-4 font-semibold text-brand-charcoal">
                          <span>{tok.recipientName}</span>
                          <span className="block text-[10px] font-mono text-brand-charcoal/40 font-normal">
                            ID: {tok.token}
                          </span>
                        </td>

                        <td className="py-4">
                          {isUsed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                              <ShieldCheck className="w-3 h-3 text-gray-500" />
                              <span>Consommé (1/1)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Actif (0/1)</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 text-xs text-brand-charcoal/60 max-w-[150px] truncate">
                          {tok.note || '—'}
                        </td>

                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyLink(tok.token, undefined, 'test')}
                              className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-ochre hover:text-white rounded-lg text-xs font-medium text-brand-charcoal transition-colors cursor-pointer flex items-center gap-1"
                              title="Lien vers le test en 3 min"
                            >
                              {copiedToken === `${tok.token}_test` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Compass className="w-3.5 h-3.5" />
                              )}
                              <span>Lien test</span>
                            </button>

                            <button
                              onClick={() => handleCopyLink(tok.token, undefined, 'direct')}
                              className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-charcoal hover:text-white rounded-lg text-xs font-medium text-brand-charcoal/70 transition-colors cursor-pointer flex items-center gap-1"
                              title="Lien direct téléchargement"
                            >
                              {copiedToken === `${tok.token}_direct` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>Direct</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteToken(tok.token)}
                            className="p-2 bg-brand-bg hover:bg-red-50 hover:text-red-600 rounded-lg text-brand-charcoal/40 transition-colors cursor-pointer"
                            title="Supprimer l'invitation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VipAdmin;
