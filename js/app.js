/**
 * 沐光童心 · 多端协同系统 - 纯前端静态版
 * 数据存储在浏览器 localStorage，无需后端服务器
 * 部署到 GitHub Pages 即可手机访问
 */

// ============ 角色与常量 ============
const ROLES = {
  CHILD: '儿童',
  PARENT: '家长',
  TEACHER: '教师',
  COMMUNITY: '社区管理员',
};

const RISK_LEVELS = {
  NONE: { label: '无风险', color: '#52c41a' },
  LOW: { label: '低风险', color: '#73d13d' },
  MEDIUM: { label: '中风险', color: '#faad14' },
  HIGH: { label: '高风险', color: '#fa8c16' },
  CRITICAL: { label: '极高风险', color: '#f5222d' },
};

// ============ 本地存储工具 ============
const Store = {
  get(key, def = null) {
    try { const v = localStorage.getItem('mg_' + key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set(key, val) { localStorage.setItem('mg_' + key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem('mg_' + key); },
};

// ============ 用户管理 ============
const UserManager = {
  getCurrent() { return Store.get('currentUser'); },
  login(role, name) {
    const user = { role, name, loginAt: Date.now() };
    Store.set('currentUser', user);
    return user;
  },
  logout() { Store.remove('currentUser'); },
  // 获取关联儿童（家长视角）
  getChildren() {
    const relations = Store.get('relations', []);
    const current = this.getCurrent();
    if (!current) return [];
    return relations.filter(r => r.parentName === current.name).map(r => r.childName);
  },
};

// ============ 测评题库（北滘镇本地化） ============
const AssessmentScales = [
  {
    id: 'law-middle',
    title: '法治认知测评（中年级 · 北滘镇本地化）',
    ageGroup: '中年级（10-12岁）',
    category: 'LAW_AWARENESS',
    questions: [
      {
        id: 'q1', dimension: '网络安全',
        stem: '在北滘镇，如果遇到有人在网上散布你的不实信息，你应该怎么做？',
        options: [
          { text: '默默忍受，不告诉任何人', score: 0 },
          { text: '以牙还牙，在网上反击', score: 1 },
          { text: '告诉家长或老师，必要时报警', score: 3 },
          { text: '删除自己的社交账号', score: 2 },
        ],
      },
      {
        id: 'q2', dimension: '法律知识',
        stem: '《未成年人保护法》规定，任何组织或个人不得招用未满多少周岁的未成年人？',
        options: [
          { text: '14 周岁', score: 0 },
          { text: '16 周岁', score: 3 },
          { text: '18 周岁', score: 1 },
          { text: '不知道', score: 0 },
        ],
      },
      {
        id: 'q3', dimension: '自我保护',
        stem: '如果在北滘镇中心小学遭遇同学欺凌，以下哪种做法最正确？',
        options: [
          { text: '勇敢还手，打回去', score: 1 },
          { text: '告诉班主任或家长，寻求帮助', score: 3 },
          { text: '转学逃避', score: 0 },
          { text: '忍气吞声', score: 0 },
        ],
      },
      {
        id: 'q4', dimension: '法律知识',
        stem: '北滘镇某商店老板卖给你过期食品，你可以依据哪部法律维权？',
        options: [
          { text: '《消费者权益保护法》', score: 3 },
          { text: '《刑法》', score: 1 },
          { text: '《民法典》', score: 2 },
          { text: '不知道', score: 0 },
        ],
      },
      {
        id: 'q5', dimension: '自我保护',
        stem: '当你一个人在家，有陌生人敲门说是爸妈的朋友，你应该？',
        options: [
          { text: '开门让他进来', score: 0 },
          { text: '打电话给爸妈确认', score: 3 },
          { text: '不理他，继续做自己的事', score: 2 },
          { text: '隔着门告诉他爸妈不在，请他离开', score: 3 },
        ],
      },
    ],
  },
  {
    id: 'psy-middle',
    title: '心理状态测评（中年级）',
    ageGroup: '中年级（10-12岁）',
    category: 'PSYCHOLOGY',
    questions: [
      {
        id: 'q1', dimension: '情绪状态',
        stem: '最近一周，你觉得开心吗？',
        options: [
          { text: '每天都很开心', score: 3 },
          { text: '有时候开心', score: 2 },
          { text: '很少开心', score: 1 },
          { text: '一点都不开心', score: 0 },
        ],
      },
      {
        id: 'q2', dimension: '社交关系',
        stem: '你在北滘镇中心小学有好朋友吗？',
        options: [
          { text: '有很多好朋友', score: 3 },
          { text: '有一两个朋友', score: 2 },
          { text: '几乎没有朋友', score: 1 },
          { text: '没有朋友，很孤单', score: 0 },
        ],
      },
      {
        id: 'q3', dimension: '情绪状态',
        stem: '爸妈不在身边时（留守儿童），你会觉得？',
        options: [
          { text: '没关系，能照顾自己', score: 3 },
          { text: '有点想念，但能克服', score: 2 },
          { text: '很难过，经常想哭', score: 1 },
          { text: '非常难过，什么都不想做', score: 0 },
        ],
      },
      {
        id: 'q4', dimension: '心理韧性',
        stem: '遇到困难时，你会怎么做？',
        options: [
          { text: '主动想办法解决', score: 3 },
          { text: '找同学或老师帮忙', score: 3 },
          { text: '告诉爸妈', score: 2 },
          { text: '逃避，不想面对', score: 0 },
        ],
      },
    ],
  },
];

// ============ AI 情景游戏脚本 ============
const GameScenarios = [
  {
    id: 'bullying',
    title: '校园欺凌：勇敢说不',
    theme: '校园欺凌',
    icon: '🛡️',
    color: '#f5222d',
    script: {
      startNode: 'n1',
      nodes: {
        n1: {
          scenario: '在北滘镇中心小学的走廊上，你看到高年级的同学在欺负你的好朋友小明，他们抢走了小明的零食并推搡他。',
          prompt: '你会怎么做？',
          choices: [
            { text: '勇敢上前制止，告诉他们这样做不对', next: 'n2', feedback: '你很勇敢！制止欺凌是正确的做法。', type: 'positive' },
            { text: '假装没看见，快速走开', next: 'n3', feedback: '逃避不能解决问题，小明需要你的帮助。', type: 'warning' },
            { text: '去告诉老师', next: 'n2', feedback: '寻求老师帮助是明智的选择！', type: 'positive' },
          ],
        },
        n2: {
          scenario: '欺凌者离开了，小明很感激你。但第二天，欺凌者威胁你不准告诉别人。',
          prompt: '面对威胁，你会？',
          choices: [
            { text: '不怕威胁，告诉班主任和爸妈', next: 'n4', feedback: '正确！面对威胁要寻求大人帮助。', type: 'positive' },
            { text: '害怕了，以后不再管', next: 'n4', feedback: '害怕是正常的，但沉默会让欺凌继续。', type: 'corrective' },
          ],
        },
        n3: {
          scenario: '第二天，你听说小明被欺负得更厉害了，他现在不敢来上学。',
          prompt: '听到这个消息，你会？',
          choices: [
            { text: '后悔没帮忙，现在去告诉老师', next: 'n4', feedback: '现在行动还不晚！', type: 'positive' },
            { text: '觉得不关自己的事', next: 'n4', feedback: '每个人都有一份责任。', type: 'corrective' },
          ],
        },
        n4: {
          scenario: '老师介入处理后，欺凌者受到了教育并向小明道歉。校园又恢复了和谐。',
          prompt: '🎉 游戏完成！',
          choices: [],
          terminal: true,
        },
      },
    },
  },
  {
    id: 'cyber',
    title: '网络安全：保护隐私',
    theme: '网络安全',
    icon: '🔐',
    color: '#1890ff',
    script: {
      startNode: 'n1',
      nodes: {
        n1: {
          scenario: '你在玩网络游戏时，有个陌生人加你好友，说可以送你稀有游戏装备，但需要你的真实姓名和学校信息。',
          prompt: '你会怎么做？',
          choices: [
            { text: '拒绝提供个人信息', next: 'n2', feedback: '正确！个人信息不能随便告诉陌生人。', type: 'positive' },
            { text: '告诉对方姓名和学校', next: 'n3', feedback: '这很危险！陌生人可能利用你的信息做坏事。', type: 'warning' },
            { text: '告诉爸妈这件事', next: 'n2', feedback: '告诉爸妈是很好的做法。', type: 'positive' },
          ],
        },
        n2: {
          scenario: '你做得很对！后来你发现那个陌生人确实在骗其他小朋友。',
          prompt: '🎉 游戏完成！',
          choices: [],
          terminal: true,
        },
        n3: {
          scenario: '不久后，你开始收到奇怪的骚扰电话，对方知道你的名字和学校。',
          prompt: '现在你会？',
          choices: [
            { text: '立即告诉爸妈并报警', next: 'n2', feedback: '及时求助是正确的！', type: 'positive' },
            { text: '害怕但不敢说', next: 'n2', feedback: '独自承担会很辛苦，告诉大人才能解决问题。', type: 'corrective' },
          ],
        },
      },
    },
  },
  {
    id: 'emotion',
    title: '情绪管理：认识自己',
    theme: '情绪管理',
    icon: '😊',
    color: '#52c41a',
    script: {
      startNode: 'n1',
      nodes: {
        n1: {
          scenario: '今天考试没考好，你感到非常沮丧和难过。',
          prompt: '你会怎么处理这种情绪？',
          choices: [
            { text: '告诉自己没关系，下次努力', next: 'n2', feedback: '积极的心态很棒！', type: 'positive' },
            { text: '找好朋友倾诉', next: 'n2', feedback: '分享情绪是很好的减压方式。', type: 'positive' },
            { text: '一直闷在心里', next: 'n3', feedback: '压抑情绪不利于心理健康。', type: 'warning' },
          ],
        },
        n2: {
          scenario: '你调整好了心态，决定分析错题、下次改进。',
          prompt: '🎉 游戏完成！',
          choices: [],
          terminal: true,
        },
        n3: {
          scenario: '连续几天你都闷闷不乐，影响了学习和生活。',
          prompt: '现在你会？',
          choices: [
            { text: '找老师或心理辅导员聊聊', next: 'n2', feedback: '寻求帮助是明智的。', type: 'positive' },
            { text: '继续独自承受', next: 'n2', feedback: '记得，总有人愿意帮助你。', type: 'corrective' },
          ],
        },
      },
    },
  },
  {
    id: 'protect',
    title: '自我保护：安全第一',
    theme: '自我保护',
    icon: '🦺',
    color: '#fa8c16',
    script: {
      startNode: 'n1',
      nodes: {
        n1: {
          scenario: '放学路上，有个陌生人说认识你爸妈，要接你回家。',
          prompt: '你会怎么做？',
          choices: [
            { text: '不跟他走，回学校找老师', next: 'n2', feedback: '正确！不要跟陌生人走。', type: 'positive' },
            { text: '跟他走', next: 'n3', feedback: '这非常危险！', type: 'warning' },
            { text: '打电话给爸妈确认', next: 'n2', feedback: '确认身份是好习惯。', type: 'positive' },
          ],
        },
        n2: {
          scenario: '你安全回到了学校，老师联系了你的爸妈。',
          prompt: '🎉 游戏完成！',
          choices: [],
          terminal: true,
        },
        n3: {
          scenario: '你跟着陌生人走了，越走越偏僻，你开始害怕。',
          prompt: '现在你会？',
          choices: [
            { text: '找机会跑到人多的地方，大声呼救', next: 'n2', feedback: '对！保护自己最重要。', type: 'positive' },
            { text: '不敢反抗', next: 'n2', feedback: '记住，遇到危险要大声呼救。', type: 'corrective' },
          ],
        },
      },
    },
  },
];

// ============ 北滘镇本地化数据 ============
const BeijiaoData = {
  overview: '北滘镇未成年人风险态势',
  totalMinors: 8500,
  leftBehindCount: 1200,
  riskDistribution: { 无风险: 6800, 低风险: 1100, 中风险: 400, 高风险: 180, 极高风险: 20 },
  keyRisks: [
    '网络安全意识薄弱（网络游戏诈骗、个人信息泄露）',
    '校园欺凌事件偶有发生',
    '留守儿童心理孤独感较强',
    '法治认知水平参差不齐',
  ],
  cases: [
    { title: '北滘镇小学生网络游戏充值案', desc: '某小学生沉迷网络游戏，一周内充值2000元。', lesson: '加强网络消费教育，设置支付密码。' },
    { title: '北滘镇校园欺凌干预案', desc: '某小学五年级发生群体欺凌事件，家校社联合干预成功化解。', lesson: '家校社协同是解决欺凌的有效途径。' },
    { title: '留守儿童心理疏导案', desc: '某留守儿童长期情绪低落，经心理测评发现后定期疏导。', lesson: '定期心理测评有助于及早发现问题。' },
  ],
  resources: ['北滘镇司法所法治教育基地', '北滘派出所未成年人保护热线', '北滘镇家庭教育指导中心'],
};

// ============ 测评逻辑 ============
const AssessmentEngine = {
  // 计算测评结果
  score(scale, answers) {
    let totalScore = 0, maxTotal = 0;
    const dimensionScores = {};
    const dimensionMax = {};

    scale.questions.forEach(q => {
      const ansIdx = answers[q.id];
      if (ansIdx == null) return;
      const score = q.options[ansIdx].score;
      totalScore += score;
      maxTotal += 3;
      dimensionScores[q.dimension] = (dimensionScores[q.dimension] || 0) + score;
      dimensionMax[q.dimension] = (dimensionMax[q.dimension] || 0) + 3;
    });

    const percentage = maxTotal > 0 ? (totalScore / maxTotal) * 100 : 0;
    let riskLevel = 'NONE';
    if (percentage < 40) riskLevel = 'HIGH';
    else if (percentage < 60) riskLevel = 'MEDIUM';
    else if (percentage < 80) riskLevel = 'LOW';

    // 识别薄弱维度
    const weakDimensions = [];
    Object.keys(dimensionScores).forEach(dim => {
      const rate = dimensionScores[dim] / dimensionMax[dim];
      if (rate < 0.6) weakDimensions.push(dim);
    });

    return { totalScore, maxTotal, percentage: Math.round(percentage), riskLevel, dimensionScores, dimensionMax, weakDimensions };
  },

  // 保存测评记录
  saveResult(scaleId, scaleTitle, result) {
    const history = Store.get('assessmentHistory', []);
    history.unshift({
      id: 'a' + Date.now(),
      scaleId, scaleTitle,
      ...result,
      createdAt: new Date().toISOString(),
    });
    Store.set('assessmentHistory', history);

    // 如果高风险，自动生成预警
    if (result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') {
      this.triggerWarning(scaleTitle, result);
    }

    // 发放积分
    PointsManager.add(20, '完成测评：' + scaleTitle);
    return history[0];
  },

  // 触发风险预警
  triggerWarning(scaleTitle, result) {
    const warnings = Store.get('warnings', []);
    warnings.unshift({
      id: 'w' + Date.now(),
      title: '风险预警：' + scaleTitle,
      riskLevel: result.riskLevel,
      manifestations: result.weakDimensions.map(d => d + '维度薄弱'),
      suggestions: ['建议家长加强关注', '建议教师针对性辅导', '可联系北滘镇家庭教育指导中心'],
      createdAt: new Date().toISOString(),
      status: 'unread',
    });
    Store.set('warnings', warnings);
  },

  // 获取历史
  getHistory() { return Store.get('assessmentHistory', []); },
};

// ============ 积分管理 ============
const PointsManager = {
  get() { return Store.get('points', 0); },
  add(amount, desc) {
    const current = this.get();
    Store.set('points', current + amount);
    const ledger = Store.get('pointLedger', []);
    ledger.unshift({ id: 'p' + Date.now(), amount, desc, balance: current + amount, createdAt: new Date().toISOString() });
    Store.set('pointLedger', ledger);
    return current + amount;
  },
  getLedger() { return Store.get('pointLedger', []); },
  getRanking() {
    // 模拟排行榜
    return [
      { name: '小明', points: 320 },
      { name: '小红', points: 280 },
      { name: '小华', points: 250 },
      { name: '小芳', points: 200 },
      { name: '小强', points: 180 },
    ];
  },
};

// ============ 亲子任务 ============
const ParentTaskManager = {
  getAll() { return Store.get('parentTasks', []); },
  create(task) {
    const tasks = this.getAll();
    tasks.unshift({
      id: 't' + Date.now(),
      ...task,
      status: 'published',
      createdAt: new Date().toISOString(),
    });
    Store.set('parentTasks', tasks);
    return tasks[0];
  },
  verify(id) {
    const tasks = this.getAll();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = 'verified';
      task.verifiedAt = new Date().toISOString();
      Store.set('parentTasks', tasks);
      PointsManager.add(task.pointsReward, '亲子任务奖励：' + task.title);
    }
    return task;
  },
};

// ============ 教学建议生成 ============
const TeachingAdviceGenerator = {
  generate(weakDimensions) {
    const adviceMap = {
      '网络安全': { title: '网络安全专项教学', content: '建议开展网络安全主题班会，结合北滘镇网络游戏诈骗案例，教授个人信息保护知识。', activities: ['网络安全知识竞赛', '案例讨论', '家长告知书'] },
      '法律知识': { title: '法治认知强化教学', content: '建议结合《未成年人保护法》《消费者权益保护法》开展法治宣讲，邀请北滘镇司法所工作人员进校园。', activities: ['法治宣讲会', '模拟法庭', '法律知识竞赛'] },
      '自我保护': { title: '自我保护能力培养', content: '建议开展自我保护情景演练，教授应对陌生人、校园欺凌等场景的自护技能。', activities: ['情景演练', '安全知识讲座', '应急演练'] },
      '情绪状态': { title: '心理健康关注', content: '建议加强心理健康教育，对情绪低落学生进行个别谈话，必要时联系北滘镇家庭教育指导中心。', activities: ['心理班会', '个别谈话', '团体辅导'] },
      '社交关系': { title: '社交能力培养', content: '建议开展合作学习与团队活动，帮助学生建立同伴关系。', activities: ['团队游戏', '合作学习', '社交技能训练'] },
      '心理韧性': { title: '抗挫折能力培养', content: '建议开展成长型思维教育，教授面对困难的积极应对策略。', activities: ['成长型思维训练', '挫折教育故事会', '心理韧性训练'] },
    };
    return weakDimensions.map(d => adviceMap[d]).filter(Boolean);
  },
};

// ============ 治理报告生成 ============
const ReportGenerator = {
  generate(period) {
    const history = AssessmentEngine.getHistory();
    const warnings = Store.get('warnings', []);
    const tasks = ParentTaskManager.getAll();

    const totalAssessments = history.length;
    const highRiskCount = history.filter(h => h.riskLevel === 'HIGH' || h.riskLevel === 'CRITICAL').length;
    const verifiedTasks = tasks.filter(t => t.status === 'verified').length;

    return {
      period,
      generatedAt: new Date().toISOString(),
      overview: `本期共完成测评 ${totalAssessments} 次，发现高风险 ${highRiskCount} 例。`,
      riskIntervention: `共触发预警 ${warnings.length} 次，亲子任务完成 ${verifiedTasks} 个。`,
      collabEffectiveness: `家校社协同干预覆盖率 ${totalAssessments > 0 ? Math.round((verifiedTasks / totalAssessments) * 100) : 0}%。`,
      localAnalysis: `北滘镇现有未成年人 ${BeijiaoData.totalMinors} 名，其中留守儿童 ${BeijiaoData.leftBehindCount} 名。主要风险：${BeijiaoData.keyRisks.join('、')}。`,
      issues: BeijiaoData.keyRisks,
      suggestions: ['加强网络安全教育', '关注留守儿童心理健康', '推进家校社协同干预', '定期开展法治宣讲'],
    };
  },
  getAll() { return Store.get('reports', []); },
  save(report) {
    const reports = this.getAll();
    reports.unshift({ id: 'r' + Date.now(), ...report });
    Store.set('reports', reports);
    return reports[0];
  },
};

// ============ 导出 ============
window.MG = {
  ROLES, RISK_LEVELS, Store, UserManager,
  AssessmentScales, GameScenarios, BeijiaoData,
  AssessmentEngine, PointsManager, ParentTaskManager,
  TeachingAdviceGenerator, ReportGenerator,
};
