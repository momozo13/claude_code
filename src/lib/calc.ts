import type { Game, Guess } from '../types';

export const aliveCount = (game: Game) => game.players.filter((p) => p.status === 'alive').length;

/** 残りの吊り回数（生存者が2人以下になるまでに処刑できる回数） */
export const ropeCount = (alive: number) => Math.max(0, Math.floor((alive - 1) / 2));

/** 実際の役職名から陣営を推定する（月下人狼は役職が多いので名前で大まかに判定） */
export function roleToGuess(role: string): Guess {
  if (role.includes('狂')) return 'madman';
  if (role.includes('狐') || role.includes('背徳')) return 'fox';
  if (role.includes('人狼') || /狼$/.test(role)) return role === '狼少年' ? 'village' : 'wolf';
  return 'village';
}

/** 試合後、推理（不明以外）の的中数を数える */
export function guessAccuracy(game: Game) {
  const judged = game.players.filter((p) => p.actualRole && p.guess !== 'unknown' && p.id !== game.myId);
  const hit = judged.filter((p) => roleToGuess(p.actualRole!) === p.guess).length;
  return { hit, total: judged.length };
}

export const GUESS_LABEL: Record<Guess, string> = {
  unknown: '？',
  village: '村',
  wolf: '狼',
  madman: '狂',
  fox: '狐',
};

export const ROLE_SUGGESTIONS = [
  '村人',
  '占い師',
  '霊能者',
  '狩人',
  '共有者',
  '人狼',
  '狂人',
  '妖狐',
  '背徳者',
  '猫又',
];
