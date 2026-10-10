import type { Game } from '../types';
import { useStore } from '../store';
import { getDay, updateDay } from '../lib/gameOps';
import PlayerSelect from './PlayerSelect';

export default function VotePanel({ game }: { game: Game }) {
  const update = useStore((s) => s.update);
  const day = game.currentDay;
  const votes = getDay(game, day).votes;
  const nameOf = (id?: string) => (id ? (game.players.find((p) => p.id === id)?.name ?? '?') : '');
  const voteDays = game.days.filter((d) => Object.keys(d.votes).length > 0);

  const setVote = (voter: string, target?: string) =>
    update((g) => {
      const v = { ...getDay(g, day).votes };
      if (target) v[voter] = target;
      else delete v[voter];
      return updateDay(g, day, { votes: v });
    });

  // 得票数
  const counts = new Map<string, number>();
  for (const t of Object.values(votes)) counts.set(t, (counts.get(t) ?? 0) + 1);

  return (
    <div className="space-y-3">
      <section className="panel text-sm">
        <h3 className="mb-1 font-semibold">{day}日目の投票</h3>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1">
          {game.players
            .filter((p) => p.status === 'alive' || votes[p.id])
            .map((p) => (
              <div key={p.id} className="contents">
                <span>{p.name}</span>
                <PlayerSelect
                  players={game.players.filter((x) => x.id !== p.id)}
                  value={votes[p.id]}
                  onChange={(t) => setVote(p.id, t)}
                />
                <span className="text-xs text-slate-500">{counts.get(p.id) ? `${counts.get(p.id)}票` : ''}</span>
              </div>
            ))}
        </div>
      </section>

      {voteDays.length > 0 && (
        <section className="panel overflow-x-auto">
          <h3 className="mb-1 text-sm font-semibold">投票履歴</h3>
          <table className="text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="pr-3">投票者</th>
                {voteDays.map((d) => (
                  <th key={d.day} className="pr-3">
                    {d.day}日
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {game.players.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="pr-3 font-semibold whitespace-nowrap">{p.name}</td>
                  {voteDays.map((d) => {
                    const t = d.votes[p.id];
                    return (
                      <td key={d.day} className={['pr-3 whitespace-nowrap', t && t === d.executedId ? 'text-wolf' : ''].join(' ')}>
                        {nameOf(t)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-slate-500">赤字はその日に処刑された人への投票</p>
        </section>
      )}
    </div>
  );
}
