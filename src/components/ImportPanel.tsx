import { useState } from 'react';
import type { Game } from '../types';
import { useStore } from '../store';
import { applyLog, applyResults, type ApplyResult } from '../lib/gameOps';
import { parseLog, parseResults } from '../lib/parseLog';

type Message = { ok: boolean; text: string };

export default function ImportPanel({ game }: { game: Game }) {
  const update = useStore((s) => s.update);
  const [text, setText] = useState('');
  const [day, setDay] = useState(game.currentDay);
  const [message, setMessage] = useState<Message>();

  // 日付を進めたら取り込み先も追従させる
  const [lastCurrent, setLastCurrent] = useState(game.currentDay);
  if (lastCurrent !== game.currentDay) {
    setLastCurrent(game.currentDay);
    setDay(game.currentDay);
  }

  const run = () => {
    const log = parseLog(text);
    const results = parseResults(text);
    let r: ApplyResult;
    if (log.votes.length + log.executed.length + log.attacked.length > 0) {
      r = applyLog(game, day, log);
    } else if (results.length > 0) {
      r = applyResults(game, results);
    } else {
      setMessage({ ok: false, text: '読み取れる行がありませんでした' });
      return;
    }
    update(() => r.game);
    setText('');
    setMessage({
      ok: r.unknownNames.length === 0,
      text:
        `${r.applied.join(' / ')} を反映しました` +
        (r.unknownNames.length ? `。参加者にいない名前: ${r.unknownNames.join('、')}` : ''),
    });
  };

  return (
    <section className="panel space-y-2 text-sm">
      <p className="text-slate-600 dark:text-slate-400">
        ゲーム画面の <b>投票結果・処刑・襲撃</b> のログ、または終了後の <b>参加者一覧（役職・勝敗つき）</b>
        をそのまま貼り付けてください。種類は自動で判別します。
      </p>
      <textarea
        className="input h-40 w-full font-mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run();
        }}
        placeholder={'ももぞー\t0票\t→ななし\n…\nななしは処刑されました。'}
      />
      <div className="flex items-center gap-2">
        <span>反映先</span>
        <select className="input" value={day} onChange={(e) => setDay(Number(e.target.value))}>
          {Array.from({ length: game.currentDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}日目
            </option>
          ))}
        </select>
        <button className="btn-primary" disabled={!text.trim()} onClick={run}>
          取り込む
        </button>
        <span className="text-xs text-slate-500">Ctrl+Enter</span>
      </div>
      {message && (
        <p className={message.ok ? 'text-village' : 'text-wolf'} role="status">
          {message.text}
        </p>
      )}
      <p className="text-xs text-slate-500">
        襲撃ログは朝に表示されるので、新しい日に進めてから取り込むとその日の「朝の襲撃」として記録されます。
      </p>
    </section>
  );
}
