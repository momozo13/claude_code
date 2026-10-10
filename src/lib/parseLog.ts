// 月下人狼のゲーム画面からコピーしたテキストを解析する

export type ParsedVote = { voter: string; count: number; target: string };

export type ParsedLog = {
  votes: ParsedVote[];
  executed: string[];
  attacked: string[];
};

export type ParsedResult = { name: string; role: string; result: string };

const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '');

// 例: "ももぞー\t0票\t→ななし"
const VOTE_RE = /^(.+?)\s+(\d+)票\s+→\s*(.+)$/;
// 例: "ななしは処刑されました。"
const EXECUTED_RE = /^(.+?)は処刑されました。?$/;
// 例: "りーこは無残な姿で発見されました。"
const ATTACKED_RE = /^(.+?)は無残な姿で発見されました。?$/;

/** 投票結果・処刑・襲撃のログを取り出す。該当しない行は無視する */
export function parseLog(text: string): ParsedLog {
  const result: ParsedLog = { votes: [], executed: [], attacked: [] };
  for (const line of splitLines(text)) {
    let m = line.match(VOTE_RE);
    if (m) {
      result.votes.push({ voter: m[1].trim(), count: Number(m[2]), target: m[3].trim() });
      continue;
    }
    m = line.match(EXECUTED_RE);
    if (m) {
      result.executed.push(m[1].trim());
      continue;
    }
    m = line.match(ATTACKED_RE);
    if (m) result.attacked.push(m[1].trim());
  }
  return result;
}

/** ゲーム中の参加者一覧（1行1名）を取り出す */
export function parseParticipants(text: string): string[] {
  return [...new Set(splitLines(text))];
}

const RESULT_WORDS = /^(勝利|敗北|引き分け)$/;

/**
 * ゲーム終了後の参加者一覧（名前・役職・勝敗）を取り出す。
 * 「名前 / 役職 / 勝敗」が3行ずつ並ぶ形式と、1行にタブ区切りで並ぶ形式に対応する。
 */
export function parseResults(text: string): ParsedResult[] {
  const lines = splitLines(text);
  const results: ParsedResult[] = [];
  for (let i = 0; i < lines.length; ) {
    const cols = lines[i].split(/\t+/).map((c) => c.trim());
    if (cols.length >= 3 && RESULT_WORDS.test(cols[2])) {
      results.push({ name: cols[0], role: cols[1], result: cols[2] });
      i += 1;
    } else if (i + 2 < lines.length && RESULT_WORDS.test(lines[i + 2])) {
      results.push({ name: lines[i], role: lines[i + 1], result: lines[i + 2] });
      i += 3;
    } else {
      i += 1;
    }
  }
  return results;
}
