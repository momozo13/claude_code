import { useEffect, useRef } from 'react';
import type { Game, Guess } from '../types';
import { useStore } from '../store';
import { updateDay, updatePlayer } from '../lib/gameOps';

const GUESS_KEYS: Record<string, Guess> = { v: 'village', w: 'wolf', m: 'madman', f: 'fox', u: 'unknown' };

export const SHORTCUTS: [string, string][] = [
  ['↑ ↓ / K J', 'プレイヤーを選ぶ'],
  ['V W M F U', '推理を 村 / 狼 / 狂 / 狐 / ？ にする'],
  ['1〜5 / 0', '怪しさを設定 / 解除'],
  ['C', 'CO欄に入力'],
  ['Enter', 'メモ欄に入力'],
  ['Esc', '入力欄から抜ける'],
  ['[ ]', '前の日 / 次の日'],
  ['Alt + 1〜7', 'タブを切り替え'],
  ['H', 'ショートカット一覧'],
];

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

const focusField = (playerId: string, field: 'co' | 'note') => {
  const el = document.querySelector<HTMLInputElement>(`[data-player-id="${playerId}"] [data-field="${field}"]`);
  el?.focus();
};

/** 試合画面のキーボードショートカット */
export function useShortcuts(opts: {
  game: Game;
  selectedId?: string;
  setSelectedId: (id: string) => void;
  tabCount: number;
  setTabIndex: (i: number) => void;
  toggleHelp: () => void;
}) {
  const update = useStore((s) => s.update);
  // キーを連打しても最新の状態を参照できるよう ref 経由で読む
  const latest = useRef(opts);
  latest.current = opts;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { game, selectedId, setSelectedId, tabCount, setTabIndex, toggleHelp } = latest.current;
      if (e.key === 'Escape' && isEditable(e.target)) {
        (e.target as HTMLElement).blur();
        return;
      }
      if (isEditable(e.target) || e.ctrlKey || e.metaKey || e.isComposing) return;

      // Alt + 数字でタブ切り替え（Option キーで記号になる Mac のため code で判定）
      if (e.altKey) {
        const n = Number(e.code.replace('Digit', ''));
        if (n >= 1 && n <= tabCount) {
          e.preventDefault();
          setTabIndex(n - 1);
        }
        return;
      }

      const key = e.key.toLowerCase();
      const ids = game.players.map((p) => p.id);
      const idx = selectedId ? ids.indexOf(selectedId) : -1;
      const handled = () => e.preventDefault();

      if (key === 'arrowdown' || key === 'j') {
        handled();
        setSelectedId(ids[Math.min(ids.length - 1, idx + 1)]);
      } else if (key === 'arrowup' || key === 'k') {
        handled();
        setSelectedId(ids[Math.max(0, idx - 1)]);
      } else if (key === '[' && game.currentDay > 1) {
        handled();
        const day = game.currentDay - 1;
        update((g) => ({ ...g, currentDay: day }));
      } else if (key === ']') {
        handled();
        const day = game.currentDay + 1;
        update((g) => ({ ...updateDay(g, day, {}), currentDay: day }));
      } else if (key === 'h' || key === '?') {
        handled();
        toggleHelp();
      } else if (selectedId) {
        if (key in GUESS_KEYS) {
          handled();
          update((g) => updatePlayer(g, selectedId, { guess: GUESS_KEYS[key] }));
        } else if (/^[0-5]$/.test(key)) {
          handled();
          update((g) => updatePlayer(g, selectedId, { suspicion: Number(key) }));
        } else if (key === 'c') {
          handled();
          focusField(selectedId, 'co');
        } else if (key === 'enter') {
          handled();
          focusField(selectedId, 'note');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [update]);
}
