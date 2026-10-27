import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <Router>
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
