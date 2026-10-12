import { useState } from 'react';
import { useStore } from '../store';
import { createGame } from '../lib/gameOps';
import { parseParticipants } from '../lib/parseLog';
import { guessAccuracy, ROLE_SUGGESTIONS } from '../lib/calc';
import ComboInput from './ComboInput';

const MY_NAME_KEY = 'wolf-notes:my-name';

const loadMyName = () => {
  try {
    return localStorage.getItem(MY_NAME_KEY) ?? '';
  } catch {
    return '';
  }
};

export default function Home() {
  const { games, addGame, open, remove } = useStore();
  const [namesText, setNamesText] = useState('');
  const [myName, setMyName] = useState(loadMyName);
  const [myRole, setMyRole] = useState('');
  const [composition, setComposition] = useState('');
  const [wolfCount, setWolfCount] = useState('');

  const names = parseParticipants(namesText);

  const start = () => {
    try {
      localStorage.setItem(MY_NAME_KEY, myName);
    } catch {
      // 保存できなくても続行する
    }
    const now = new Date();
    addGame(
      createGame({
        title: `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${names.length}人`,
        names,
        myName,
        myRole,
        composition,
        wolfCount: wolfCount ? Number(wolfCount) : undefined,
      }),
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-3">
      <h1 className="text-lg font-bold">🐺 Wolf Notes</h1>

      <section className="panel space-y-3">
        <h2 className="font-semibold">新しい試合</h2>
        <label className="block text-sm">
          参加者一覧（ゲーム画面からそのまま貼り付け）
          <textarea
            className="input mt-1 h-40 w-full font-mono"
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            placeholder={'ももぞー\nよしの\nりーこ\n…'}
          />
        </label>
        <div className="text-xs text-slate-500">{names.length}人を読み取りました</div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <label>
            自分の名前
            <select className="input mt-1 w-full" value={myName} onChange={(e) => setMyName(e.target.value)}>
              <option value="">（観戦・未選択）</option>
              {names.map((n) => (
                <option key={n}>{n}</option>
              ))}
              {myName && !names.includes(myName) && <option value={myName}>{myName}</option>}
            </select>
          </label>
          <label>
            自分の役職
            <ComboInput className="mt-1 w-full" options={ROLE_SUGGESTIONS} value={myRole} onChange={setMyRole} />
          </label>
          <label>
            配役 / 推定配役（任意）
            <input
              className="input mt-1 w-full"
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              placeholder="例: 狼2 狂2 占霊狩"
            />
          </label>
          <label>
            人狼の数（任意）
            <input
              className="input mt-1 w-full"
              type="number"
              min={0}
              value={wolfCount}
              onChange={(e) => setWolfCount(e.target.value)}
            />
          </label>
        </div>
        <button className="btn-primary" disabled={names.length < 2} onClick={start}>
          試合を開始
        </button>
      </section>

      <section className="panel">
        <h2 className="mb-2 font-semibold">これまでの試合</h2>
        {games.length === 0 && <p className="text-sm text-slate-500">まだありません</p>}
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {games.map((g) => {
            const acc = guessAccuracy(g);
            const me = g.players.find((p) => p.id === g.myId);
            return (
              <li key={g.id} className="flex items-center gap-2 py-1.5 text-sm">
                <button className="flex-1 text-left hover:underline" onClick={() => open(g.id)}>
                  {g.title}
                  <span className="ml-2 text-xs text-slate-500">
                    {g.myRole || '役職未入力'}
                    {me?.actualResult && ` / ${me.actualResult}`}
                    {g.finished ? ` / 推理的中 ${acc.hit}/${acc.total}` : ' / 進行中'}
                  </span>
                </button>
                <button
                  className="btn text-xs"
                  onClick={() => confirm(`「${g.title}」を削除しますか？`) && remove(g.id)}
                >
                  削除
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
