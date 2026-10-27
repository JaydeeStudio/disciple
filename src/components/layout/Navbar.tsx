import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Menu, X, BookOpen, Calculator, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// Stylized, elegant spiritual emblem: minimalist dawn star & olive/guidance paths
const BrandEmblem: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => (
  <svg 
    viewBox="0 0 44 44" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    <rect width="44" height="44" rx="12" fill="#242220" />
    {/* Inner subtle halo */}
    <circle cx="22" cy="22" r="14" stroke="#c09462" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
    {/* Compass / Dawn Star */}
    <path 
      d="M22 8L24.5 19.5L36 22L24.5 24.5L22 36L19.5 24.5L8 22L19.5 19.5L22 8Z" 
      fill="#d4a373"
      opacity="0.9"
    />
    {/* Central core */}
    <circle cx="22" cy="22" r="2.5" fill="#fdfaf5" />
    {/* Diagonal rays */}
    <path d="M14 14L17 17M27 27L30 30M30 14L27 17M14 30L17 27" stroke="#fdfaf5" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3.5",
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-ochre/15" : "bg-transparent"
    )}>
      <div className="container mx-auto flex items-center justify-between gap-4 max-w-6xl">
        
        {/* Brand Logo & Name - Single compact unit */}
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
        
        {/* Desktop Navigation Links - Always single line, with comfortable spacing */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-nowrap">
          <Link 
            to="/test" 
            className={cn(
              "text-xs lg:text-sm font-bold transition-all flex items-center gap-2 px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0",
              location.pathname === '/test' 
                ? "bg-brand-terracotta text-white shadow-sm" 
                : "text-brand-charcoal hover:text-brand-terracotta hover:bg-brand-ochre/10"
            )}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Faire le test</span>
          </Link>

          <Link 
            to="/personnages" 
            className={cn(
              "text-xs lg:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0",
              location.pathname === '/personnages' 
                ? "text-brand-terracotta" 
                : "text-brand-charcoal hover:text-brand-terracotta"
            )}
          >
            <BookOpen className="w-4 h-4 text-brand-ochre shrink-0" />
            <span>36 personnages</span>
          </Link>

          <Link 
            to="/methodologie" 
            className={cn(
              "text-xs lg:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0",
              location.pathname === '/methodologie' 
                ? "text-brand-terracotta" 
                : "text-brand-charcoal hover:text-brand-terracotta"
            )}
          >
            <Calculator className="w-4 h-4 text-brand-sage shrink-0" />
            <span>Méthodologie</span>
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
            className="md:hidden absolute top-full left-4 right-4 bg-white rounded-2xl shadow-xl border border-brand-ochre/20 p-5 mt-2 flex flex-col gap-3 z-50"
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
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">36 questions</span>
            </Link>

            <Link 
              to="/personnages" 
              onClick={() => setIsOpen(false)} 
              className="py-2.5 px-3 text-sm font-medium text-brand-charcoal hover:bg-brand-bg rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-ochre" />
                36 personnages
              </span>
            </Link>

            <Link 
              to="/methodologie" 
              onClick={() => setIsOpen(false)} 
              className="py-2.5 px-3 text-sm font-medium text-brand-charcoal hover:bg-brand-bg rounded-lg flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-brand-sage" />
              <span>Méthodologie & calcul</span>
            </Link>

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
