export type PlayerStatus = 'alive' | 'executed' | 'attacked' | 'dead';

/** 自分の推理（陣営の見立て） */
export type Guess = 'unknown' | 'village' | 'wolf' | 'madman' | 'fox';

export type Player = {
  id: string;
  name: string;
  status: PlayerStatus;
  /** 死亡した日（処刑・襲撃が起きた日） */
  deadDay?: number;
  /** カミングアウトした役職（自由入力） */
  co: string;
  guess: Guess;
  /** 怪しさ 0=未設定, 1(白い)〜5(黒い) */
  suspicion: number;
  note: string;
  /** 試合終了後に判明した実際の役職と勝敗 */
  actualRole?: string;
  actualResult?: string;
};

export type JudgementKind = 'seer' | 'medium';

export type Judgement = {
  id: string;
  day: number;
  kind: JudgementKind;
  byId: string;
  targetId: string;
  result: 'white' | 'black';
};

export type DayRecord = {
  day: number;
  /** 朝に発見された襲撃死 */
  attackedIds: string[];
  /** 投票者ID → 投票先ID */
  votes: Record<string, string>;
  executedId?: string;
  note: string;
};

export type Game = {
  id: string;
  title: string;
  createdAt: string;
  myId?: string;
  myRole: string;
  /** 配役（闇鍋のときは推定配役メモ） */
  composition: string;
  /** 人狼の数（わかる場合） */
  wolfCount?: number;
  players: Player[];
  days: DayRecord[];
  judgements: Judgement[];
  currentDay: number;
  freeNote: string;
  finished: boolean;
};
