import { AssignmentSlice, AssignmentState } from '@/slice/assignSlice';
import { DeskSlice, DeskState } from '@/slice/deskSlice';
import { StudentsSlice, StudentsState } from '@/slice/studentsSlice';
import { UserSlice, UserState } from '@/slice/userSlice';
import { StateCreator } from 'zustand';

// Combining all slices into one store
export type StoreState = StudentsState & DeskState & AssignmentState & UserState;

// 2. Create store by combining slices
export const createStore: StateCreator<StoreState> = (...a) => ({
  ...UserSlice(...a),
  ...StudentsSlice(...a),
  ...DeskSlice(...a),
  ...AssignmentSlice(...a),

});