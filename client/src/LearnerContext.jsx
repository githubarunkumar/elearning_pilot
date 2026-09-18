import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import LANGUAGES from './content/index.js';
import { api } from './api.js';

const LearnerContext = createContext(null);
const STORAGE_KEY = 'acg_elearning_learner';

export function LearnerProvider({ children }) {
  const [learner, setLearner] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [langCode, setLangCode] = useState(learner?.language || 'en');

  useEffect(() => {
    if (learner) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(learner));
      } catch {
        /* best-effort only */
      }
    }
  }, [learner]);

  const login = useCallback((learnerObj) => {
    setLearner(learnerObj);
    setLangCode(learnerObj.language || 'en');
  }, []);

  const logout = useCallback(() => {
    setLearner(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const setLanguage = useCallback((code) => {
    setLangCode(code);
    setLearner((prev) => (prev ? { ...prev, language: code } : prev));
  }, []);

  const markProgress = useCallback(
    (screenId, module) => {
      if (!learner) return;
      api.markProgress(learner.id, screenId, module).catch(() => {
        /* progress ping is best-effort; don't block the learner's flow on a network blip */
      });
    },
    [learner]
  );

  const content = LANGUAGES[langCode] || LANGUAGES.en;

  return (
    <LearnerContext.Provider value={{ learner, login, logout, langCode, setLanguage, content, markProgress }}>
      {children}
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const ctx = useContext(LearnerContext);
  if (!ctx) throw new Error('useLearner must be used within LearnerProvider');
  return ctx;
}
