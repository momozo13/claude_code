import { useEffect, useRef, useState } from 'react';
import type { Game, Guess, Player, PlayerStatus } from '../types';
import { useStore } from '../store';
import { GUESS_LABEL, roleToGuess, ROLE_SUGGESTIONS } from '../lib/calc';
import { newPlayer, updatePlayer } from '../lib/gameOps';

const GUESSES: Guess[] = ['village', 'wolf', 'madman', 'fox', 'unknown'];

export const GUESS_STYLE: Record<Guess, string> = {
  unknown: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  village: 'bg-village text-white',
  wolf: 'bg-wolf text-white',
  madman: 'bg-madman text-white',
  fox: 'bg-fox text-white',
};

const ROW_ACCENT: Record<Guess, string> = {
  unknown: 'border-l-slate-300 dark:border-l-slate-700',
  village: 'border-l-village',
  wolf: 'border-l-wolf',
  madman: 'border-l-madman',
  fox: 'border-l-fox',
};

const STATUS_LABEL: Record<PlayerStatus, string> = {
  alive: '生存',
  executed: '処刑',
  attacked: '襲撃',
  dead: '死亡',
};

export default function PlayerBoard({
  game,
  selectedId,
  onSelect,
}: {
  game: Game;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const update = useStore((s) => s.update);
  const [newName, setNewName] = useState('');
  const patch = (id: string, p: Partial<Player>) => update((g) => updatePlayer(g, id, p));

  return (
    <div className="space-y-1.5">
      {game.players.map((p) => (
        <PlayerRow
          key={p.id}
          game={game}
          player={p}
          selected={p.id === selectedId}
          onSelect={() => onSelect(p.id)}
          onChange={(x) => patch(p.id, x)}
        />
      ))}
      <datalist id="co-roles">
        {ROLE_SUGGESTIONS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <form
        className="flex gap-1 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          const name = newName.trim();
          if (!name || game.players.some((p) => p.name === name)) return;
          update((g) => ({ ...g, players: [...g.players, newPlayer(name)] }));
          setNewName('');
        }}
      >
        <input className="input flex-1" placeholder="参加者を追加" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button className="btn">追加</button>
      </form>
    </div>
  );
}

function PlayerRow({
  game,
  player: p,
  selected,
  onSelect,
  onChange,
}: {
  game: Game;
  player: Player;
  selected: boolean;
  onSelect: () => void;
  onChange: (p: Partial<Player>) => void;
}) {
  const isMe = p.id === game.myId;
  const dead = p.status !== 'alive';
  const nameOf = (id: string) => game.players.find((x) => x.id === id)?.name ?? '?';
  // この人が受けた判定
  const received = game.judgements.filter((j) => j.targetId === p.id);
  const actualGuess = p.actualRole ? roleToGuess(p.actualRole) : undefined;
  const lines = game.lines.filter((l) => l.aId === p.id || l.bId === p.id);

  // ショートカットで選んだら画面内に表示する
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return (
    <div
      ref={ref}
      data-player-id={p.id}
      onMouseDown={onSelect}
      onFocus={onSelect}
      className={[
        'rounded-md border border-l-4 border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900',
        ROW_ACCENT[p.guess],
        dead ? 'opacity-55' : '',
        selected ? 'ring-2 ring-indigo-400' : '',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={['min-w-[5.5em] font-semibold', dead ? 'line-through' : ''].join(' ')}>
          {p.name}
          {isMe && <span className="ml-1 rounded bg-indigo-600 px-1 text-[10px] text-white">自分</span>}
        </span>
        <select
          className="input text-xs"
          value={p.status}
          onChange={(e) => {
            const status = e.target.value as PlayerStatus;
            onChange({ status, deadDay: status === 'alive' ? undefined : (p.deadDay ?? game.currentDay) });
          }}
        >
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
              {k !== 'alive' && p.status === k && p.deadDay ? `(${p.deadDay}日)` : ''}
            </option>
          ))}
        </select>
        <input
          className="input w-20 text-xs"
          list="co-roles"
          data-field="co"
          placeholder="CO"
          value={p.co}
          onChange={(e) => onChange({ co: e.target.value })}
        />
        <div className="flex gap-0.5">
          {GUESSES.map((g) => (
            <button
              key={g}
              title={g}
              onClick={() => onChange({ guess: g })}
              className={[
                'h-6 w-6 rounded text-xs font-bold',
                p.guess === g ? GUESS_STYLE[g] : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
              ].join(' ')}
            >
              {GUESS_LABEL[g]}
            </button>
          ))}
        </div>
        <Suspicion value={p.suspicion} onChange={(suspicion) => onChange({ suspicion })} />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {received.map((j) => (
          <span
            key={j.id}
            className={[
              'rounded px-1 text-[11px]',
              j.result === 'black' ? 'bg-wolf/15 text-wolf' : 'bg-slate-100 dark:bg-slate-800',
            ].join(' ')}
          >
            {nameOf(j.byId)}
            {j.kind === 'seer' ? '占' : '霊'}
            {j.result === 'black' ? '●' : '○'}
            {j.day}日
          </span>
        ))}
        {lines.map((l) => {
          const other = l.aId === p.id ? l.bId : l.aId;
          return (
            <span
              key={l.id}
              title={l.note}
              className={['rounded px-1 text-[11px]', l.kind === 'ally' ? 'bg-village/15 text-village' : 'bg-wolf/15 text-wolf'].join(' ')}
            >
              {l.kind === 'ally' ? '―' : '⇔'}
              {nameOf(other)}
            </span>
          );
        })}
        {p.actualRole && (
          <span
            className={[
              'rounded px-1 text-[11px] font-semibold',
              actualGuess ? GUESS_STYLE[actualGuess] : '',
            ].join(' ')}
          >
            {p.actualRole}
            {p.guess !== 'unknown' && !isMe && (actualGuess === p.guess ? ' ✓' : ' ✗')}
          </span>
        )}
        <input
          className="input min-w-0 flex-1 text-xs"
          data-field="note"
          placeholder="メモ"
          value={p.note}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </div>
    </div>
  );
}

/** 怪しさ 1〜5。同じ値をもう一度押すと解除 */
function Suspicion({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" title="怪しさ（右ほど黒い）">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(value === n ? 0 : n)}
          className={[
            'h-3.5 w-3.5 rounded-full border',
            n <= value ? 'border-wolf bg-wolf' : 'border-slate-300 dark:border-slate-600',
          ].join(' ')}
          style={n <= value ? { opacity: 0.35 + n * 0.13 } : undefined}
          aria-label={`怪しさ${n}`}
        />
      ))}
    </div>
  );
}
