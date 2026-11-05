import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  User, 
  Menu, 
  X, 
  BookOpen, 
  Calculator, 
  Compass, 
  Users, 
  ChevronDown, 
  HelpCircle,
  FileText,
  Grid,
  HeartHandshake,
  Layers,
  Heart,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// Stylized, elegant spiritual emblem: minimalist dawn star & golden halo
const BrandEmblem: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => (
  <svg 
    viewBox="0 0 44 44" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    <rect width="44" height="44" rx="12" fill="#242220" />
    <circle cx="22" cy="22" r="14" stroke="#c09462" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
    <path 
      d="M22 8L24.5 19.5L36 22L24.5 24.5L22 36L19.5 24.5L8 22L19.5 19.5L22 8Z" 
      fill="#d4a373"
      opacity="0.9"
    />
    <circle cx="22" cy="22" r="2.5" fill="#fdfaf5" />
    <path d="M14 14L17 17M27 27L30 30M30 14L27 17M14 30L17 27" stroke="#fdfaf5" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

interface SubMenuItem {
  title: string;
  description: string;
  href: string;
  icon: React.FC<{ className?: string }>;
}

interface NavItemWithDropdown {
  id: string;
  label: string;
  rootPath: string;
  icon: React.FC<{ className?: string }>;
  items: SubMenuItem[];
}

// Seulement Kit Groupes et Méthodologie ont un menu déroulant
const DROPDOWN_MENUS: NavItemWithDropdown[] = [
  {
    id: 'kit-groupes',
    label: 'Kit groupes',
    rootPath: '/kit-communaute',
    icon: Users,
    items: [
      {
        title: "Vue d'ensemble du kit",
        description: "Matériel d'animation pour églises, équipes et groupes de maison",
        href: '/kit-communaute',
        icon: Users
      },
      {
        title: 'Les 3 ressources du kit',
        description: 'Fiche 45 min, Matrice murale A3 et Guide des binômes',
        href: '/kit-communaute#ressources-kit',
        icon: FileText
      },
      {
        title: 'Diagnostic d’équipe en direct',
        description: 'Matrice collective et complémentarités en temps réel',
        href: '/kit-communaute#diagnostic-equipe',
        icon: Grid
      }
    ]
  },
  {
    id: 'methodologie',
    label: 'Méthodologie',
    rootPath: '/methodologie',
    icon: Calculator,
    items: [
      {
        title: 'Comment ça marche',
        description: 'Ancrage scripturaire et psychométrie des tempéraments',
        href: '/methodologie',
        icon: Calculator
      },
      {
        title: 'Les 5 dimensions bibliques',
        description: 'Le modèle des tempéraments et des 5 équilibres de foi',
        href: '/methodologie#dimensions',
        icon: Sliders
      },
      {
        title: 'Fonctionnement du calcul',
        description: 'De vos 20 réponses au calcul objectif de ressemblance',
        href: '/methodologie#calcul',
        icon: Layers
      },
      {
        title: 'Éthique & discernement pastoral',
        description: 'Ce que ce test est — et ce qu\'il n\'est pas',
        href: '/methodologie#ethique',
        icon: Heart
      }
    ]
  }
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname, location.search]);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Helper to handle anchor jump both when already on the page or when changing page
  const handleAnchorClick = (href: string) => {
    setActiveDropdown(null);
    setIsOpen(false);
    const [path, hash] = href.split('#');
    if (hash && location.pathname === path) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3.5",
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-ochre/15" : "bg-transparent"
    )}>
      <div className="container mx-auto flex items-center justify-between gap-4 max-w-6xl">
        
        {/* Brand Logo & Name */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group shrink-0"
          aria-label="Accueil - Disciple : Test des archétypes bibliques"
        >
          <div className="transition-transform group-hover:scale-105 duration-200">
            <BrandEmblem className="w-10 h-10 shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-brand-charcoal leading-none group-hover:text-brand-terracotta transition-colors">
              DISCIPLE
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-brand-sage uppercase mt-1 leading-none">
              Archétypes bibliques
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2 flex-nowrap">
          
          {/* 1. 36 Figures (Bouton simple sans menu déroulant) */}
          <Link
            to="/personnages"
            className={cn(
              "px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
              location.pathname.startsWith('/personnages')
                ? "text-brand-terracotta bg-brand-terracotta/5"
                : "text-brand-charcoal hover:text-brand-terracotta hover:bg-brand-ochre/5"
            )}
          >
            <BookOpen className="w-4 h-4 text-brand-ochre shrink-0" />
            <span>36 figures</span>
          </Link>

          {/* 2. Kit Groupes (Avec menu déroulant ordonné) */}
          {(() => {
            const dropdown = DROPDOWN_MENUS.find(d => d.id === 'kit-groupes')!;
            const isCurrentPage = location.pathname.startsWith(dropdown.rootPath);
            const isDropdownOpen = activeDropdown === dropdown.id;
            const Icon = dropdown.icon;

            return (
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter(dropdown.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={dropdown.rootPath}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                    isCurrentPage 
                      ? "text-brand-terracotta bg-brand-terracotta/5" 
                      : isDropdownOpen
                        ? "text-brand-charcoal bg-brand-ochre/10"
                        : "text-brand-charcoal hover:text-brand-terracotta hover:bg-brand-ochre/5"
                  )}
                  aria-expanded={isDropdownOpen}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isCurrentPage ? "text-brand-terracotta" : "text-brand-ochre")} />
                  <span>{dropdown.label}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 opacity-60 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                </Link>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-brand-ochre/20 p-2 z-50 overflow-hidden"
                    >
                      <div className="space-y-1">
                        {dropdown.items.map((item, idx) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={idx}
                              to={item.href}
                              onClick={() => handleAnchorClick(item.href)}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-brand-bg transition-colors group/item"
                            >
                              <div className="w-8 h-8 rounded-lg bg-brand-ochre/10 text-brand-charcoal group-hover/item:bg-brand-terracotta/10 group-hover/item:text-brand-terracotta flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-brand-charcoal group-hover/item:text-brand-terracotta transition-colors leading-tight">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-brand-charcoal/60 leading-snug mt-0.5 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          {/* 3. Méthodologie (Avec menu déroulant ordonné) */}
          {(() => {
            const dropdown = DROPDOWN_MENUS.find(d => d.id === 'methodologie')!;
            const isCurrentPage = location.pathname.startsWith(dropdown.rootPath);
            const isDropdownOpen = activeDropdown === dropdown.id;
            const Icon = dropdown.icon;

            return (
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter(dropdown.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={dropdown.rootPath}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                    isCurrentPage 
                      ? "text-brand-terracotta bg-brand-terracotta/5" 
                      : isDropdownOpen
                        ? "text-brand-charcoal bg-brand-ochre/10"
                        : "text-brand-charcoal hover:text-brand-terracotta hover:bg-brand-ochre/5"
                  )}
                  aria-expanded={isDropdownOpen}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isCurrentPage ? "text-brand-terracotta" : "text-brand-ochre")} />
                  <span>{dropdown.label}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 opacity-60 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                </Link>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-brand-ochre/20 p-2 z-50 overflow-hidden"
                    >
                      <div className="space-y-1">
                        {dropdown.items.map((item, idx) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={idx}
                              to={item.href}
                              onClick={() => handleAnchorClick(item.href)}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-brand-bg transition-colors group/item"
                            >
                              <div className="w-8 h-8 rounded-lg bg-brand-ochre/10 text-brand-charcoal group-hover/item:bg-brand-terracotta/10 group-hover/item:text-brand-terracotta flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-brand-charcoal group-hover/item:text-brand-terracotta transition-colors leading-tight">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-brand-charcoal/60 leading-snug mt-0.5 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          {/* 4. FAQ (Bouton simple sans menu déroulant) */}
          <Link
            to="/faq"
            className={cn(
              "px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
              location.pathname.startsWith('/faq')
                ? "text-brand-terracotta bg-brand-terracotta/5"
                : "text-brand-charcoal hover:text-brand-terracotta hover:bg-brand-ochre/5"
            )}
          >
            <HelpCircle className="w-4 h-4 text-brand-ochre shrink-0" />
            <span>FAQ</span>
          </Link>

        </div>

        {/* Right Action: Direct test CTA or Profile if signed in */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/profil" 
                title="Mon profil et mes résultats"
                className="px-3 py-1.5 text-brand-charcoal hover:bg-brand-ochre/10 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold border border-brand-ochre/15"
              >
                <div className="w-6 h-6 rounded-full bg-brand-charcoal text-white flex items-center justify-center text-[10px] font-bold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden lg:inline">{user.displayName?.split(' ')[0] || 'Profil'}</span>
              </Link>
              <button 
                onClick={logout}
                title="Se déconnecter"
                className="text-xs font-medium text-brand-charcoal/60 hover:text-brand-terracotta transition-colors p-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/test" 
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm",
                location.pathname === '/test'
                  ? "bg-brand-ochre/20 text-brand-charcoal border border-brand-ochre/30"
                  : "bg-brand-charcoal hover:bg-brand-terracotta text-white"
              )}
            >
              <Compass className="w-4 h-4 text-brand-ochre" />
              <span>{location.pathname === '/test' ? 'Test en cours' : 'Commencer le test'}</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden p-2 text-brand-charcoal rounded-lg hover:bg-brand-ochre/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-4 right-4 bg-white rounded-2xl shadow-xl border border-brand-ochre/20 p-5 mt-2 flex flex-col gap-3 z-50 max-h-[85vh] overflow-y-auto"
          >
            <Link 
              to="/test" 
              onClick={() => setIsOpen(false)} 
              className="py-3 px-4 bg-brand-charcoal text-white rounded-xl text-sm font-bold flex items-center justify-between shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-ochre" />
                Faire le test
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">20 questions</span>
            </Link>

            <div className="space-y-2 pt-1">
              
              {/* 36 figures mobile */}
              <Link
                to="/personnages"
                onClick={() => setIsOpen(false)}
                className="py-2.5 px-3 text-sm font-bold text-brand-charcoal hover:text-brand-terracotta rounded-lg flex items-center justify-between border-b border-brand-ochre/10"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-ochre" />
                  36 figures bibliques
                </span>
              </Link>

              {/* Kit Groupes mobile */}
              <div className="border-b border-brand-ochre/10 pb-2">
                <Link
                  to="/kit-communaute"
                  onClick={() => setIsOpen(false)}
                  className="py-2 px-3 text-sm font-bold text-brand-charcoal hover:text-brand-terracotta rounded-lg flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-ochre" />
                    Kit groupes
                  </span>
                  <span className="text-[10px] text-brand-charcoal/40 font-normal">Voir tout →</span>
                </Link>
                <div className="pl-8 pr-2 space-y-1 mt-1">
                  <Link
                    to="/kit-communaute#ressources-kit"
                    onClick={() => { setIsOpen(false); handleAnchorClick('/kit-communaute#ressources-kit'); }}
                    className="block text-xs text-brand-charcoal/70 hover:text-brand-terracotta py-1"
                  >
                    Les 3 ressources du kit
                  </Link>
                  <Link
                    to="/kit-communaute#diagnostic-equipe"
                    onClick={() => { setIsOpen(false); handleAnchorClick('/kit-communaute#diagnostic-equipe'); }}
                    className="block text-xs text-brand-charcoal/70 hover:text-brand-terracotta py-1"
                  >
                    Diagnostic d'équipe en direct
                  </Link>
                </div>
              </div>

              {/* Méthodologie mobile */}
              <div className="border-b border-brand-ochre/10 pb-2">
                <Link
                  to="/methodologie"
                  onClick={() => setIsOpen(false)}
                  className="py-2 px-3 text-sm font-bold text-brand-charcoal hover:text-brand-terracotta rounded-lg flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-brand-ochre" />
                    Méthodologie
                  </span>
                  <span className="text-[10px] text-brand-charcoal/40 font-normal">Voir tout →</span>
                </Link>
                <div className="pl-8 pr-2 space-y-1 mt-1">
                  <Link
                    to="/methodologie#dimensions"
                    onClick={() => { setIsOpen(false); handleAnchorClick('/methodologie#dimensions'); }}
                    className="block text-xs text-brand-charcoal/70 hover:text-brand-terracotta py-1"
                  >
                    Les 5 dimensions bibliques
                  </Link>
                  <Link
                    to="/methodologie#calcul"
                    onClick={() => { setIsOpen(false); handleAnchorClick('/methodologie#calcul'); }}
                    className="block text-xs text-brand-charcoal/70 hover:text-brand-terracotta py-1"
                  >
                    Fonctionnement du calcul
                  </Link>
                  <Link
                    to="/methodologie#ethique"
                    onClick={() => { setIsOpen(false); handleAnchorClick('/methodologie#ethique'); }}
                    className="block text-xs text-brand-charcoal/70 hover:text-brand-terracotta py-1"
                  >
                    Éthique & discernement pastoral
                  </Link>
                </div>
              </div>

              {/* FAQ mobile */}
              <Link
                to="/faq"
                onClick={() => setIsOpen(false)}
                className="py-2.5 px-3 text-sm font-bold text-brand-charcoal hover:text-brand-terracotta rounded-lg flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-ochre" />
                  Foire Aux Questions
                </span>
              </Link>

            </div>

            {user && (
              <div className="pt-2 border-t border-brand-ochre/15 mt-1 flex items-center justify-between">
                <Link 
                  to="/profil" 
                  onClick={() => setIsOpen(false)} 
                  className="text-sm font-bold text-brand-charcoal flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Mon profil</span>
                </Link>
                <button 
                  onClick={() => { logout(); setIsOpen(false); }} 
                  className="text-xs font-bold text-brand-terracotta"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
