import { useState } from 'react';
import type { Game, JudgementKind } from '../types';
import { useStore } from '../store';
import { newId } from '../lib/gameOps';
import PlayerSelect from './PlayerSelect';

const KIND_LABEL: Record<JudgementKind, string> = { seer: '占い', medium: '霊能' };

export default function JudgementPanel({ game }: { game: Game }) {
  const update = useStore((s) => s.update);
  const [kind, setKind] = useState<JudgementKind>('seer');
  const [byId, setById] = useState<string>();
  const [targetId, setTargetId] = useState<string>();
  const [day, setDay] = useState(game.currentDay);
  const [lastCurrent, setLastCurrent] = useState(game.currentDay);
  if (lastCurrent !== game.currentDay) {
    setLastCurrent(game.currentDay);
    setDay(game.currentDay);
  }

  const nameOf = (id: string) => game.players.find((p) => p.id === id)?.name ?? '?';
  // CO者を先頭に並べる
  const coFirst = [...game.players].sort((a, b) => Number(!a.co) - Number(!b.co));

  const add = (result: 'white' | 'black') => {
    if (!byId || !targetId) return;
    update((g) => ({
      ...g,
      judgements: [...g.judgements, { id: newId(), day, kind, byId, targetId, result }],
    }));
    setTargetId(undefined);
  };

  const remove = (id: string) =>
    update((g) => ({ ...g, judgements: g.judgements.filter((j) => j.id !== id) }));

  const days = [...new Set(game.judgements.map((j) => j.day))].sort((a, b) => a - b);

  return (
    <div className="space-y-3">
      <section className="panel space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <select className="input" value={kind} onChange={(e) => setKind(e.target.value as JudgementKind)}>
            <option value="seer">占い</option>
            <option value="medium">霊能</option>
          </select>
          <select className="input" value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {Array.from({ length: Math.max(game.currentDay, day) }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}日目
              </option>
            ))}
          </select>
          <PlayerSelect players={coFirst} value={byId} onChange={setById} placeholder="誰が" />
          <span>→</span>
          <PlayerSelect players={game.players} value={targetId} onChange={setTargetId} placeholder="誰を" />
        </div>
        <div className="flex gap-1.5">
          <button className="btn" disabled={!byId || !targetId} onClick={() => add('white')}>
            ○ 白（人間）
          </button>
          <button className="btn text-wolf" disabled={!byId || !targetId} onClick={() => add('black')}>
            ● 黒（人狼）
          </button>
        </div>
      </section>

      {(['seer', 'medium'] as const).map((k) => {
        const list = game.judgements.filter((j) => j.kind === k);
        if (list.length === 0) return null;
        const by = [...new Set(list.map((j) => j.byId))];
        return (
          <section key={k} className="panel overflow-x-auto">
            <h3 className="mb-1 text-sm font-semibold">{KIND_LABEL[k]}結果（CO者ごと）</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pr-2">CO者</th>
                  {days.map((d) => (
                    <th key={d} className="px-1">
                      {d}日
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {by.map((b) => (
                  <tr key={b} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="pr-2 font-semibold whitespace-nowrap">{nameOf(b)}</td>
                    {days.map((d) => (
                      <td key={d} className="px-1 align-top">
                        {list
                          .filter((j) => j.byId === b && j.day === d)
                          .map((j) => (
                            <button
                              key={j.id}
                              className={['block whitespace-nowrap hover:line-through', j.result === 'black' ? 'text-wolf font-bold' : ''].join(' ')}
                              title="クリックで削除"
                              onClick={() => confirm('この判定を削除しますか？') && remove(j.id)}
                            >
                              {nameOf(j.targetId)}
                              {j.result === 'black' ? '●' : '○'}
                            </button>
                          ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
      {game.judgements.length === 0 && <p className="text-sm text-slate-500">判定はまだありません</p>}
    </div>
  );
}
