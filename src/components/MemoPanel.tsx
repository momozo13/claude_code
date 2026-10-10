import type { Game } from '../types';
import { useStore } from '../store';
import { ROLE_SUGGESTIONS } from '../lib/calc';

export default function MemoPanel({ game }: { game: Game }) {
  const update = useStore((s) => s.update);
  const set = (patch: Partial<Game>) => update((g) => ({ ...g, ...patch }));

  return (
    <section className="panel space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <label>
          試合名
          <input className="input mt-1 w-full" value={game.title} onChange={(e) => set({ title: e.target.value })} />
        </label>
        <label>
          自分の役職
          <input className="input mt-1 w-full" list="memo-roles" value={game.myRole} onChange={(e) => set({ myRole: e.target.value })} />
        </label>
        <label>
          配役 / 推定配役
          <input className="input mt-1 w-full" value={game.composition} onChange={(e) => set({ composition: e.target.value })} />
        </label>
        <label>
          人狼の数
          <input
            className="input mt-1 w-full"
            type="number"
            min={0}
            value={game.wolfCount ?? ''}
            onChange={(e) => set({ wolfCount: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
        </label>
      </div>
      <datalist id="memo-roles">
        {ROLE_SUGGESTIONS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <label className="block">
        自由メモ（内訳の仮定・ライン・考察など）
        <textarea
          className="input mt-1 h-64 w-full"
          value={game.freeNote}
          onChange={(e) => set({ freeNote: e.target.value })}
          placeholder={'例）\n占い真がかんべいなら → 狼候補: めかぶ、ななし\nニッキーとななしはライン？'}
        />
      </label>
    </section>
  );
}
