// Core game state and logic

const Game = {
  state: null,

  init() {
    this.state = {
      season: 2025,
      week: 1,
      phase: 'preseason', // preseason, regular, offseason
      matchweek: 0,
      budget: 30_00, // 万円単位 (3000万円 = 3億円)
      fame: 50, // クラブ名声度 0-100
      fanSupport: 70, // サポーター支持率 0-100

      squad: JSON.parse(JSON.stringify(INITIAL_SQUAD)).map(p => ({
        ...p,
        form: 70 + Math.floor(Math.random() * 20),
        injury: false,
        injuryWeeks: 0,
        goals: 0,
        assists: 0,
        appearances: 0,
        yellowCards: 0,
        redCards: 0,
      })),
      nextPlayerId: 100,

      formation: '4-2-3-1',
      tactics: 'balanced', // attacking, balanced, defensive

      stadium: {
        level: 1,
        capacity: 72327,
        vipBonus: 0,
        revenueBonus: 0,
      },
      facilities: {
        training: 1,   // 0-3
        academy: 0,    // 0-3
        medical: 1,    // 0-3
        scout: 0,      // 0-3
      },
      facilityCosts: {
        training: [0, 8_00, 20_00, 50_00],
        academy: [5_00, 12_00, 30_00, 0],
        medical: [0, 6_00, 15_00, 40_00],
        scout: [4_00, 10_00, 25_00, 0],
      },

      league: {
        table: this._initLeagueTable(),
        schedule: [],
        results: [],
        currentMatchday: 0,
      },

      transferMarket: [],
      transferHistory: [],

      finances: {
        weeklyRevenue: 0,
        weeklyExpenses: 0,
        seasonRevenue: 0,
        seasonExpenses: 0,
        history: [],
      },

      history: [],
      notifications: [],
      youthAcademy: [],
    };

    this._generateSchedule();
    this._refreshTransferMarket();
    this._calculateWeeklyFinances();

    return this.state;
  },

  _initLeagueTable() {
    return J_LEAGUE_TEAMS.map(team => ({
      ...team,
      played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, points: 0,
    }));
  },

  _generateSchedule() {
    const teams = J_LEAGUE_TEAMS.map(t => t.id);
    const marinosId = 1;
    const opponents = teams.filter(id => id !== marinosId);
    const schedule = [];

    // Shuffle opponents for variety
    const shuffled = [...opponents].sort(() => Math.random() - 0.5);

    shuffled.forEach((oppId, i) => {
      const matchday = i + 1;
      const isHome = i % 2 === 0;
      schedule.push({
        matchday,
        week: 2 + i * 2, // starts week 2, every 2 weeks
        homeId: isHome ? marinosId : oppId,
        awayId: isHome ? oppId : marinosId,
        played: false,
        result: null,
      });
    });

    // Return legs
    shuffled.forEach((oppId, i) => {
      const matchday = i + 18;
      const isHome = i % 2 === 1; // flip home/away
      schedule.push({
        matchday,
        week: 2 + (i + 17) * 2,
        homeId: isHome ? marinosId : oppId,
        awayId: isHome ? oppId : marinosId,
        played: false,
        result: null,
      });
    });

    this.state.league.schedule = schedule;
  },

  _refreshTransferMarket() {
    const market = [];
    const count = 8 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      const template = TRANSFER_POOL_TEMPLATES[Math.floor(Math.random() * TRANSFER_POOL_TEMPLATES.length)];
      const age = template.minAge + Math.floor(Math.random() * (template.maxAge - template.minAge + 1));
      const overall = template.minOverall + Math.floor(Math.random() * (template.maxOverall - template.minOverall + 1));
      const potential = Math.min(99, overall + Math.floor(Math.random() * 10));
      const wage = Math.floor((overall - 50) * 15 + Math.random() * 50);
      const price = Math.floor(wage * 20 + Math.random() * 100) * 10;

      market.push({
        id: 500 + i + Math.floor(Math.random() * 100),
        name: template.name + (i + 1),
        age,
        position: template.position,
        nationality: template.nationality,
        overall,
        potential,
        wage,
        price,
        contractYears: 1 + Math.floor(Math.random() * 3),
        form: 60 + Math.floor(Math.random() * 30),
        injury: false,
        injuryWeeks: 0,
        goals: 0, assists: 0, appearances: 0,
        yellowCards: 0, redCards: 0,
      });
    }

    this.state.transferMarket = market;
  },

  _calculateWeeklyFinances() {
    const s = this.state;
    const totalWage = s.squad.reduce((sum, p) => sum + p.wage, 0);

    // Revenue
    const avgAttendance = Math.floor(s.stadium.capacity * (0.5 + s.fanSupport / 200));
    const ticketRevenue = Math.floor(avgAttendance * 0.3); // 0.3万円/人 平均
    const sponsorRevenue = 200 + (s.fame > 70 ? 100 : 0) + (s.fame > 85 ? 150 : 0);
    const stadiumBonus = s.stadium.revenueBonus || 0;

    s.finances.weeklyRevenue = ticketRevenue + sponsorRevenue + stadiumBonus;
    s.finances.weeklyExpenses = totalWage;
  },

  advanceWeek() {
    const s = this.state;
    s.week++;

    // Check for match this week
    const match = s.league.schedule.find(m => m.week === s.week && !m.played);
    let matchResult = null;
    if (match) {
      matchResult = this._simulateMatch(match);
    }

    // Process injuries
    this._processInjuries();

    // Process youth academy
    if (s.facilities.academy > 0) {
      this._processYouthAcademy();
    }

    // Financial update
    const weekRevenue = s.finances.weeklyRevenue;
    const weekExpense = s.finances.weeklyExpenses;
    s.budget += weekRevenue - weekExpense;
    s.finances.seasonRevenue += weekRevenue;
    s.finances.seasonExpenses += weekExpense;

    // Player development (weekly small growth for young players)
    this._weeklyPlayerDevelopment();

    // Check if season end
    if (s.week > 70) {
      this._endSeason();
    }

    // Transfer window refresh
    if (s.week % 8 === 0) {
      this._refreshTransferMarket();
    }

    this._calculateWeeklyFinances();

    return {
      matchResult,
      weekRevenue,
      weekExpense,
      balance: weekRevenue - weekExpense,
    };
  },

  _simulateMatch(match) {
    const s = this.state;
    const marinosId = 1;
    const isHome = match.homeId === marinosId;
    const oppId = isHome ? match.awayId : match.homeId;
    const opponent = J_LEAGUE_TEAMS.find(t => t.id === oppId);

    // Calculate team strength
    const availablePlayers = s.squad.filter(p => !p.injury && !p.suspended);
    const marinosaStrength = this._calculateTeamStrength(availablePlayers, isHome);
    const opponentStrength = opponent.strength + (isHome ? -3 : 3) + (Math.random() * 10 - 5);

    // Simulate match
    const homeStrength = isHome ? marinosaStrength : opponentStrength;
    const awayStrength = isHome ? opponentStrength : marinosaStrength;

    const homeGoals = this._simulateGoals(homeStrength, awayStrength);
    const awayGoals = this._simulateGoals(awayStrength, homeStrength);

    const marinosaGoals = isHome ? homeGoals : awayGoals;
    const opponentGoals = isHome ? awayGoals : homeGoals;

    // Update players stats
    this._updatePlayerMatchStats(availablePlayers, marinosaGoals, marinosaGoals > opponentGoals);

    // Update league table
    this._updateLeagueTable(match, homeGoals, awayGoals);

    match.played = true;
    match.result = { homeGoals, awayGoals };
    s.league.currentMatchday = match.matchday;

    // Fan support update
    if (marinosaGoals > opponentGoals) {
      s.fanSupport = Math.min(100, s.fanSupport + 2);
    } else if (marinosaGoals < opponentGoals) {
      s.fanSupport = Math.max(20, s.fanSupport - 3);
    }

    // Ticket revenue for this match
    const attendance = Math.floor(s.stadium.capacity * (0.5 + s.fanSupport / 200));
    const matchRevenue = isHome ? Math.floor(attendance * 0.35) : 0;
    s.budget += matchRevenue;
    s.finances.seasonRevenue += matchRevenue;

    return {
      match,
      opponent,
      marinosaGoals,
      opponentGoals,
      isHome,
      attendance: isHome ? attendance : 0,
      matchRevenue,
    };
  },

  _calculateTeamStrength(players, isHome) {
    const s = this.state;
    if (players.length === 0) return 50;

    const formation = FORMATIONS[s.formation];
    const positionWeights = { GK: 1.2, DF: 1.1, MF: 1.0, FW: 1.1 };

    let totalStrength = 0;
    let count = 0;

    // Pick best 11 by position
    const byPosition = { GK: [], DF: [], MF: [], FW: [] };
    players.forEach(p => byPosition[p.position].push(p));
    Object.keys(byPosition).forEach(pos => byPosition[pos].sort((a, b) => b.overall - a.overall));

    const gks = byPosition.GK.slice(0, 1);
    const dfs = byPosition.DF.slice(0, formation.DF);
    const mfs = byPosition.MF.slice(0, formation.MF);
    const fws = byPosition.FW.slice(0, formation.FW);

    [...gks, ...dfs, ...mfs, ...fws].forEach(p => {
      const formBonus = (p.form - 70) / 100;
      const str = p.overall * (1 + formBonus) * positionWeights[p.position];
      totalStrength += str;
      count++;
    });

    let strength = count > 0 ? totalStrength / count : 60;

    // Tactics bonus
    if (s.tactics === 'attacking') strength += 3;
    if (s.tactics === 'defensive') strength -= 2;

    // Home bonus
    if (isHome) strength += 4;

    // Facility bonus
    strength += s.facilities.training * 1.5;

    return Math.max(40, Math.min(95, strength));
  },

  _simulateGoals(attackStrength, defenseStrength) {
    const diff = attackStrength - defenseStrength;
    const baseGoals = 1.2 + diff * 0.04;
    const goals = Math.max(0, Math.round(baseGoals + (Math.random() * 3 - 1.2)));
    return goals;
  },

  _updatePlayerMatchStats(players, goals, isWin) {
    // Randomly assign goals and assists
    const scorers = players.filter(p => p.position === 'FW' || p.position === 'MF');
    const sorted = scorers.sort(() => Math.random() - 0.5);

    let remaining = goals;
    sorted.forEach((p, i) => {
      if (remaining > 0 && Math.random() > 0.5) {
        p.goals++;
        remaining--;
        if (i + 1 < sorted.length) sorted[i + 1].assists++;
      }
    });

    players.forEach(p => {
      p.appearances++;
      p.form = Math.max(40, Math.min(99, p.form + (isWin ? 3 : -2) + Math.floor(Math.random() * 6 - 3)));

      // Yellow card chance
      if (Math.random() < 0.08) p.yellowCards++;
      // Red card (rare)
      if (Math.random() < 0.01) { p.redCards++; p.suspended = true; }
    });
  },

  _updateLeagueTable(match, homeGoals, awayGoals) {
    const table = this.state.league.table;
    const home = table.find(t => t.id === match.homeId);
    const away = table.find(t => t.id === match.awayId);

    if (!home || !away) return;

    home.played++; away.played++;
    home.gf += homeGoals; home.ga += awayGoals;
    away.gf += awayGoals; away.ga += homeGoals;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;

    if (homeGoals > awayGoals) {
      home.won++; home.points += 3;
      away.lost++;
    } else if (homeGoals === awayGoals) {
      home.drawn++; home.points++;
      away.drawn++; away.points++;
    } else {
      away.won++; away.points += 3;
      home.lost++;
    }

    // Simulate other matches
    this._simulateOtherMatches(match.matchday);
  },

  _simulateOtherMatches(matchday) {
    const table = this.state.league.table;
    const marinosId = 1;

    J_LEAGUE_TEAMS.forEach(home => {
      if (home.id === marinosId) return;
      J_LEAGUE_TEAMS.forEach(away => {
        if (away.id === marinosId || away.id === home.id) return;
        if (Math.random() > 0.15) return; // only simulate ~15% of combos

        const homeT = table.find(t => t.id === home.id);
        const awayT = table.find(t => t.id === away.id);
        const hg = this._simulateGoals(home.strength + 3, away.strength);
        const ag = this._simulateGoals(away.strength, home.strength + 3);

        homeT.played++; awayT.played++;
        homeT.gf += hg; homeT.ga += ag;
        awayT.gf += ag; awayT.ga += hg;
        homeT.gd = homeT.gf - homeT.ga;
        awayT.gd = awayT.gf - awayT.ga;

        if (hg > ag) { homeT.won++; homeT.points += 3; awayT.lost++; }
        else if (hg === ag) { homeT.drawn++; homeT.points++; awayT.drawn++; awayT.points++; }
        else { awayT.won++; awayT.points += 3; homeT.lost++; }
      });
    });
  },

  _processInjuries() {
    const s = this.state;
    s.squad.forEach(p => {
      if (p.injury) {
        p.injuryWeeks--;
        if (p.injuryWeeks <= 0) {
          p.injury = false;
          p.injuryWeeks = 0;
          this._addNotification(`${p.name} が怪我から回復しました！`, 'success');
        }
      } else {
        const injuryChance = 0.02 - s.facilities.medical * 0.003;
        if (Math.random() < injuryChance) {
          p.injury = true;
          p.injuryWeeks = 1 + Math.floor(Math.random() * 6);
          this._addNotification(`${p.name} が怪我をしました（${p.injuryWeeks}週間離脱）`, 'danger');
        }
      }

      // Clear suspension
      if (p.suspended && Math.random() > 0.5) p.suspended = false;
    });
  },

  _weeklyPlayerDevelopment() {
    const s = this.state;
    s.squad.forEach(p => {
      if (p.age <= 23) {
        // Young players grow slightly
        const growthChance = 0.05 + s.facilities.training * 0.02;
        if (Math.random() < growthChance && p.overall < p.potential) {
          p.overall = Math.min(p.potential, p.overall + 1);
        }
      } else if (p.age >= 32) {
        // Old players may decline
        if (Math.random() < 0.02) {
          p.overall = Math.max(50, p.overall - 1);
        }
      }
    });
  },

  _processYouthAcademy() {
    const s = this.state;
    const academyLevel = s.facilities.academy;

    // Chance to produce youth player
    if (s.week % 4 === 0 && Math.random() < academyLevel * 0.15) {
      const surname = YOUTH_NAMES[Math.floor(Math.random() * YOUTH_NAMES.length)];
      const given = YOUTH_GIVEN[Math.floor(Math.random() * YOUTH_GIVEN.length)];
      const positions = ['GK', 'DF', 'MF', 'FW'];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      const potentialBase = 65 + academyLevel * 5;
      const potential = potentialBase + Math.floor(Math.random() * 15);

      const youth = {
        id: s.nextPlayerId++,
        name: `${surname} ${given}`,
        age: 18,
        position: pos,
        nationality: 'JP',
        overall: 55 + Math.floor(Math.random() * 10),
        potential,
        wage: 20 + Math.floor(Math.random() * 20),
        contractYears: 3,
        form: 65,
        injury: false,
        injuryWeeks: 0,
        goals: 0, assists: 0, appearances: 0,
        yellowCards: 0, redCards: 0,
        isYouth: true,
      };

      s.youthAcademy.push(youth);
      this._addNotification(`アカデミーから${youth.name}（${pos}）が昇格候補に！ポテンシャル: ${potential}`, 'info');
    }
  },

  promoteYouth(youthId) {
    const s = this.state;
    const idx = s.youthAcademy.findIndex(p => p.id === youthId);
    if (idx === -1) return false;

    const player = s.youthAcademy.splice(idx, 1)[0];
    s.squad.push(player);
    this._addNotification(`${player.name} をトップチームに昇格させました！`, 'success');
    return true;
  },

  _endSeason() {
    const s = this.state;
    const table = [...s.league.table].sort((a, b) =>
      b.points - a.points || b.gd - a.gd || b.gf - a.gf
    );
    const marinosaPos = table.findIndex(t => t.id === 1) + 1;

    // Prize money
    const prizeMap = { 1: 300_00, 2: 200_00, 3: 150_00, 4: 100_00, 5: 80_00 };
    const prize = prizeMap[marinosaPos] || 30_00;
    s.budget += prize;

    // Fame update
    if (marinosaPos === 1) s.fame = Math.min(100, s.fame + 10);
    else if (marinosaPos <= 3) s.fame = Math.min(100, s.fame + 5);
    else if (marinosaPos >= 15) s.fame = Math.max(30, s.fame - 5);

    // Record history
    const marinosaRecord = table.find(t => t.id === 1);
    s.history.push({
      season: s.season,
      position: marinosaPos,
      points: marinosaRecord.points,
      gf: marinosaRecord.gf,
      ga: marinosaRecord.ga,
      budget: s.budget,
      prizeIncome: prize,
    });

    // Age all players +1, handle retirements
    this._agePlayersNewSeason();

    // Reset for new season
    s.season++;
    s.week = 1;
    s.phase = 'preseason';
    s.matchweek = 0;
    s.league.table = this._initLeagueTable();
    s.league.currentMatchday = 0;
    s.finances.seasonRevenue = 0;
    s.finances.seasonExpenses = 0;

    this._generateSchedule();
    this._refreshTransferMarket();
    this._calculateWeeklyFinances();

    this._addNotification(
      `${s.season - 1}シーズン終了！最終順位: ${marinosaPos}位 / 賞金: ${(prize / 100).toFixed(1)}億円獲得`,
      marinosaPos <= 3 ? 'success' : 'info'
    );

    return { position: marinosaPos, prize };
  },

  _agePlayersNewSeason() {
    const s = this.state;
    const retired = [];

    s.squad = s.squad.filter(p => {
      p.age++;
      p.contractYears--;

      // Retirement: chance increases after 33, mostly retire after 37
      const retireChance = p.age >= 37 ? 0.8 : p.age >= 35 ? 0.4 : p.age >= 33 ? 0.1 : 0;
      if (Math.random() < retireChance) {
        retired.push(p);
        return false;
      }

      // Decline for older players
      if (p.age >= 30) {
        const decline = Math.floor((p.age - 29) * 0.5);
        if (Math.random() < 0.4) p.overall = Math.max(55, p.overall - decline);
      }

      // Form reset
      p.form = 65 + Math.floor(Math.random() * 20);
      p.goals = 0; p.assists = 0; p.appearances = 0;
      p.yellowCards = 0; p.redCards = 0;
      p.injury = false; p.suspended = false;

      return true;
    });

    retired.forEach(p => {
      this._addNotification(`${p.name}（${p.age}歳）が現役を引退しました。`, 'info');
    });

    // Contract expiry
    s.squad.forEach(p => {
      if (p.contractYears <= 0) {
        this._addNotification(`${p.name} の契約が満了します。更新が必要です。`, 'warning');
      }
    });
  },

  buyPlayer(playerId) {
    const s = this.state;
    const playerIdx = s.transferMarket.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return { success: false, message: '選手が見つかりません' };

    const player = s.transferMarket[playerIdx];
    if (s.budget < player.price) {
      return { success: false, message: `予算不足です（必要: ${(player.price / 100).toFixed(1)}億円）` };
    }

    s.budget -= player.price;
    s.squad.push({ ...player });
    s.transferMarket.splice(playerIdx, 1);
    s.transferHistory.push({
      type: 'buy',
      player: player.name,
      amount: player.price,
      season: s.season,
      week: s.week,
    });

    this._calculateWeeklyFinances();
    return { success: true, message: `${player.name} を獲得しました！` };
  },

  sellPlayer(playerId) {
    const s = this.state;
    const playerIdx = s.squad.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return { success: false, message: '選手が見つかりません' };

    const player = s.squad[playerIdx];
    const sellPrice = Math.floor(player.overall * 15 + Math.random() * 50) * 10;

    s.squad.splice(playerIdx, 1);
    s.budget += sellPrice;
    s.transferHistory.push({
      type: 'sell',
      player: player.name,
      amount: sellPrice,
      season: s.season,
      week: s.week,
    });

    this._calculateWeeklyFinances();
    return { success: true, message: `${player.name} を ${(sellPrice / 100).toFixed(1)}億円で売却しました` };
  },

  renewContract(playerId) {
    const s = this.state;
    const player = s.squad.find(p => p.id === playerId);
    if (!player) return { success: false, message: '選手が見つかりません' };

    const renewCost = player.wage * 10; // signing bonus
    if (s.budget < renewCost) {
      return { success: false, message: '予算が不足しています' };
    }

    s.budget -= renewCost;
    player.contractYears = 2;
    player.wage = Math.floor(player.wage * 1.05); // 5% raise
    return { success: true, message: `${player.name} と契約更新しました` };
  },

  upgradeStadium() {
    const s = this.state;
    const currentLevel = s.stadium.level;
    const nextUpgrade = STADIUM_UPGRADES[currentLevel];
    if (!nextUpgrade) return { success: false, message: '最大レベルです' };

    if (s.budget < nextUpgrade.cost * 100) {
      return { success: false, message: `予算不足（必要: ${nextUpgrade.cost}億円）` };
    }

    s.budget -= nextUpgrade.cost * 100;
    s.stadium.level = nextUpgrade.level;
    s.stadium.capacity = nextUpgrade.capacity;
    if (nextUpgrade.vipBonus) s.stadium.vipBonus = nextUpgrade.vipBonus;
    if (nextUpgrade.revenueBonus) s.stadium.revenueBonus = nextUpgrade.revenueBonus;
    if (nextUpgrade.facilityBonus) s.facilities.training = Math.min(3, s.facilities.training + 1);

    this._calculateWeeklyFinances();
    return { success: true, message: `${nextUpgrade.name} にアップグレードしました！` };
  },

  upgradeFacility(type) {
    const s = this.state;
    const current = s.facilities[type];
    if (current >= 3) return { success: false, message: '最大レベルです' };

    const cost = s.facilityCosts[type][current];
    if (!cost || s.budget < cost) {
      return { success: false, message: `予算不足（必要: ${(cost / 100).toFixed(1)}億円）` };
    }

    s.budget -= cost;
    s.facilities[type]++;
    this._calculateWeeklyFinances();

    const names = { training: 'トレーニング施設', academy: 'アカデミー', medical: '医療施設', scout: 'スカウト網' };
    return { success: true, message: `${names[type]} をレベル${s.facilities[type]}にアップグレードしました！` };
  },

  getSortedLeagueTable() {
    return [...this.state.league.table].sort((a, b) =>
      b.points - a.points || b.gd - a.gd || b.gf - a.gf
    );
  },

  getNextMatch() {
    const s = this.state;
    return s.league.schedule.find(m => !m.played);
  },

  _addNotification(message, type = 'info') {
    this.state.notifications.unshift({
      id: Date.now() + Math.random(),
      message,
      type,
      week: this.state.week,
      season: this.state.season,
    });
    if (this.state.notifications.length > 50) {
      this.state.notifications.pop();
    }
  },

  saveGame() {
    localStorage.setItem('marinosaManager_save', JSON.stringify(this.state));
  },

  loadGame() {
    const saved = localStorage.getItem('marinosaManager_save');
    if (saved) {
      this.state = JSON.parse(saved);
      return true;
    }
    return false;
  },
};
