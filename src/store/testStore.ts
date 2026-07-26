import { create } from 'zustand';
import type {Question, Test} from "../types";

interface TestStore {
  tests: Test[];
  currentTest: Test | null;
  questions: Question[];
  setTests: (tests: Test[]) => void;
  setCurrentTest: (test: Test | null) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (q: Question) => void;
  updateQuestion: (index: number, q: Question) => void;
  removeQuestion: (index: number) => void;
  clearQuestions: () => void;
}

export const useTestStore = create<TestStore>((set) => ({
  tests: [],
  currentTest: null,
  questions: [],
  setTests: (tests) => set({ tests }),
  setCurrentTest: (test) => set({ currentTest: test }),
  setQuestions: (questions) => set({ questions }),
  addQuestion: (q) => set((state) => ({ questions: [...state.questions, q] })),
  updateQuestion: (index, q) =>
    set((state) => {
      const updated = [...state.questions];
      updated[index] = q;
      return { questions: updated };
    }),
  removeQuestion: (index) =>
    set((state) => ({
      questions: state.questions.filter((_, i) => i !== index),
    })),
  clearQuestions: () => set({ questions: [] }),
}));
