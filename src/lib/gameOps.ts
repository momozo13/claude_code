// ゲームデータを更新する純粋関数。ストアから呼び出す。
import type { DayRecord, Game, Player } from '../types';
import type { ParsedLog, ParsedResult } from './parseLog';

export const newId = () => Math.random().toString(36).slice(2, 10);

export const emptyDay = (day: number): DayRecord => ({ day, attackedIds: [], votes: {}, note: '' });

export const newPlayer = (name: string): Player => ({
  id: newId(),
  name,
  status: 'alive',
  co: '',
  guess: 'unknown',
  suspicion: 0,
  note: '',
});

export function createGame(input: {
  title: string;
  names: string[];
  myName?: string;
  myRole: string;
  composition: string;
  wolfCount?: number;
}): Game {
  const players = input.names.map(newPlayer);
  return {
    id: newId(),
    title: input.title,
    createdAt: new Date().toISOString(),
    myId: players.find((p) => p.name === input.myName)?.id,
    myRole: input.myRole,
    composition: input.composition,
    wolfCount: input.wolfCount,
    players,
    days: [emptyDay(1)],
    judgements: [],
    lines: [],
    currentDay: 1,
    freeNote: '',
    finished: false,
  };
}

export const getDay = (game: Game, day: number): DayRecord =>
  game.days.find((d) => d.day === day) ?? emptyDay(day);

export function updateDay(game: Game, day: number, patch: Partial<DayRecord>): Game {
  const exists = game.days.some((d) => d.day === day);
  const days = exists
    ? game.days.map((d) => (d.day === day ? { ...d, ...patch } : d))
    : [...game.days, { ...emptyDay(day), ...patch }].sort((a, b) => a.day - b.day);
  return { ...game, days };
}

export function updatePlayer(game: Game, id: string, patch: Partial<Player>): Game {
  return { ...game, players: game.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

/** その日の処刑者を設定し、生死も合わせて更新する */
export function setExecuted(game: Game, day: number, playerId?: string): Game {
  const prev = getDay(game, day).executedId;
  let g = game;
  if (prev && prev !== playerId) g = revive(g, prev, day, 'executed');
  if (playerId) g = updatePlayer(g, playerId, { status: 'executed', deadDay: day });
  return updateDay(g, day, { executedId: playerId });
}

/** その日の朝の襲撃死を設定し、生死も合わせて更新する */
export function setAttacked(game: Game, day: number, playerIds: string[]): Game {
  let g = game;
  for (const prev of getDay(game, day).attackedIds) {
    if (!playerIds.includes(prev)) g = revive(g, prev, day, 'attacked');
  }
  for (const id of playerIds) g = updatePlayer(g, id, { status: 'attacked', deadDay: day });
  return updateDay(g, day, { attackedIds: playerIds });
}

// 記録を取り消したとき、その記録で死亡扱いにした人だけ生存に戻す
function revive(game: Game, id: string, day: number, status: Player['status']): Game {
  const p = game.players.find((x) => x.id === id);
  if (!p || p.status !== status || p.deadDay !== day) return game;
  return updatePlayer(game, id, { status: 'alive', deadDay: undefined });
}

export type ApplyResult = { game: Game; applied: string[]; unknownNames: string[] };

/** 貼り付けたログを指定した日の記録に反映する */
export function applyLog(game: Game, day: number, log: ParsedLog): ApplyResult {
  const byName = new Map(game.players.map((p) => [p.name, p.id]));
  const unknown = new Set<string>();
  const idOf = (name: string) => {
    const id = byName.get(name);
    if (!id) unknown.add(name);
    return id;
  };
  const applied: string[] = [];
  let g = game;

  if (log.votes.length > 0) {
    const votes = { ...getDay(g, day).votes };
    let n = 0;
    for (const v of log.votes) {
      const voter = idOf(v.voter);
      const target = idOf(v.target);
      if (voter && target) {
        votes[voter] = target;
        n++;
      }
    }
    g = updateDay(g, day, { votes });
    applied.push(`投票 ${n}件`);
  }
  const executed = log.executed.map(idOf).filter((x): x is string => !!x);
  if (executed.length > 0) {
    g = setExecuted(g, day, executed[executed.length - 1]);
    applied.push(`処刑: ${log.executed.join('、')}`);
  }
  const attacked = log.attacked.map(idOf).filter((x): x is string => !!x);
  if (attacked.length > 0) {
    const merged = [...new Set([...getDay(g, day).attackedIds, ...attacked])];
    g = setAttacked(g, day, merged);
    applied.push(`襲撃: ${log.attacked.join('、')}`);
  }
  return { game: g, applied, unknownNames: [...unknown] };
}

/** 終了後の参加者一覧（実際の役職）を反映し、試合を終了扱いにする */
export function applyResults(game: Game, results: ParsedResult[]): ApplyResult {
  const unknown: string[] = [];
  let g = game;
  for (const r of results) {
    const p = g.players.find((x) => x.name === r.name);
    if (!p) {
      unknown.push(r.name);
      continue;
    }
    g = updatePlayer(g, p.id, { actualRole: r.role, actualResult: r.result });
  }
  return {
    game: { ...g, finished: true },
    applied: [`役職 ${results.length - unknown.length}名分`],
    unknownNames: unknown,
  };
}
