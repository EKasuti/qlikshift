import { DeskSlice, DeskState } from '@/slice/deskSlice';
import { StudentsSlice, StudentsState } from '@/slice/studentsSlice';
import { StateCreator } from 'zustand';

// Combining all slices into one store
export type StoreState = StudentsState & DeskState;

// 2. Create store by combining slices
export const createStore: StateCreator<StoreState> = (...a) => ({
  ...StudentsSlice(...a),
  ...DeskSlice(...a),
});