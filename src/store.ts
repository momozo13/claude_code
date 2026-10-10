import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Game } from './types';

type State = {
  games: Game[];
  currentId?: string;
  /** 新しい試合を追加して開く */
  addGame: (game: Game) => void;
  /** 現在の試合を関数で更新する（lib/gameOps の関数を渡す） */
  update: (fn: (game: Game) => Game) => void;
  open: (id?: string) => void;
  remove: (id: string) => void;
};

// localStorage に自動保存する
export const useStore = create<State>()(
  persist(
    (set) => ({
      games: [],
      currentId: undefined,
      addGame: (game) => set((s) => ({ games: [game, ...s.games], currentId: game.id })),
      update: (fn) =>
        set((s) => ({ games: s.games.map((g) => (g.id === s.currentId ? fn(g) : g)) })),
      open: (id) => set({ currentId: id }),
      remove: (id) =>
        set((s) => ({
          games: s.games.filter((g) => g.id !== id),
          currentId: s.currentId === id ? undefined : s.currentId,
        })),
    }),
    { name: 'wolf-notes', version: 1 },
  ),
);

export const useCurrentGame = () => useStore((s) => s.games.find((g) => g.id === s.currentId));
