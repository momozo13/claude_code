// Initial game data for Yokohama F. Marinos Manager

const POSITIONS = ['GK', 'DF', 'MF', 'FW'];
const NATIONALITIES = {
  JP: '日本', BR: 'ブラジル', KR: '韓国', AR: 'アルゼンチン',
  AU: 'オーストラリア', TH: 'タイ', US: 'アメリカ', PT: 'ポルトガル',
  NG: 'ナイジェリア', GH: 'ガーナ', FR: 'フランス', DE: 'ドイツ'
};

const J_LEAGUE_TEAMS = [
  { id: 1, name: '横浜F・マリノス', shortName: 'YFM', strength: 80, budget: 50 },
  { id: 2, name: 'ヴィッセル神戸', shortName: 'VK', strength: 78, budget: 55 },
  { id: 3, name: '川崎フロンターレ', shortName: 'KF', strength: 77, budget: 48 },
  { id: 4, name: 'サンフレッチェ広島', shortName: 'SH', strength: 75, budget: 40 },
  { id: 5, name: '鹿島アントラーズ', shortName: 'KA', strength: 76, budget: 45 },
  { id: 6, name: '浦和レッズ', shortName: 'UR', strength: 74, budget: 52 },
  { id: 7, name: 'FC東京', shortName: 'FCT', strength: 72, budget: 43 },
  { id: 8, name: 'ガンバ大阪', shortName: 'GO', strength: 73, budget: 44 },
  { id: 9, name: 'セレッソ大阪', shortName: 'CO', strength: 70, budget: 38 },
  { id: 10, name: '名古屋グランパス', shortName: 'NG', strength: 71, budget: 42 },
  { id: 11, name: '東京ヴェルディ', shortName: 'TV', strength: 65, budget: 30 },
  { id: 12, name: '柏レイソル', shortName: 'KR', strength: 68, budget: 35 },
  { id: 13, name: 'アビスパ福岡', shortName: 'AF', strength: 66, budget: 28 },
  { id: 14, name: 'サガン鳥栖', shortName: 'ST', strength: 64, budget: 25 },
  { id: 15, name: '湘南ベルマーレ', shortName: 'SB', strength: 62, budget: 22 },
  { id: 16, name: 'アルビレックス新潟', shortName: 'AN', strength: 63, budget: 24 },
  { id: 17, name: '京都サンガ', shortName: 'KS', strength: 61, budget: 20 },
  { id: 18, name: '町田ゼルビア', shortName: 'MZ', strength: 67, budget: 32 }
];

const INITIAL_SQUAD = [
  // GK
  { id: 1, name: '一森 純', age: 29, position: 'GK', nationality: 'JP', overall: 80, potential: 82, wage: 180, contractYears: 2 },
  { id: 2, name: 'パク・イルギュ', age: 32, position: 'GK', nationality: 'KR', overall: 78, potential: 78, wage: 150, contractYears: 1 },
  { id: 3, name: '白坂 楓馬', age: 22, position: 'GK', nationality: 'JP', overall: 62, potential: 76, wage: 50, contractYears: 2 },
  // DF
  { id: 4, name: '松原 健', age: 31, position: 'DF', nationality: 'JP', overall: 76, potential: 77, wage: 160, contractYears: 1 },
  { id: 5, name: '上島 拓巳', age: 28, position: 'DF', nationality: 'JP', overall: 74, potential: 77, wage: 140, contractYears: 2 },
  { id: 6, name: '渡邊 泰基', age: 25, position: 'DF', nationality: 'JP', overall: 72, potential: 79, wage: 110, contractYears: 2 },
  { id: 7, name: 'エドゥアルド', age: 33, position: 'DF', nationality: 'BR', overall: 77, potential: 77, wage: 200, contractYears: 1 },
  { id: 8, name: '畠中 槙之輔', age: 29, position: 'DF', nationality: 'JP', overall: 75, potential: 76, wage: 150, contractYears: 2 },
  { id: 9, name: '永戸 勝也', age: 29, position: 'DF', nationality: 'JP', overall: 73, potential: 74, wage: 130, contractYears: 2 },
  { id: 10, name: '山根 陸', age: 22, position: 'DF', nationality: 'JP', overall: 68, potential: 82, wage: 70, contractYears: 3 },
  // MF
  { id: 11, name: '喜田 拓也', age: 30, position: 'MF', nationality: 'JP', overall: 78, potential: 79, wage: 170, contractYears: 2 },
  { id: 12, name: '西村 拓真', age: 27, position: 'MF', nationality: 'JP', overall: 76, potential: 80, wage: 150, contractYears: 2 },
  { id: 13, name: '植中 朝日', age: 23, position: 'MF', nationality: 'JP', overall: 72, potential: 83, wage: 90, contractYears: 3 },
  { id: 14, name: 'ナム テヒ', age: 26, position: 'MF', nationality: 'KR', overall: 74, potential: 78, wage: 120, contractYears: 2 },
  { id: 15, name: '渡辺 皓太', age: 27, position: 'MF', nationality: 'JP', overall: 73, potential: 75, wage: 120, contractYears: 2 },
  { id: 16, name: '天野 純', age: 30, position: 'MF', nationality: 'JP', overall: 75, potential: 76, wage: 140, contractYears: 1 },
  { id: 17, name: '井上 健太', age: 24, position: 'MF', nationality: 'JP', overall: 70, potential: 78, wage: 80, contractYears: 3 },
  // FW
  { id: 18, name: 'アンデルソン・ロペス', age: 29, position: 'FW', nationality: 'BR', overall: 84, potential: 85, wage: 350, contractYears: 2 },
  { id: 19, name: 'エウベル', age: 27, position: 'FW', nationality: 'BR', overall: 82, potential: 84, wage: 300, contractYears: 2 },
  { id: 20, name: '宮市 亮', age: 31, position: 'FW', nationality: 'JP', overall: 76, potential: 77, wage: 180, contractYears: 1 },
  { id: 21, name: 'ヤン・マテウス', age: 26, position: 'FW', nationality: 'BR', overall: 79, potential: 82, wage: 250, contractYears: 2 },
  { id: 22, name: '水沼 宏太', age: 33, position: 'FW', nationality: 'JP', overall: 72, potential: 72, wage: 140, contractYears: 1 },
  { id: 23, name: '小池 裕太', age: 27, position: 'FW', nationality: 'JP', overall: 71, potential: 74, wage: 100, contractYears: 2 },
  { id: 24, name: '斉藤 光毅', age: 23, position: 'FW', nationality: 'JP', overall: 73, potential: 83, wage: 100, contractYears: 2 },
  { id: 25, name: '宮坂 政樹', age: 21, position: 'MF', nationality: 'JP', overall: 63, potential: 79, wage: 45, contractYears: 3 },
];

// Transfer market players pool
const TRANSFER_POOL_TEMPLATES = [
  { name: 'マルコス ジュニオール', position: 'MF', nationality: 'BR', minAge: 26, maxAge: 32, minOverall: 74, maxOverall: 82 },
  { name: 'レオ セアラ', position: 'FW', nationality: 'BR', minAge: 25, maxAge: 30, minOverall: 72, maxOverall: 80 },
  { name: '大迫 勇也', position: 'FW', nationality: 'JP', minAge: 30, maxAge: 35, minOverall: 78, maxOverall: 82 },
  { name: '武藤 嘉紀', position: 'FW', nationality: 'JP', minAge: 29, maxAge: 34, minOverall: 74, maxOverall: 78 },
  { name: 'デ・ヘア型GK', position: 'GK', nationality: 'PT', minAge: 24, maxAge: 30, minOverall: 70, maxOverall: 78 },
  { name: '外国籍CB', position: 'DF', nationality: 'AR', minAge: 25, maxAge: 32, minOverall: 70, maxOverall: 80 },
  { name: 'ブラジル人MF', position: 'MF', nationality: 'BR', minAge: 23, maxAge: 29, minOverall: 68, maxOverall: 78 },
  { name: '韓国人FW', position: 'FW', nationality: 'KR', minAge: 22, maxAge: 28, minOverall: 65, maxOverall: 76 },
  { name: '国内若手DF', position: 'DF', nationality: 'JP', minAge: 19, maxAge: 24, minOverall: 58, maxOverall: 70 },
  { name: '国内中堅MF', position: 'MF', nationality: 'JP', minAge: 24, maxAge: 30, minOverall: 65, maxOverall: 75 },
  { name: 'オーストラリア人MF', position: 'MF', nationality: 'AU', minAge: 22, maxAge: 28, minOverall: 64, maxOverall: 74 },
  { name: 'ガーナ人FW', position: 'FW', nationality: 'GH', minAge: 22, maxAge: 27, minOverall: 66, maxOverall: 76 },
];

const FORMATIONS = {
  '4-2-3-1': { GK: 1, DF: 4, MF: 5, FW: 1, display: '4-2-3-1' },
  '4-3-3': { GK: 1, DF: 4, MF: 3, FW: 3, display: '4-3-3' },
  '3-4-3': { GK: 1, DF: 3, MF: 4, FW: 3, display: '3-4-3' },
  '4-4-2': { GK: 1, DF: 4, MF: 4, FW: 2, display: '4-4-2' },
  '3-5-2': { GK: 1, DF: 3, MF: 5, FW: 2, display: '3-5-2' },
  '4-1-4-1': { GK: 1, DF: 4, MF: 5, FW: 1, display: '4-1-4-1' },
};

const FACILITY_LEVELS = {
  training: ['標準', '良好', '優秀', '世界クラス'],
  academy: ['なし', '普通', '良好', '優秀'],
  medical: ['基本', '標準', '高度', '最先端'],
  scout: ['国内のみ', 'アジア圏', '世界', 'エリート'],
};

const STADIUM_UPGRADES = [
  { level: 1, name: '日産スタジアム (現状)', capacity: 72327, cost: 0 },
  { level: 2, name: '日産スタジアム (VIP席増設)', capacity: 72327, cost: 5, vipBonus: 20 },
  { level: 3, name: '日産スタジアム (設備更新)', capacity: 72327, cost: 15, facilityBonus: true },
  { level: 4, name: '日産スタジアム (スマート化)', capacity: 72327, cost: 30, revenueBonus: 30 },
];

const SPONSOR_TIERS = [
  { name: 'ニッサン (メインスポンサー)', weeklyIncome: 200, requirement: 0 },
  { name: '追加スポンサー A', weeklyIncome: 50, requirement: 5 },
  { name: '追加スポンサー B', weeklyIncome: 80, requirement: 10 },
  { name: 'プレミアムスポンサー', weeklyIncome: 150, requirement: 20 },
];

const YOUTH_NAMES = [
  '田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水'
];
const YOUTH_GIVEN = [
  '太郎', '一輝', '拓海', '悠斗', '蓮', '湊', '大翔', '陽向', '朝陽', '颯太',
  '隼人', '竜也', '智也', '健斗', '翔太', '雄大', '勇気', '誠', '亮', '豪'
];
