import { useState } from 'react';
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

const TABS = [
  { key: 'board', label: '盤面' },
  { key: 'import', label: 'ログ取込' },
  { key: 'judge', label: '判定' },
  { key: 'vote', label: '投票' },
  { key: 'days', label: '日別' },
  { key: 'memo', label: 'メモ' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export default function GameView({ game }: { game: Game }) {
  const { update, open } = useStore();
  const [tab, setTab] = useState<TabKey>('board');
  const alive = aliveCount(game);
  const acc = guessAccuracy(game);

  const goDay = (day: number) =>
    update((g) => ({ ...updateDay(g, day, {}), currentDay: day }));

  // 広い画面では盤面を左に常時表示し、右側のタブには盤面を出さない
  const panel = (key: TabKey) => {
    switch (key) {
      case 'board':
        return <PlayerBoard game={game} />;
      case 'import':
        return <ImportPanel game={game} />;
      case 'judge':
        return <JudgementPanel game={game} />;
      case 'vote':
        return <VotePanel game={game} />;
      case 'days':
        return <DayPanel game={game} />;
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
        <div className={tab === 'board' ? '' : 'hidden lg:block'}>
          <PlayerBoard game={game} />
        </div>
        <div className={tab === 'board' ? 'hidden lg:block' : ''}>{panel(sideTab)}</div>
      </main>
    </div>
  );
}
