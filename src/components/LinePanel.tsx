import { useState } from 'react';
import type { Game, LineKind } from '../types';
import { useStore } from '../store';
import { getDay, newId } from '../lib/gameOps';
import PlayerSelect from './PlayerSelect';

const KIND_LABEL: Record<LineKind, string> = { ally: '仲間・庇い', oppose: '対立・殴り' };

export default function LinePanel({ game }: { game: Game }) {
  const update = useStore((s) => s.update);
  const [aId, setAId] = useState<string>();
  const [bId, setBId] = useState<string>();
  const [kind, setKind] = useState<LineKind>('ally');
  const [note, setNote] = useState('');
  const [showVotes, setShowVotes] = useState(true);

  const nameOf = (id: string) => game.players.find((p) => p.id === id)?.name ?? '?';

  const add = () => {
    if (!aId || !bId || aId === bId) return;
    update((g) => ({ ...g, lines: [...g.lines, { id: newId(), aId, bId, kind, note: note.trim() }] }));
    setBId(undefined);
    setNote('');
  };
  const remove = (id: string) => update((g) => ({ ...g, lines: g.lines.filter((l) => l.id !== id) }));

  return (
    <div className="space-y-3">
      <section className="panel space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <PlayerSelect players={game.players} value={aId} onChange={setAId} placeholder="誰と" />
          <select className="input" value={kind} onChange={(e) => setKind(e.target.value as LineKind)}>
            <option value="ally">― 仲間・庇い</option>
            <option value="oppose">⇔ 対立・殴り</option>
          </select>
          <PlayerSelect
            players={game.players.filter((p) => p.id !== aId)}
            value={bId}
            onChange={setBId}
            placeholder="誰"
          />
        </div>
        <div className="flex gap-1.5">
          <input
            className="input flex-1"
            placeholder="根拠（例: 2日目に庇った）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button className="btn-primary" disabled={!aId || !bId} onClick={add}>
            追加
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="mb-1 flex items-center justify-between text-sm">
          <h3 className="font-semibold">相関図</h3>
          <label className="flex items-center gap-1 text-xs text-slate-500">
            <input type="checkbox" checked={showVotes} onChange={(e) => setShowVotes(e.target.checked)} />
            {game.currentDay}日目の投票を表示
          </label>
        </div>
        <LineDiagram game={game} showVotes={showVotes} />
        <p className="mt-1 text-xs text-slate-500">
          <span className="text-village">―</span> 仲間・庇い　<span className="text-wolf">- -</span> 対立・殴り
          {showVotes && <>　<span className="text-slate-400">→</span> 投票</>}
        </p>
      </section>

      {game.lines.length > 0 && (
        <section className="panel">
          <ul className="space-y-1 text-sm">
            {game.lines.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <span className={l.kind === 'ally' ? 'text-village' : 'text-wolf'}>
                  {nameOf(l.aId)} {l.kind === 'ally' ? '―' : '⇔'} {nameOf(l.bId)}
                </span>
                <span className="text-xs text-slate-500">{KIND_LABEL[l.kind]}</span>
                <span className="flex-1 truncate text-xs">{l.note}</span>
                <button className="btn text-xs" onClick={() => remove(l.id)}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** 参加者を円形に並べ、ラインと投票を線で描く */
function LineDiagram({ game, showVotes }: { game: Game; showVotes: boolean }) {
  const size = 360;
  const c = size / 2;
  const r = c - 46;
  const n = game.players.length;
  const pos = new Map(
    game.players.map((p, i) => {
      const t = (i / n) * Math.PI * 2 - Math.PI / 2;
      return [p.id, { x: c + r * Math.cos(t), y: c + r * Math.sin(t) }];
    }),
  );
  const votes = showVotes ? Object.entries(getDay(game, game.currentDay).votes) : [];

  // 名前ラベルに重ならないよう、線の両端を少し縮める
  const shorten = (a: { x: number; y: number }, b: { x: number; y: number }, gap: number) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x1: a.x + (dx / len) * gap, y1: a.y + (dy / len) * gap, x2: b.x - (dx / len) * gap, y2: b.y - (dy / len) * gap };
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[420px]" role="img" aria-label="相関図">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-slate-400" />
        </marker>
      </defs>
      {votes.map(([from, to]) => {
        const a = pos.get(from);
        const b = pos.get(to);
        if (!a || !b) return null;
        return <line key={`v${from}`} {...shorten(a, b, 22)} className="stroke-slate-400" strokeWidth={1} markerEnd="url(#arrow)" opacity={0.7} />;
      })}
      {game.lines.map((l) => {
        const a = pos.get(l.aId);
        const b = pos.get(l.bId);
        if (!a || !b) return null;
        return (
          <line
            key={l.id}
            {...shorten(a, b, 18)}
            className={l.kind === 'ally' ? 'stroke-village' : 'stroke-wolf'}
            strokeWidth={2.5}
            strokeDasharray={l.kind === 'oppose' ? '6 4' : undefined}
          >
            {l.note && <title>{l.note}</title>}
          </line>
        );
      })}
      {game.players.map((p) => {
        const { x, y } = pos.get(p.id)!;
        const dead = p.status !== 'alive';
        return (
          <g key={p.id} opacity={dead ? 0.45 : 1}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className={[
                'text-[13px] font-semibold',
                p.guess === 'wolf' ? 'fill-wolf' : p.guess === 'village' ? 'fill-village' : p.guess === 'madman' ? 'fill-madman' : p.guess === 'fox' ? 'fill-fox' : 'fill-current',
              ].join(' ')}
              textDecoration={dead ? 'line-through' : undefined}
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
