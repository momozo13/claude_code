import type { Game } from '../types';
import { useStore } from '../store';
import { setAttacked, setExecuted, updateDay } from '../lib/gameOps';
import PlayerSelect from './PlayerSelect';

export default function DayPanel({ game }: { game: Game }) {
  const update = useStore((s) => s.update);
  const nameOf = (id: string) => game.players.find((p) => p.id === id)?.name ?? '?';
  const days = [...game.days].sort((a, b) => b.day - a.day);

  return (
    <div className="space-y-2">
      {days.map((d) => (
        <section key={d.day} className="panel space-y-1.5 text-sm">
          <h3 className="font-semibold">{d.day}日目</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500">朝の襲撃:</span>
            {d.attackedIds.length === 0 && <span className="text-slate-400">なし（護衛成功など）</span>}
            {d.attackedIds.map((id) => (
              <button
                key={id}
                className="rounded bg-slate-100 px-1.5 hover:line-through dark:bg-slate-800"
                title="クリックで取り消し"
                onClick={() => update((g) => setAttacked(g, d.day, d.attackedIds.filter((x) => x !== id)))}
              >
                {nameOf(id)} ×
              </button>
            ))}
            <PlayerSelect
              className="text-xs"
              players={game.players.filter((p) => !d.attackedIds.includes(p.id))}
              placeholder="＋追加"
              onChange={(id) => id && update((g) => setAttacked(g, d.day, [...d.attackedIds, id]))}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">処刑:</span>
            <PlayerSelect
              players={game.players}
              value={d.executedId}
              placeholder="なし"
              onChange={(id) => update((g) => setExecuted(g, d.day, id))}
            />
          </div>
          <textarea
            className="input h-16 w-full"
            placeholder="この日の出来事・発言メモ"
            value={d.note}
            onChange={(e) => update((g) => updateDay(g, d.day, { note: e.target.value }))}
          />
        </section>
      ))}
    </div>
  );
}
