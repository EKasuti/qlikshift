import { create } from 'zustand';
import { createStore } from './store';

export const useStore = create(createStore);