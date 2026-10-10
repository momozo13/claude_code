import { describe, expect, it } from 'vitest';
import { parseLog, parseParticipants, parseResults } from './parseLog';
import { ropeCount, roleToGuess } from './calc';

describe('parseLog', () => {
  it('投票結果・処刑・襲撃を読み取る', () => {
    const text = [
      '投票結果',
      'ももぞー\t0票\t→ななし',
      'ニッキー\t1票\t→ななし',
      'ななし\t4票\t→ニッキー',
      '',
      'ななしは処刑されました。',
      'りーこは無残な姿で発見されました。',
    ].join('\n');
    const log = parseLog(text);
    expect(log.votes).toEqual([
      { voter: 'ももぞー', count: 0, target: 'ななし' },
      { voter: 'ニッキー', count: 1, target: 'ななし' },
      { voter: 'ななし', count: 4, target: 'ニッキー' },
    ]);
    expect(log.executed).toEqual(['ななし']);
    expect(log.attacked).toEqual(['りーこ']);
  });

  it('スペース区切りの投票行も読み取る', () => {
    expect(parseLog('yogi 2票 → とっと').votes).toEqual([{ voter: 'yogi', count: 2, target: 'とっと' }]);
  });
});

describe('parseParticipants', () => {
  it('空行と重複を除く', () => {
    expect(parseParticipants('ももぞー\n\nよしの\nももぞー\n')).toEqual(['ももぞー', 'よしの']);
  });
});

describe('parseResults', () => {
  it('3行ずつの形式を読み取る', () => {
    const text = 'ももぞー\n狩人\n勝利\nめかぶ\n人狼\n敗北\n';
    expect(parseResults(text)).toEqual([
      { name: 'ももぞー', role: '狩人', result: '勝利' },
      { name: 'めかぶ', role: '人狼', result: '敗北' },
    ]);
  });

  it('タブ区切りの形式を読み取る', () => {
    expect(parseResults('yogi\t狂人\t敗北')).toEqual([{ name: 'yogi', role: '狂人', result: '敗北' }]);
  });
});

describe('calc', () => {
  it('吊り回数', () => {
    expect(ropeCount(12)).toBe(5);
    expect(ropeCount(11)).toBe(5);
    expect(ropeCount(3)).toBe(1);
    expect(ropeCount(2)).toBe(0);
  });

  it('役職名から陣営を推定する', () => {
    expect(roleToGuess('人狼')).toBe('wolf');
    expect(roleToGuess('狂人')).toBe('madman');
    expect(roleToGuess('妖狐')).toBe('fox');
    expect(roleToGuess('狼少年')).toBe('village');
    expect(roleToGuess('占い師')).toBe('village');
  });
});
