import React, { createContext, useContext, useState, useMemo } from 'react';
import { Dimension, QUESTIONS } from '../data/questions';
import { 
  FullTestCalculation, 
  performFullCalculation, 
  computeRawScores 
} from '../services/calculation';

export interface UserData {
  name: string;
  gender: 'M' | 'F' | 'OTHER';
  age: string;
}

interface TestContextType {
  currentQuestionIndex: number;
  answers: Record<string, number>;
  scores: Record<Dimension, number>;
  isFinished: boolean;
  userData: UserData | null;
  setAnswer: (questionId: string, optionIndex: number) => void;
  setUserData: (data: UserData) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetTest: () => void;
  calculateResult: () => string;
  getFullCalculation: () => FullTestCalculation;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const setAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsFinished(false);
  };

  const getFullCalculation = (): FullTestCalculation => {
    return performFullCalculation(answers, userData?.gender);
  };

  const calculateResult = (): string => {
    const calc = getFullCalculation();
    return calc.primaryMatch.archetype.key;
  };

  const scores = useMemo(() => {
    return computeRawScores(answers);
  }, [answers]);

  return (
    <TestContext.Provider value={{
      currentQuestionIndex,
      answers,
      scores,
      isFinished,
      userData,
      setAnswer,
      setUserData,
      nextQuestion,
      prevQuestion,
      resetTest,
      calculateResult,
      getFullCalculation
    }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};
