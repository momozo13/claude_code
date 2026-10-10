import { describe, expect, it } from 'vitest';
import { applyLog, applyResults, createGame, getDay, setExecuted } from './gameOps';
import { parseLog, parseResults } from './parseLog';
import { guessAccuracy } from './calc';

const NAMES = ['ももぞー', 'よしの', 'りーこ', 'もも', 'ニッキー', 'ななし'];
const base = () => createGame({ title: 't', names: NAMES, myName: 'ももぞー', myRole: '狩人', composition: '' });
const idOf = (g: ReturnType<typeof base>, name: string) => g.players.find((p) => p.name === name)!.id;

describe('applyLog', () => {
  it('投票・処刑・襲撃を記録し、生死を更新する', () => {
    const g0 = base();
    const log = parseLog(
      'ももぞー\t0票\t→ななし\nななし\t4票\t→ニッキー\nななしは処刑されました。\nりーこは無残な姿で発見されました。',
    );
    const { game, unknownNames } = applyLog(g0, 2, log);
    expect(unknownNames).toEqual([]);
    const day = getDay(game, 2);
    expect(day.votes[idOf(game, 'ももぞー')]).toBe(idOf(game, 'ななし'));
    expect(day.executedId).toBe(idOf(game, 'ななし'));
    expect(game.players.find((p) => p.name === 'ななし')).toMatchObject({ status: 'executed', deadDay: 2 });
    expect(game.players.find((p) => p.name === 'りーこ')).toMatchObject({ status: 'attacked', deadDay: 2 });
  });

  it('知らない名前を報告する', () => {
    const { unknownNames } = applyLog(base(), 1, parseLog('だれか\t1票\t→ももぞー'));
    expect(unknownNames).toEqual(['だれか']);
  });
});

describe('setExecuted', () => {
  it('処刑者を変更すると元の人は生存に戻る', () => {
    let g = base();
    g = setExecuted(g, 1, idOf(g, 'もも'));
    g = setExecuted(g, 1, idOf(g, 'よしの'));
    expect(g.players.find((p) => p.name === 'もも')!.status).toBe('alive');
    expect(g.players.find((p) => p.name === 'よしの')!.status).toBe('executed');
  });
});

describe('applyResults', () => {
  it('実際の役職を反映し、推理の的中数を数える', () => {
    let g = base();
    g = { ...g, players: g.players.map((p) => (p.name === 'ななし' ? { ...p, guess: 'wolf' } : p.name === 'もも' ? { ...p, guess: 'wolf' } : p)) };
    const { game } = applyResults(g, parseResults('ななし\n人狼\n敗北\nもも\n村人\n勝利'));
    expect(game.finished).toBe(true);
    expect(game.players.find((p) => p.name === 'ななし')!.actualRole).toBe('人狼');
    expect(guessAccuracy(game)).toEqual({ hit: 1, total: 2 });
  });
});
