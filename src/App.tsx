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
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AnimatePresence } from 'motion/react';

// Ensures the page automatically scrolls to top when changing route
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <Router>
          <ScrollToTop />
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
