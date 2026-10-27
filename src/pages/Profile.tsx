import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Book, History, ChevronRight, Bookmark } from 'lucide-react';
import { ARCHETYPES } from '../data/archetypes';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'testResults'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setResults(history);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Book className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-display mb-4">Espace personnel</h2>
        <p className="text-slate-600 mb-8">Veuillez vous connecter pour voir votre historique de croissance spirituelle.</p>
        <Link to="/" className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full font-bold">Retour à l'accueil</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-6 mb-12">
          <img src={user.photoURL || ''} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
          <div>
            <h1 className="text-3xl font-display">{user.displayName}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-amber-500" />
              Historique des tests
            </h2>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
              </div>
            ) : results.length > 0 ? (
              results.map((res, i) => (
                <ResultCard key={res.id} result={res} index={i} />
              ))
            ) : (
              <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
                Vous n'avez pas encore passé le test.
                <Link to="/test" className="block text-amber-600 font-bold mt-2">Commencer maintenant</Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
              <Bookmark className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold mb-4">Journal spirituel</h3>
              <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                Gardez une trace de ce que le Seigneur vous montre à travers vos différents archétypes.
              </p>
              <button disabled className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed">
                Bientôt disponible
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultCard: React.FC<{ result: any; index: number }> = ({ result, index }) => {
  const archetype = ARCHETYPES[result.archetypeKey];
  if (!archetype) return null;

  const date = result.createdAt?.toDate ? result.createdAt.toDate() : new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
    >
      <Link to={`/resultats/${result.id}`} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-amber-50 transition-colors">
            <span className="text-2xl">🕊️</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{archetype.name}</h3>
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              {format(date, 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
      </Link>
    </motion.div>
  );
};

export default Profile;
