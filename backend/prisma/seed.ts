/**
 * 沐光童心 · 数据库种子数据
 * 包含：测试用户、北滘镇本地化内容、测评量表、游戏场景
 */
import { PrismaClient, Role, AgeGroup, RiskLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据库...');

  // ============ 1. 创建测试用户 ============
  console.log('📋 创建测试用户...');
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '13800000001' },
    update: {},
    create: {
      phone: '13800000001',
      passwordHash,
      role: Role.SYSTEM_ADMIN,
      name: '系统管理员',
      jurisdiction: 'beijiao',
    },
  });

  const communityAdmin = await prisma.user.upsert({
    where: { phone: '13800000002' },
    update: {},
    create: {
      phone: '13800000002',
      passwordHash,
      role: Role.COMMUNITY_ADMIN,
      name: '北滘镇社区管理员',
      jurisdiction: 'beijiao',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { phone: '13800000003' },
    update: {},
    create: {
      phone: '13800000003',
      passwordHash,
      role: Role.TEACHER,
      name: '王老师',
      jurisdiction: 'beijiao',
    },
  });

  const parent = await prisma.user.upsert({
    where: { phone: '13800000004' },
    update: {},
    create: {
      phone: '13800000004',
      passwordHash,
      role: Role.PARENT,
      name: '张家长',
      jurisdiction: 'beijiao',
    },
  });

  const child = await prisma.user.upsert({
    where: { phone: '13800000005' },
    update: {},
    create: {
      phone: '13800000005',
      passwordHash,
      role: Role.CHILD,
      name: '小明',
      ageGroup: AgeGroup.MIDDLE,
      isLeftBehind: true,
      jurisdiction: 'beijiao',
    },
  });

  // 关系绑定
  await prisma.userRelation.upsert({
    where: {
      fromUserId_toUserId_relationType: {
        fromUserId: parent.id,
        toUserId: child.id,
        relationType: 'PARENT_OF',
      },
    },
    update: {},
    create: {
      fromUserId: parent.id,
      toUserId: child.id,
      relationType: 'PARENT_OF',
    },
  });

  // 班级
  const cls = await prisma.class.upsert({
    where: { id: 'class-beijiao-5-1' },
    update: {},
    create: {
      id: 'class-beijiao-5-1',
      name: '五年级1班',
      schoolName: '北滘镇中心小学',
      grade: 5,
      teacherId: teacher.id,
      jurisdiction: 'beijiao',
    },
  });

  await prisma.enrollment.upsert({
    where: {
      classId_studentId: { classId: cls.id, studentId: child.id },
    },
    update: {},
    create: {
      classId: cls.id,
      studentId: child.id,
    },
  });

  console.log('✅ 测试用户创建完成');
  console.log('   - 系统管理员: 13800000001 / 123456');
  console.log('   - 社区管理员: 13800000002 / 123456');
  console.log('   - 教师: 13800000003 / 123456');
  console.log('   - 家长: 13800000004 / 123456');
  console.log('   - 儿童: 13800000005 / 123456');

  // ============ 2. 测评量表 ============
  console.log('📋 创建测评量表...');

  // 法治认知量表 - 中年级
  await prisma.assessmentScale.upsert({
    where: { id: 'scale-law-middle' },
    update: {},
    create: {
      id: 'scale-law-middle',
      title: '法治认知测评（中年级 · 北滘镇本地化）',
      ageGroup: AgeGroup.MIDDLE,
      category: 'LAW_AWARENESS',
      questions: [
        {
          id: 'q1',
          stem: '在北滘镇，如果遇到有人在网上散布你的不实信息，你应该怎么做？',
          options: [
            { id: 'a', text: '默默忍受，不告诉任何人', score: 0 },
            { id: 'b', text: '以牙还牙，在网上反击', score: 1 },
            { id: 'c', text: '告诉家长或老师，必要时报警', score: 3 },
            { id: 'd', text: '删除自己的社交账号', score: 2 },
          ],
          dimension: 'CYBERSECURITY',
          maxScore: 3,
        },
        {
          id: 'q2',
          stem: '《未成年人保护法》规定，任何组织或个人不得招用未满多少周岁的未成年人？',
          options: [
            { id: 'a', text: '14 周岁', score: 0 },
            { id: 'b', text: '16 周岁', score: 3 },
            { id: 'c', text: '18 周岁', score: 1 },
            { id: 'd', text: '不知道', score: 0 },
          ],
          dimension: 'LAW_KNOWLEDGE',
          maxScore: 3,
        },
        {
          id: 'q3',
          stem: '如果在北滘镇中心小学遭遇同学欺凌，以下哪种做法最正确？',
          options: [
            { id: 'a', text: '勇敢还手，打回去', score: 1 },
            { id: 'b', text: '告诉班主任或家长，寻求帮助', score: 3 },
            { id: 'c', text: '转学逃避', score: 0 },
            { id: 'd', text: '忍气吞声', score: 0 },
          ],
          dimension: 'SELF_PROTECTION',
          maxScore: 3,
        },
        {
          id: 'q4',
          stem: '北滘镇某商店老板卖给你过期食品，你可以依据哪部法律维权？',
          options: [
            { id: 'a', text: '《消费者权益保护法》', score: 3 },
            { id: 'b', text: '《刑法》', score: 1 },
            { id: 'c', text: '《民法典》', score: 2 },
            { id: 'd', text: '不知道', score: 0 },
          ],
          dimension: 'LAW_KNOWLEDGE',
          maxScore: 3,
        },
        {
          id: 'q5',
          stem: '当你一个人在家，有陌生人敲门说是爸妈的朋友，你应该？',
          options: [
            { id: 'a', text: '开门让他进来', score: 0 },
            { id: 'b', text: '打电话给爸妈确认', score: 3 },
            { id: 'c', text: '不理他，继续做自己的事', score: 2 },
            { id: 'd', text: '隔着门告诉他爸妈不在，请他离开', score: 3 },
          ],
          dimension: 'SELF_PROTECTION',
          maxScore: 3,
        },
      ],
    },
  });

  // 心理状态量表 - 中年级
  await prisma.assessmentScale.upsert({
    where: { id: 'scale-psy-middle' },
    update: {},
    create: {
      id: 'scale-psy-middle',
      title: '心理状态测评（中年级）',
      ageGroup: AgeGroup.MIDDLE,
      category: 'PSYCHOLOGY',
      questions: [
        {
          id: 'q1',
          stem: '最近一周，你觉得开心吗？',
          options: [
            { id: 'a', text: '每天都很开心', score: 3 },
            { id: 'b', text: '有时候开心', score: 2 },
            { id: 'c', text: '很少开心', score: 1 },
            { id: 'd', text: '一点都不开心', score: 0 },
          ],
          dimension: 'EMOTION',
          maxScore: 3,
        },
        {
          id: 'q2',
          stem: '你在北滘镇中心小学有好朋友吗？',
          options: [
            { id: 'a', text: '有很多好朋友', score: 3 },
            { id: 'b', text: '有一两个朋友', score: 2 },
            { id: 'c', text: '几乎没有朋友', score: 1 },
            { id: 'd', text: '没有朋友，很孤单', score: 0 },
          ],
          dimension: 'SOCIAL',
          maxScore: 3,
        },
        {
          id: 'q3',
          stem: '爸妈不在身边时（留守儿童），你会觉得？',
          options: [
            { id: 'a', text: '没关系，能照顾自己', score: 3 },
            { id: 'b', text: '有点想念，但能克服', score: 2 },
            { id: 'c', text: '很难过，经常想哭', score: 1 },
            { id: 'd', text: '非常难过，什么都不想做', score: 0 },
          ],
          dimension: 'EMOTION',
          maxScore: 3,
        },
        {
          id: 'q4',
          stem: '遇到困难时，你会怎么做？',
          options: [
            { id: 'a', text: '主动想办法解决', score: 3 },
            { id: 'b', text: '找同学或老师帮忙', score: 3 },
            { id: 'c', text: '告诉爸妈', score: 2 },
            { id: 'd', text: '逃避，不想面对', score: 0 },
          ],
          dimension: 'RESILIENCE',
          maxScore: 3,
        },
      ],
    },
  });

  console.log('✅ 测评量表创建完成（法治认知 + 心理状态）');

  // ============ 3. AI 情景游戏场景 ============
  console.log('📋 创建 AI 情景游戏场景...');

  await prisma.gameScenario.upsert({
    where: { id: 'game-bullying-middle' },
    update: {},
    create: {
      id: 'game-bullying-middle',
      title: '校园欺凌：勇敢说不',
      theme: 'BULLYING',
      ageGroup: AgeGroup.MIDDLE,
      script: {
        startNode: 'node1',
        nodes: {
          node1: {
            id: 'node1',
            scenario: '在北滘镇中心小学的走廊上，你看到高年级的同学在欺负你的好朋友小明，他们抢走了小明的零食并推搡他。',
            prompt: '你会怎么做？',
            choices: [
              { id: 'c1', text: '勇敢上前制止，告诉他们这样做不对', nextNode: 'node2', feedbackType: 'POSITIVE', feedback: '你很勇敢！制止欺凌是正确的做法。' },
              { id: 'c2', text: '假装没看见，快速走开', nextNode: 'node3', feedbackType: 'WARNING', feedback: '逃避不能解决问题，小明需要你的帮助。' },
              { id: 'c3', text: '去告诉老师', nextNode: 'node2', feedbackType: 'POSITIVE', feedback: '寻求老师帮助是明智的选择！' },
            ],
            isTerminal: false,
          },
          node2: {
            id: 'node2',
            scenario: '欺凌者离开了，小明很感激你。但第二天，欺凌者威胁你不准告诉别人。',
            prompt: '面对威胁，你会？',
            choices: [
              { id: 'c1', text: '不怕威胁，告诉班主任和爸妈', nextNode: 'node4', feedbackType: 'POSITIVE', feedback: '正确！面对威胁要寻求大人帮助，不要独自承担。' },
              { id: 'c2', text: '害怕了，以后不再管', nextNode: 'node4', feedbackType: 'CORRECTIVE', feedback: '害怕是正常的，但沉默会让欺凌继续。告诉信任的大人是最好的办法。' },
            ],
            isTerminal: false,
          },
          node3: {
            id: 'node3',
            scenario: '第二天，你听说小明被欺负得更厉害了，他现在不敢来上学。',
            prompt: '听到这个消息，你会？',
            choices: [
              { id: 'c1', text: '后悔没帮忙，现在去告诉老师', nextNode: 'node4', feedbackType: 'POSITIVE', feedback: '现在行动还不晚！及时报告老师能帮助小明。' },
              { id: 'c2', text: '觉得不关自己的事', nextNode: 'node4', feedbackType: 'CORRECTIVE', feedback: '每个人都有一份责任。今天帮助别人，明天别人才会帮助你。' },
            ],
            isTerminal: false,
          },
          node4: {
            id: 'node4',
            scenario: '老师介入处理后，欺凌者受到了教育并向小明道歉。校园又恢复了和谐。',
            prompt: '游戏结束',
            choices: [],
            isTerminal: true,
          },
        },
      },
    },
  });

  await prisma.gameScenario.upsert({
    where: { id: 'game-cyber-middle' },
    update: {},
    create: {
      id: 'game-cyber-middle',
      title: '网络安全：保护隐私',
      theme: 'CYBERSECURITY',
      ageGroup: AgeGroup.MIDDLE,
      script: {
        startNode: 'node1',
        nodes: {
          node1: {
            id: 'node1',
            scenario: '你在玩网络游戏时，有个陌生人加你好友，说可以送你稀有游戏装备，但需要你的真实姓名和学校信息。',
            prompt: '你会怎么做？',
            choices: [
              { id: 'c1', text: '拒绝提供个人信息', nextNode: 'node2', feedbackType: 'POSITIVE', feedback: '正确！个人信息不能随便告诉陌生人。' },
              { id: 'c2', text: '告诉对方姓名和学校', nextNode: 'node3', feedbackType: 'WARNING', feedback: '这很危险！陌生人可能利用你的信息做坏事。' },
              { id: 'c3', text: '告诉爸妈这件事', nextNode: 'node2', feedbackType: 'POSITIVE', feedback: '告诉爸妈是很好的做法，他们能帮你判断。' },
            ],
            isTerminal: false,
          },
          node2: {
            id: 'node2',
            scenario: '你做得很对！后来你发现那个陌生人确实在骗其他小朋友。',
            prompt: '游戏结束',
            choices: [],
            isTerminal: true,
          },
          node3: {
            id: 'node3',
            scenario: '不久后，你开始收到奇怪的骚扰电话，对方知道你的名字和学校。',
            prompt: '现在你会？',
            choices: [
              { id: 'c1', text: '立即告诉爸妈并报警', nextNode: 'node2', feedbackType: 'POSITIVE', feedback: '及时求助是正确的！警方可以帮你处理。' },
              { id: 'c2', text: '害怕但不敢说', nextNode: 'node2', feedbackType: 'CORRECTIVE', feedback: '独自承担会很辛苦，告诉大人才能解决问题。' },
            ],
            isTerminal: false,
          },
        },
      },
    },
  });

  console.log('✅ 游戏场景创建完成（校园欺凌 + 网络安全）');

  // ============ 4. 北滘镇本地化内容 ============
  console.log('📋 创建北滘镇本地化内容...');

  await prisma.localContent.upsert({
    where: { id: 'local-beijiao-risk-data' },
    update: {},
    create: {
      id: 'local-beijiao-risk-data',
      jurisdiction: 'beijiao',
      topic: 'RISK_DISTRIBUTION',
      contentType: 'REPORT',
      content: {
        overview: '北滘镇未成年人风险态势分析',
        totalMinors: 8500,
        leftBehindCount: 1200,
        riskDistribution: {
          NONE: 6800,
          LOW: 1100,
          MEDIUM: 400,
          HIGH: 180,
          CRITICAL: 20,
        },
        keyRisks: [
          '网络安全意识薄弱（网络游戏诈骗、个人信息泄露）',
          '校园欺凌事件偶有发生',
          '留守儿童心理孤独感较强',
          '法治认知水平参差不齐',
        ],
        localResources: [
          '北滘镇司法所法治教育基地',
          '北滘派出所未成年人保护热线',
          '北滘镇家庭教育指导中心',
        ],
      },
      dataSource: '北滘镇2025年未成年人保护工作调研报告',
    },
  });

  await prisma.localContent.upsert({
    where: { id: 'local-beijiao-cases' },
    update: {},
    create: {
      id: 'local-beijiao-cases',
      jurisdiction: 'beijiao',
      topic: 'TYPICAL_CASES',
      contentType: 'ADVICE',
      content: {
        cases: [
          {
            title: '北滘镇小学生网络游戏充值案',
            description: '某小学生沉迷网络游戏，一周内充值 2000 元，家长发现后求助司法所。',
            lesson: '加强网络消费教育，设置支付密码，关注孩子游戏行为。',
          },
          {
            title: '北滘镇校园欺凌干预案',
            description: '某小学五年级发生群体欺凌事件，经学校+家长+社区联合干预成功化解。',
            lesson: '家校社协同干预是解决欺凌问题的有效途径。',
          },
          {
            title: '留守儿童心理疏导案',
            description: '北滘镇某留守儿童长期情绪低落，经心理测评发现后定期开展心理疏导。',
            lesson: '定期心理测评有助于及早发现留守儿童心理问题。',
          },
        ],
      },
      dataSource: '北滘镇司法所案例库',
    },
  });

  console.log('✅ 北滘镇本地化内容创建完成');

  console.log('🎉 数据库播种完成！');
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
