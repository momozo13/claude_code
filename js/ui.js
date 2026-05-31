// UI rendering and interaction layer

const UI = {
  currentTab: 'dashboard',
  modalContent: null,

  init() {
    this._bindNav();
    this._bindGlobalActions();
    this.render();
  },

  render() {
    this._renderHeader();
    this._renderTab(this.currentTab);
    this._renderNotifications();
  },

  _renderHeader() {
    const s = Game.state;
    const table = Game.getSortedLeagueTable();
    const pos = table.findIndex(t => t.id === 1) + 1;
    const marinosRecord = table.find(t => t.id === 1);

    document.getElementById('season-display').textContent = `${s.season}シーズン`;
    document.getElementById('week-display').textContent = `第${s.week}週`;
    document.getElementById('budget-display').textContent = `${(s.budget / 100).toFixed(1)}億円`;
    document.getElementById('position-display').textContent = `${pos}位`;
    document.getElementById('points-display').textContent = `${marinosRecord?.points || 0}pt`;
    document.getElementById('fame-display').textContent = `名声: ${s.fame}`;
    document.getElementById('support-display').textContent = `支持率: ${s.fanSupport}%`;
  },

  _bindNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this._renderTab(this.currentTab);
      });
    });
  },

  _bindGlobalActions() {
    document.getElementById('btn-advance-week').addEventListener('click', () => {
      const result = Game.advanceWeek();
      Game.saveGame();

      if (result.matchResult) {
        this._showMatchResult(result.matchResult);
      } else {
        this._showWeekSummary(result);
      }

      this.render();
    });

    document.getElementById('btn-save').addEventListener('click', () => {
      Game.saveGame();
      this._toast('ゲームを保存しました', 'success');
    });

    document.getElementById('modal-close').addEventListener('click', () => {
      document.getElementById('modal').classList.add('hidden');
    });
  },

  _renderTab(tab) {
    const content = document.getElementById('main-content');
    switch (tab) {
      case 'dashboard': content.innerHTML = this._renderDashboard(); break;
      case 'squad': content.innerHTML = this._renderSquad(); break;
      case 'tactics': content.innerHTML = this._renderTactics(); break;
      case 'transfer': content.innerHTML = this._renderTransfer(); break;
      case 'finance': content.innerHTML = this._renderFinance(); break;
      case 'stadium': content.innerHTML = this._renderStadium(); break;
      case 'league': content.innerHTML = this._renderLeague(); break;
      case 'history': content.innerHTML = this._renderHistory(); break;
    }
    this._bindTabActions(tab);
  },

  _renderDashboard() {
    const s = Game.state;
    const nextMatch = Game.getNextMatch();
    const opponent = nextMatch ? J_LEAGUE_TEAMS.find(t => t.id === (nextMatch.homeId === 1 ? nextMatch.awayId : nextMatch.homeId)) : null;
    const isHome = nextMatch && nextMatch.homeId === 1;

    const table = Game.getSortedLeagueTable();
    const tableTop5 = table.slice(0, 5);

    const totalWage = s.squad.reduce((sum, p) => sum + p.wage, 0);
    const injured = s.squad.filter(p => p.injury);

    return `
      <div class="dashboard-grid">
        <div class="card next-match">
          <h2>次の試合</h2>
          ${nextMatch ? `
            <div class="match-preview">
              <div class="match-teams">
                <span class="team ${isHome ? 'marinos' : ''}">横浜F・マリノス</span>
                <span class="vs">VS</span>
                <span class="team ${!isHome ? 'opponent' : ''}">${opponent?.name}</span>
              </div>
              <div class="match-info">
                第${nextMatch.matchday}節 | 第${nextMatch.week}週 | ${isHome ? 'ホーム' : 'アウェイ'}
              </div>
              <div class="match-strength">
                チーム力: <strong>${Math.round(Game._calculateTeamStrength(s.squad.filter(p => !p.injury), isHome))}</strong>
                vs 相手: <strong>${opponent?.strength}</strong>
              </div>
            </div>
          ` : `<p class="no-match">シーズン終了 / 次のシーズンへ</p>`}
        </div>

        <div class="card league-summary">
          <h2>リーグ順位 (上位5位)</h2>
          <table class="mini-table">
            <thead><tr><th>#</th><th>チーム</th><th>試</th><th>勝</th><th>分</th><th>敗</th><th>得失</th><th>Pt</th></tr></thead>
            <tbody>
              ${tableTop5.map((t, i) => `
                <tr class="${t.id === 1 ? 'marinos-row' : ''}">
                  <td>${i + 1}</td>
                  <td>${t.shortName}</td>
                  <td>${t.played}</td>
                  <td>${t.won}</td>
                  <td>${t.drawn}</td>
                  <td>${t.lost}</td>
                  <td>${t.gd >= 0 ? '+' : ''}${t.gd}</td>
                  <td><strong>${t.points}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="card finance-summary">
          <h2>財政状況</h2>
          <div class="stat-row"><span>現在の予算</span><strong>${(s.budget / 100).toFixed(1)}億円</strong></div>
          <div class="stat-row"><span>週間収入</span><strong class="positive">+${(s.finances.weeklyRevenue / 100).toFixed(1)}億円</strong></div>
          <div class="stat-row"><span>週間支出（給料）</span><strong class="negative">-${(s.finances.weeklyExpenses / 100).toFixed(1)}億円</strong></div>
          <div class="stat-row"><span>週間収支</span><strong class="${s.finances.weeklyRevenue >= s.finances.weeklyExpenses ? 'positive' : 'negative'}">${((s.finances.weeklyRevenue - s.finances.weeklyExpenses) / 100).toFixed(1)}億円</strong></div>
          <div class="stat-row"><span>シーズン収入合計</span><strong>${(s.finances.seasonRevenue / 100).toFixed(1)}億円</strong></div>
          <div class="stat-row"><span>給料総額/週</span><strong>${(totalWage / 100).toFixed(1)}億円</strong></div>
        </div>

        <div class="card squad-summary">
          <h2>スカッド状況</h2>
          <div class="stat-row"><span>選手数</span><strong>${s.squad.length}名</strong></div>
          <div class="stat-row"><span>怪我人</span><strong class="${injured.length > 0 ? 'negative' : ''}">${injured.length}名</strong></div>
          <div class="stat-row"><span>平均年齢</span><strong>${(s.squad.reduce((a, p) => a + p.age, 0) / s.squad.length).toFixed(1)}歳</strong></div>
          <div class="stat-row"><span>平均総合力</span><strong>${Math.round(s.squad.reduce((a, p) => a + p.overall, 0) / s.squad.length)}</strong></div>
          <div class="stat-row"><span>フォーメーション</span><strong>${s.formation}</strong></div>
          <div class="stat-row"><span>戦術</span><strong>${{attacking:'攻撃的',balanced:'バランス',defensive:'守備的'}[s.tactics]}</strong></div>
        </div>

        ${s.youthAcademy.length > 0 ? `
        <div class="card youth-summary">
          <h2>アカデミー候補 (${s.youthAcademy.length}名)</h2>
          ${s.youthAcademy.map(p => `
            <div class="youth-item">
              <span>${p.name} (${p.position}, ${p.age}歳)</span>
              <span>OVR: ${p.overall} / POT: ${p.potential}</span>
              <button class="btn btn-sm btn-primary" onclick="UI._promoteYouth(${p.id})">昇格</button>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${s.squad.filter(p => p.contractYears <= 1).length > 0 ? `
        <div class="card contract-warning">
          <h2>⚠️ 契約満了間近</h2>
          ${s.squad.filter(p => p.contractYears <= 1).map(p => `
            <div class="contract-item">
              <span>${p.name}（${p.contractYears === 0 ? '満了' : '残1年'}）</span>
              <button class="btn btn-sm btn-warning" onclick="UI._renewContract(${p.id})">更新</button>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `;
  },

  _renderSquad() {
    const s = Game.state;
    const positions = ['GK', 'DF', 'MF', 'FW'];

    return `
      <div class="squad-page">
        <h2>スカッド管理</h2>
        ${positions.map(pos => {
          const players = s.squad.filter(p => p.position === pos).sort((a, b) => b.overall - a.overall);
          return `
            <div class="position-group">
              <h3>${pos}</h3>
              <table class="squad-table">
                <thead>
                  <tr>
                    <th>名前</th><th>年齢</th><th>国籍</th><th>総合</th><th>潜在</th>
                    <th>フォーム</th><th>給料</th><th>契約</th><th>出場</th><th>G</th><th>A</th><th>状態</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${players.map(p => `
                    <tr class="${p.injury ? 'injured' : p.contractYears <= 0 ? 'contract-expired' : ''}">
                      <td><strong>${p.name}</strong>${p.isYouth ? ' <span class="badge youth">ユース</span>' : ''}</td>
                      <td>${p.age}</td>
                      <td>${NATIONALITIES[p.nationality] || p.nationality}</td>
                      <td><span class="overall-badge ovr-${Math.floor(p.overall / 10) * 10}">${p.overall}</span></td>
                      <td><span class="potential">${p.potential}</span></td>
                      <td><span class="form-bar" style="--form:${p.form}">${p.form}</span></td>
                      <td>${(p.wage / 100).toFixed(2)}億/週</td>
                      <td class="${p.contractYears <= 1 ? 'warning' : ''}">${p.contractYears}年</td>
                      <td>${p.appearances}</td>
                      <td>${p.goals}</td>
                      <td>${p.assists}</td>
                      <td>${p.injury ? `<span class="badge danger">怪我(${p.injuryWeeks}W)</span>` : p.suspended ? '<span class="badge warning">出場停止</span>' : '<span class="badge success">良好</span>'}</td>
                      <td>
                        <button class="btn btn-sm btn-danger" onclick="UI._sellPlayer(${p.id})">売却</button>
                        ${p.contractYears <= 1 ? `<button class="btn btn-sm btn-warning" onclick="UI._renewContract(${p.id})">更新</button>` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _renderTactics() {
    const s = Game.state;
    return `
      <div class="tactics-page">
        <h2>戦術設定</h2>
        <div class="tactics-grid">
          <div class="card">
            <h3>フォーメーション</h3>
            <div class="formation-options">
              ${Object.keys(FORMATIONS).map(f => `
                <label class="formation-option ${s.formation === f ? 'selected' : ''}">
                  <input type="radio" name="formation" value="${f}" ${s.formation === f ? 'checked' : ''}>
                  <span>${f}</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="card">
            <h3>戦術スタイル</h3>
            <div class="tactics-options">
              <label class="tactic-option ${s.tactics === 'attacking' ? 'selected' : ''}">
                <input type="radio" name="tactics" value="attacking" ${s.tactics === 'attacking' ? 'checked' : ''}>
                <div class="tactic-info">
                  <strong>攻撃的</strong>
                  <p>高い位置からプレスをかけ、ゴールを狙う。チーム力+3だが守備リスクあり。</p>
                </div>
              </label>
              <label class="tactic-option ${s.tactics === 'balanced' ? 'selected' : ''}">
                <input type="radio" name="tactics" value="balanced" ${s.tactics === 'balanced' ? 'checked' : ''}>
                <div class="tactic-info">
                  <strong>バランス型</strong>
                  <p>攻守のバランスを保った標準的な戦術。</p>
                </div>
              </label>
              <label class="tactic-option ${s.tactics === 'defensive' ? 'selected' : ''}">
                <input type="radio" name="tactics" value="defensive" ${s.tactics === 'defensive' ? 'checked' : ''}>
                <div class="tactic-info">
                  <strong>守備的</strong>
                  <p>堅守からのカウンター。チーム力-2だが失点リスクが低い。</p>
                </div>
              </label>
            </div>
          </div>
          <div class="card formation-visual">
            <h3>ピッチイメージ (${s.formation})</h3>
            ${this._renderFormationVisual()}
          </div>
        </div>
      </div>
    `;
  },

  _renderFormationVisual() {
    const s = Game.state;
    const formation = FORMATIONS[s.formation];
    const byPos = { GK: [], DF: [], MF: [], FW: [] };
    s.squad.filter(p => !p.injury).forEach(p => byPos[p.position].push(p));
    Object.keys(byPos).forEach(pos => byPos[pos].sort((a, b) => b.overall - a.overall));

    const rows = [
      { pos: 'FW', count: formation.FW, players: byPos.FW },
      { pos: 'MF', count: formation.MF, players: byPos.MF },
      { pos: 'DF', count: formation.DF, players: byPos.DF },
      { pos: 'GK', count: formation.GK, players: byPos.GK },
    ];

    return `
      <div class="pitch">
        ${rows.map(row => `
          <div class="pitch-row">
            ${Array.from({ length: row.count }, (_, i) => {
              const p = row.players[i];
              return p ? `<div class="player-token" title="${p.name} (${p.overall})">${p.name.split(' ')[0]}</div>` : `<div class="player-token empty">空</div>`;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `;
  },

  _renderTransfer() {
    const s = Game.state;
    return `
      <div class="transfer-page">
        <h2>移籍市場</h2>
        <p class="budget-info">利用可能予算: <strong>${(s.budget / 100).toFixed(1)}億円</strong></p>
        <h3>市場の選手</h3>
        <table class="transfer-table">
          <thead>
            <tr><th>名前</th><th>ポジション</th><th>年齢</th><th>国籍</th><th>総合</th><th>潜在</th><th>給料/週</th><th>移籍金</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${s.transferMarket.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td><span class="pos-badge ${p.position}">${p.position}</span></td>
                <td>${p.age}</td>
                <td>${NATIONALITIES[p.nationality] || p.nationality}</td>
                <td><span class="overall-badge ovr-${Math.floor(p.overall / 10) * 10}">${p.overall}</span></td>
                <td>${p.potential}</td>
                <td>${(p.wage / 100).toFixed(2)}億</td>
                <td>${(p.price / 100).toFixed(1)}億円</td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="UI._buyPlayer(${p.id})"
                    ${s.budget < p.price ? 'disabled title="予算不足"' : ''}>
                    獲得
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin-top: 2rem">移籍履歴</h3>
        <table class="transfer-table">
          <thead><tr><th>シーズン</th><th>週</th><th>種別</th><th>選手</th><th>金額</th></tr></thead>
          <tbody>
            ${s.transferHistory.slice(0, 20).map(h => `
              <tr>
                <td>${h.season}</td>
                <td>${h.week}</td>
                <td><span class="badge ${h.type === 'buy' ? 'primary' : 'danger'}">${h.type === 'buy' ? '獲得' : '売却'}</span></td>
                <td>${h.player}</td>
                <td class="${h.type === 'buy' ? 'negative' : 'positive'}">${h.type === 'buy' ? '-' : '+'}${(h.amount / 100).toFixed(1)}億円</td>
              </tr>
            `).join('') || '<tr><td colspan="5" class="center">履歴なし</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderFinance() {
    const s = Game.state;
    const totalWage = s.squad.reduce((sum, p) => sum + p.wage, 0);

    return `
      <div class="finance-page">
        <h2>財政管理</h2>
        <div class="finance-grid">
          <div class="card">
            <h3>現在の状況</h3>
            <div class="stat-row"><span>総予算</span><strong>${(s.budget / 100).toFixed(1)}億円</strong></div>
            <div class="stat-row"><span>週間収入</span><strong class="positive">+${(s.finances.weeklyRevenue / 100).toFixed(1)}億円</strong></div>
            <div class="stat-row"><span>給料総額/週</span><strong class="negative">-${(totalWage / 100).toFixed(1)}億円</strong></div>
            <div class="stat-row"><span>週間収支</span><strong class="${s.finances.weeklyRevenue >= totalWage ? 'positive' : 'negative'}">${((s.finances.weeklyRevenue - totalWage) / 100).toFixed(1)}億円</strong></div>
          </div>
          <div class="card">
            <h3>今シーズン累計</h3>
            <div class="stat-row"><span>収入合計</span><strong class="positive">${(s.finances.seasonRevenue / 100).toFixed(1)}億円</strong></div>
            <div class="stat-row"><span>支出合計</span><strong class="negative">${(s.finances.seasonExpenses / 100).toFixed(1)}億円</strong></div>
            <div class="stat-row"><span>純利益</span><strong class="${s.finances.seasonRevenue >= s.finances.seasonExpenses ? 'positive' : 'negative'}">${((s.finances.seasonRevenue - s.finances.seasonExpenses) / 100).toFixed(1)}億円</strong></div>
          </div>
          <div class="card">
            <h3>選手別給料 TOP10</h3>
            ${s.squad.sort((a, b) => b.wage - a.wage).slice(0, 10).map(p => `
              <div class="wage-row">
                <span>${p.name} (${p.position})</span>
                <strong>${(p.wage / 100).toFixed(2)}億/週</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  _renderStadium() {
    const s = Game.state;
    const facilityNames = { training: 'トレーニング施設', academy: 'アカデミー', medical: '医療施設', scout: 'スカウト網' };

    return `
      <div class="stadium-page">
        <h2>スタジアム・施設管理</h2>
        <div class="stadium-grid">
          <div class="card stadium-card">
            <h3>🏟️ 日産スタジアム</h3>
            <div class="stadium-image">⚽</div>
            <div class="stat-row"><span>現在のレベル</span><strong>${STADIUM_UPGRADES[s.stadium.level - 1].name}</strong></div>
            <div class="stat-row"><span>収容人数</span><strong>${s.stadium.capacity.toLocaleString()}席</strong></div>
            ${s.stadium.level < STADIUM_UPGRADES.length ? `
              <div class="upgrade-info">
                <h4>次のアップグレード: ${STADIUM_UPGRADES[s.stadium.level].name}</h4>
                <p>費用: ${STADIUM_UPGRADES[s.stadium.level].cost}億円</p>
                <button class="btn btn-primary" onclick="UI._upgradeStadium()">アップグレード</button>
              </div>
            ` : '<p class="max-level">✅ 最大レベル達成</p>'}
          </div>

          ${Object.entries(facilityNames).map(([type, name]) => {
            const level = s.facilities[type];
            const levelName = FACILITY_LEVELS[type][level];
            const nextCost = level < 3 ? s.facilityCosts[type][level] : null;

            return `
              <div class="card facility-card">
                <h3>${name}</h3>
                <div class="level-display">
                  ${Array.from({ length: 4 }, (_, i) => `<span class="level-pip ${i <= level ? 'active' : ''}"></span>`).join('')}
                </div>
                <div class="stat-row"><span>現在</span><strong>${levelName}</strong></div>
                ${nextCost ? `
                  <div class="stat-row"><span>次のレベル</span><span>${FACILITY_LEVELS[type][level + 1]}</span></div>
                  <div class="stat-row"><span>費用</span><span>${(nextCost / 100).toFixed(1)}億円</span></div>
                  <button class="btn btn-primary btn-sm" onclick="UI._upgradeFacility('${type}')"
                    ${s.budget < nextCost ? 'disabled' : ''}>
                    アップグレード
                  </button>
                ` : '<p class="max-level">✅ 最大レベル</p>'}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  _renderLeague() {
    const table = Game.getSortedLeagueTable();
    const s = Game.state;

    const recentResults = s.league.schedule
      .filter(m => m.played)
      .slice(-5)
      .reverse();

    return `
      <div class="league-page">
        <h2>Jリーグ ${s.season}</h2>
        <div class="league-grid">
          <div class="card">
            <h3>順位表</h3>
            <table class="league-table">
              <thead>
                <tr><th>#</th><th>チーム</th><th>試</th><th>勝</th><th>分</th><th>負</th><th>得</th><th>失</th><th>得失</th><th>Pt</th></tr>
              </thead>
              <tbody>
                ${table.map((t, i) => `
                  <tr class="${t.id === 1 ? 'marinos-row' : ''} ${i < 3 ? 'acl' : ''} ${i >= 15 ? 'relegation' : ''}">
                    <td>${i + 1}</td>
                    <td><strong>${t.name}</strong></td>
                    <td>${t.played}</td>
                    <td>${t.won}</td>
                    <td>${t.drawn}</td>
                    <td>${t.lost}</td>
                    <td>${t.gf}</td>
                    <td>${t.ga}</td>
                    <td>${t.gd >= 0 ? '+' : ''}${t.gd}</td>
                    <td><strong>${t.points}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="legend">
              <span class="legend-acl">■ ACL出場圏</span>
              <span class="legend-rel">■ 降格圏</span>
            </div>
          </div>

          <div class="card">
            <h3>直近の試合結果</h3>
            ${recentResults.length ? recentResults.map(m => {
              const homeTeam = J_LEAGUE_TEAMS.find(t => t.id === m.homeId);
              const awayTeam = J_LEAGUE_TEAMS.find(t => t.id === m.awayId);
              const marinosIsHome = m.homeId === 1;
              const marinosGoals = marinosIsHome ? m.result.homeGoals : m.result.awayGoals;
              const oppGoals = marinosIsHome ? m.result.awayGoals : m.result.homeGoals;
              const result = marinosGoals > oppGoals ? 'win' : marinosGoals < oppGoals ? 'loss' : 'draw';
              return `
                <div class="result-item ${result}">
                  <span class="matchday">第${m.matchday}節</span>
                  <span>${homeTeam?.shortName} ${m.result.homeGoals} - ${m.result.awayGoals} ${awayTeam?.shortName}</span>
                  <span class="result-badge">${result === 'win' ? '勝' : result === 'loss' ? '負' : '分'}</span>
                </div>
              `;
            }).join('') : '<p>まだ試合がありません</p>'}

            <h3 style="margin-top: 1.5rem">次の試合</h3>
            ${s.league.schedule.filter(m => !m.played).slice(0, 5).map(m => {
              const homeTeam = J_LEAGUE_TEAMS.find(t => t.id === m.homeId);
              const awayTeam = J_LEAGUE_TEAMS.find(t => t.id === m.awayId);
              return `
                <div class="upcoming-item">
                  <span class="matchday">第${m.matchday}節 (第${m.week}週)</span>
                  <span>${homeTeam?.name} vs ${awayTeam?.name}</span>
                </div>
              `;
            }).join('') || '<p>残り試合なし</p>'}
          </div>
        </div>
      </div>
    `;
  },

  _renderHistory() {
    const s = Game.state;

    return `
      <div class="history-page">
        <h2>クラブの歴史</h2>
        ${s.history.length === 0 ? '<p>まだシーズンを完走していません。</p>' : `
          <table class="history-table">
            <thead>
              <tr><th>シーズン</th><th>最終順位</th><th>勝点</th><th>得点</th><th>失点</th><th>収入</th><th>賞金</th></tr>
            </thead>
            <tbody>
              ${s.history.map(h => `
                <tr class="${h.position === 1 ? 'champion' : ''}">
                  <td>${h.season}</td>
                  <td>${h.position === 1 ? '🏆 ' : ''}${h.position}位</td>
                  <td>${h.points}pt</td>
                  <td>${h.gf}点</td>
                  <td>${h.ga}点</td>
                  <td>${(h.budget / 100).toFixed(1)}億円</td>
                  <td>${(h.prizeIncome / 100).toFixed(1)}億円</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
        <h3>移籍履歴サマリー</h3>
        <div class="transfer-summary">
          <div class="stat-row"><span>総獲得選手数</span><strong>${s.transferHistory.filter(h => h.type === 'buy').length}名</strong></div>
          <div class="stat-row"><span>総売却選手数</span><strong>${s.transferHistory.filter(h => h.type === 'sell').length}名</strong></div>
          <div class="stat-row"><span>総獲得費用</span><strong class="negative">${(s.transferHistory.filter(h => h.type === 'buy').reduce((a, h) => a + h.amount, 0) / 100).toFixed(1)}億円</strong></div>
          <div class="stat-row"><span>総売却収入</span><strong class="positive">${(s.transferHistory.filter(h => h.type === 'sell').reduce((a, h) => a + h.amount, 0) / 100).toFixed(1)}億円</strong></div>
        </div>
      </div>
    `;
  },

  _bindTabActions(tab) {
    if (tab === 'tactics') {
      document.querySelectorAll('input[name="formation"]').forEach(input => {
        input.addEventListener('change', (e) => {
          Game.state.formation = e.target.value;
          document.querySelectorAll('.formation-option').forEach(el => el.classList.remove('selected'));
          e.target.parentElement.classList.add('selected');
          // Re-render formation visual
          document.querySelector('.formation-visual').innerHTML = `<h3>ピッチイメージ (${Game.state.formation})</h3>` + this._renderFormationVisual();
        });
      });

      document.querySelectorAll('input[name="tactics"]').forEach(input => {
        input.addEventListener('change', (e) => {
          Game.state.tactics = e.target.value;
          document.querySelectorAll('.tactic-option').forEach(el => el.classList.remove('selected'));
          e.target.parentElement.classList.add('selected');
        });
      });
    }
  },

  _buyPlayer(playerId) {
    const result = Game.buyPlayer(playerId);
    this._toast(result.message, result.success ? 'success' : 'danger');
    if (result.success) this._renderTab('transfer');
    this._renderHeader();
  },

  _sellPlayer(playerId) {
    const player = Game.state.squad.find(p => p.id === playerId);
    if (!player) return;
    const price = Math.floor(player.overall * 15 + Math.random() * 50) * 10;
    if (confirm(`${player.name} を約${(price / 100).toFixed(1)}億円で売却しますか？`)) {
      const result = Game.sellPlayer(playerId);
      this._toast(result.message, result.success ? 'success' : 'danger');
      if (result.success) this._renderTab('squad');
      this._renderHeader();
    }
  },

  _renewContract(playerId) {
    const result = Game.renewContract(playerId);
    this._toast(result.message, result.success ? 'success' : 'danger');
    if (result.success) this.render();
  },

  _upgradeStadium() {
    const result = Game.upgradeStadium();
    this._toast(result.message, result.success ? 'success' : 'danger');
    if (result.success) this._renderTab('stadium');
    this._renderHeader();
  },

  _upgradeFacility(type) {
    const result = Game.upgradeFacility(type);
    this._toast(result.message, result.success ? 'success' : 'danger');
    if (result.success) this._renderTab('stadium');
    this._renderHeader();
  },

  _promoteYouth(youthId) {
    Game.promoteYouth(youthId);
    this.render();
  },

  _showMatchResult(matchResult) {
    const { opponent, marinosaGoals, opponentGoals, isHome, attendance, matchRevenue } = matchResult;
    const isWin = marinosaGoals > opponentGoals;
    const isDraw = marinosaGoals === opponentGoals;

    const resultClass = isWin ? 'win' : isDraw ? 'draw' : 'loss';
    const resultText = isWin ? '勝利！' : isDraw ? '引き分け' : '敗北';

    document.getElementById('modal-title').textContent = '試合結果';
    document.getElementById('modal-body').innerHTML = `
      <div class="match-result ${resultClass}">
        <div class="result-header">${resultText}</div>
        <div class="score-display">
          <div class="team-score">
            <span class="team-name">横浜F・マリノス</span>
            <span class="score">${marinosaGoals}</span>
          </div>
          <span class="score-sep">-</span>
          <div class="team-score">
            <span class="score">${opponentGoals}</span>
            <span class="team-name">${opponent.name}</span>
          </div>
        </div>
        <div class="match-details">
          <p>${isHome ? 'ホーム' : 'アウェイ'} 第${matchResult.match.matchday}節</p>
          ${isHome ? `<p>観客数: ${attendance.toLocaleString()}人</p>
          <p>チケット収入: +${(matchRevenue / 100).toFixed(1)}億円</p>` : ''}
        </div>
        <div class="scorers">
          ${Game.state.squad.filter(p => p.goals > 0 || p.assists > 0).slice(0, 5).map(p =>
            `<div>${p.name}: ${p.goals}G ${p.assists}A</div>`
          ).join('')}
        </div>
      </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
  },

  _showWeekSummary(result) {
    document.getElementById('modal-title').textContent = `第${Game.state.week}週 サマリー`;
    document.getElementById('modal-body').innerHTML = `
      <div class="week-summary">
        <div class="stat-row"><span>収入</span><strong class="positive">+${(result.weekRevenue / 100).toFixed(1)}億円</strong></div>
        <div class="stat-row"><span>支出（給料）</span><strong class="negative">-${(result.weekExpense / 100).toFixed(1)}億円</strong></div>
        <div class="stat-row"><span>収支</span><strong class="${result.balance >= 0 ? 'positive' : 'negative'}">${(result.balance / 100).toFixed(1)}億円</strong></div>
        ${Game.state.notifications.slice(0, 3).map(n => `<div class="notification ${n.type}">${n.message}</div>`).join('')}
      </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
  },

  _renderNotifications() {
    const s = Game.state;
    const recent = s.notifications.slice(0, 5);
    const container = document.getElementById('notifications-panel');
    container.innerHTML = recent.map(n =>
      `<div class="notif-item ${n.type}">${n.message}</div>`
    ).join('') || '<div class="notif-item">通知なし</div>';
  },

  _toast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },
};
