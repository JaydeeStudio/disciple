import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { TestProvider } from './contexts/TestContext';
import Home from './pages/Home';
import Test from './pages/Test';
import Results from './pages/Results';
import Profile from './pages/Profile';
import CharactersGallery from './pages/CharactersGallery';
import Methodology from './pages/Methodology';
import OrderSuccess from './pages/OrderSuccess';
import VipAdmin from './pages/VipAdmin';
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AnimatePresence } from 'motion/react';
import { verifyVipToken } from './services/vipService';

// Ensures the page automatically scrolls to top when changing route
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Global listener that detects ?vip=TOKEN on any page (homepage, test, results...)
const VipPassHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vip = params.get('vip') || params.get('token');
    if (vip) {
      verifyVipToken(vip).then(res => {
        if (res.valid && !res.used && res.data) {
          try {
            localStorage.setItem('disciple_active_vip', JSON.stringify({
              token: vip,
              recipientName: res.data.recipientName,
              archetypeKey: res.data.archetypeKey || null,
              verifiedAt: new Date().toISOString()
            }));
          } catch (e) {
            console.warn("Erreur stockage VIP localStorage :", e);
          }
        }
      });
    }
  }, [location.search]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <Router>
          <ScrollToTop />
          <VipPassHandler />
          <div className="relative min-h-screen flex flex-col justify-between">
            <div>
              <Navbar />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/resultats/:id" element={<Results />} />
                  <Route path="/personnages" element={<CharactersGallery />} />
                  <Route path="/methodologie" element={<Methodology />} />
                  <Route path="/profil" element={<Profile />} />
                  <Route path="/commande-succes" element={<OrderSuccess />} />
                  <Route path="/guide-complet-telechargement" element={<OrderSuccess />} />
                  <Route path="/admin" element={<VipAdmin />} />
                  <Route path="/admin-vip" element={<VipAdmin />} />
                </Routes>
              </AnimatePresence>
            </div>
            <Footer />
          </div>
        </Router>
      </TestProvider>
    </AuthProvider>
  );
}

export default App;
