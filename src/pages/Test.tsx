import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTest } from '../contexts/TestContext';
import { QUESTIONS } from '../data/questions';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

const Test: React.FC = () => {
  const { 
    currentQuestionIndex, 
    answers, 
    setAnswer, 
    nextQuestion, 
    prevQuestion, 
    calculateResult,
    getFullCalculation,
    userData,
    setUserData
  } = useTest();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'M' | 'F' | 'OTHER'>('M');
  const [formAge, setFormAge] = useState('');

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const currentAnswer = answers[currentQuestion.id];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName && formAge) {
      setUserData({ name: formName, gender: formGender, age: formAge });
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-brand-bg pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 md:p-14 rounded-[2rem] shadow-xl border border-brand-ochre/10"
          >
            <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs">Première étape</span>
            <h2 className="font-display text-4xl mt-4 mb-8 text-brand-charcoal leading-tight">Mieux vous connaître</h2>
            
            <form onSubmit={handleStart} className="space-y-6">
              <div>
                <label className="block text-brand-charcoal/60 text-sm font-bold uppercase tracking-wider mb-2">Comment vous appelez-vous ?</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-brand-bg border-2 border-brand-ochre/10 rounded-xl p-4 focus:border-brand-terracotta outline-none transition-all"
                  placeholder="Votre prénom..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brand-charcoal/60 text-sm font-bold uppercase tracking-wider mb-2">Votre sexe</label>
                  <select 
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full bg-brand-bg border-2 border-brand-ochre/10 rounded-xl p-4 focus:border-brand-terracotta outline-none transition-all appearance-none"
                  >
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-charcoal/60 text-sm font-bold uppercase tracking-wider mb-2">Âge</label>
                  <input 
                    type="number" 
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className="w-full bg-brand-bg border-2 border-brand-ochre/10 rounded-xl p-4 focus:border-brand-terracotta outline-none transition-all"
                    placeholder="Ex: 35"
                    required
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-5 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-charcoal/10"
                >
                  Suivant
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleFinish = async () => {
    const calc = getFullCalculation();
    const archetypeKey = calc.primaryMatch.archetype.key;

    if (!user) {
      navigate(`/resultats/${archetypeKey}`, { 
        state: { 
          tempScores: answers,
          calculation: calc,
          userData: userData 
        } 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'testResults'), {
        userId: user.uid,
        archetypeKey,
        answers,
        affinity: calc.primaryMatch.affinity,
        rawScores: calc.rawScores,
        userData: userData,
        secondaryArchetypes: calc.secondaryMatches.map(m => ({
          key: m.archetype.key,
          name: m.archetype.name,
          affinity: m.affinity
        })),
        createdAt: serverTimestamp(),
      });
      navigate(`/resultats/${docRef.id}`, {
        state: {
          calculation: calc,
          userData: userData
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testResults');
      
      // Fallback in case of error (non-fatal for user experience)
      navigate(`/resultats/${archetypeKey}`, {
        state: {
          calculation: calc,
          userData: userData
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-brand-terracotta font-bold tracking-[0.2em] uppercase text-xs">Disciple en chemin</span>
              <h2 className="font-display text-2xl mt-1 text-brand-charcoal">Question {currentQuestionIndex + 1} <span className="text-brand-charcoal/30 text-base font-sans">/ {QUESTIONS.length}</span></h2>
            </div>
            <span className="text-brand-charcoal/40 font-display text-2xl font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-brand-ochre/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-terracotta"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-10 md:p-14 rounded-[2rem] shadow-xl border border-brand-ochre/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
            
            <h3 className="text-2xl md:text-3xl font-display mb-12 leading-relaxed text-brand-charcoal">
              {currentQuestion.text}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  id={`option-${index}`}
                  onClick={() => setAnswer(currentQuestion.id, index)}
                  className={cn(
                    "w-full text-left p-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-between group",
                    currentAnswer === index 
                      ? "border-brand-terracotta bg-brand-terracotta/5" 
                      : "border-brand-ochre/10 hover:border-brand-ochre/25"
                  )}
                >
                  <span className={cn(
                    "text-lg transition-colors",
                    currentAnswer === index ? "text-brand-charcoal font-bold" : "text-brand-charcoal/60"
                  )}>
                    {option.text}
                  </span>
                  
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    currentAnswer === index 
                      ? "border-brand-terracotta bg-brand-terracotta" 
                      : "border-brand-ochre/20 group-hover:border-brand-ochre/40"
                  )}>
                    {currentAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="mt-12 flex justify-between items-center px-4">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 text-brand-charcoal/50 hover:text-brand-charcoal font-bold disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleFinish}
              disabled={currentAnswer === undefined || isSubmitting}
              className="flex items-center gap-3 px-10 py-5 bg-brand-charcoal hover:bg-brand-terracotta text-white font-bold rounded-lg transition-all shadow-lg shadow-brand-charcoal/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyse...
                </>
              ) : (
                <>
                  Découvrir mon archétype
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={currentAnswer === undefined}
              className="flex items-center gap-3 px-10 py-5 bg-brand-charcoal hover:bg-brand-ochre text-white font-bold rounded-lg transition-all shadow-lg shadow-brand-charcoal/10 disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Test;
