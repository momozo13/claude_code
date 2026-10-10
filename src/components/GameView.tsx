import { useCallback, useState } from 'react';
import type { Game } from '../types';
import { useStore } from '../store';
import { aliveCount, guessAccuracy, ropeCount } from '../lib/calc';
import { updateDay } from '../lib/gameOps';
import PlayerBoard from './PlayerBoard';
import JudgementPanel from './JudgementPanel';
import VotePanel from './VotePanel';
import DayPanel from './DayPanel';
import ImportPanel from './ImportPanel';
import MemoPanel from './MemoPanel';
import LinePanel from './LinePanel';
import { SHORTCUTS, useShortcuts } from './useShortcuts';

const TABS = [
  { key: 'board', label: '盤面' },
  { key: 'import', label: 'ログ取込' },
  { key: 'judge', label: '判定' },
  { key: 'vote', label: '投票' },
  { key: 'line', label: 'ライン' },
  { key: 'days', label: '日別' },
  { key: 'memo', label: 'メモ' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export default function GameView({ game }: { game: Game }) {
  const { update, open } = useStore();
  const [tab, setTab] = useState<TabKey>('board');
  const [selectedId, setSelectedId] = useState<string>();
  const [help, setHelp] = useState(false);
  useShortcuts({
    game,
    selectedId,
    setSelectedId,
    tabCount: TABS.length,
    setTabIndex: useCallback((i: number) => setTab(TABS[i].key), []),
    toggleHelp: useCallback(() => setHelp((h) => !h), []),
  });
  const alive = aliveCount(game);
  const acc = guessAccuracy(game);

  const goDay = (day: number) =>
    update((g) => ({ ...updateDay(g, day, {}), currentDay: day }));

  const board = <PlayerBoard game={game} selectedId={selectedId} onSelect={setSelectedId} />;

  // 広い画面では盤面を左に常時表示し、右側のタブには盤面を出さない
  const panel = (key: TabKey) => {
    switch (key) {
      case 'board':
        return board;
      case 'import':
        return <ImportPanel game={game} />;
      case 'judge':
        return <JudgementPanel game={game} />;
      case 'vote':
        return <VotePanel game={game} />;
      case 'days':
        return <DayPanel game={game} />;
      case 'line':
        return <LinePanel game={game} />;
      case 'memo':
        return <MemoPanel game={game} />;
    }
  };
  const sideTab = tab === 'board' ? 'import' : tab;

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 bg-slate-50/95 px-3 py-2 text-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <button className="btn" onClick={() => open(undefined)} title="試合一覧へ">
          ← 一覧
        </button>
        <div className="flex items-center gap-1">
          <button className="btn" disabled={game.currentDay <= 1} onClick={() => goDay(game.currentDay - 1)}>
            ◀
          </button>
          <span className="w-12 text-center font-bold">{game.currentDay}日目</span>
          <button className="btn" onClick={() => goDay(game.currentDay + 1)}>
            ▶
          </button>
        </div>
        <span>
          生存 <b>{alive}</b> / 吊り残り <b>{ropeCount(alive)}</b>
          {game.wolfCount != null && <> / 狼 {game.wolfCount}</>}
        </span>
        {game.myRole && <span className="text-slate-500">自分: {game.myRole}</span>}
        {game.finished && (
          <span className="rounded bg-indigo-100 px-1.5 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
            終了・推理的中 {acc.hit}/{acc.total}
          </span>
        )}
        <button className="btn ml-auto text-xs" onClick={() => setHelp((h) => !h)} title="ショートカット一覧 (H)">
          ⌨ H
        </button>
      </header>

      <nav className="flex gap-1 overflow-x-auto px-3 pt-2 text-sm">
        {TABS.map((t) => {
          const active = tab === t.key || (t.key === sideTab && tab === 'board');
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                'shrink-0 rounded-t border-b-2 px-2.5 py-1',
                t.key === 'board' ? 'lg:hidden' : '',
                tab === t.key
                  ? 'border-indigo-500 font-semibold'
                  : active
                    ? 'border-transparent lg:border-indigo-500 lg:font-semibold'
                    : 'border-transparent text-slate-500',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <main className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className={tab === 'board' ? '' : 'hidden lg:block'}>{board}</div>
        <div className={tab === 'board' ? 'hidden lg:block' : ''}>{panel(sideTab)}</div>
      </main>

      {help && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={() => setHelp(false)}>
          <div className="panel w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 font-semibold">キーボードショートカット</h2>
            <table className="w-full text-sm">
              <tbody>
                {SHORTCUTS.map(([k, d]) => (
                  <tr key={k}>
                    <td className="py-0.5 pr-3 font-mono whitespace-nowrap">{k}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">入力欄にいるときは Esc で抜けてから使います。</p>
          </div>
        </div>
      )}
    </div>
  );
}
