// 家长端逻辑
(function() {
  const { Store, AssessmentEngine, ParentTaskManager, RISK_LEVELS, BeijiaoData, ReportGenerator } = window.MG;
  const app = document.getElementById('app');
  let currentTab = 'home';

  // 支持 #admin 直接跳社区后台
  if (location.hash === '#admin') currentTab = 'admin';

  const tabs = ['home', 'warning', 'advice', 'task', 'works', 'download', 'admin'];

  document.querySelectorAll('#tabbar a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('#tabbar a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      currentTab = a.dataset.tab;
      render();
    });
  });

  function render() {
    if (currentTab === 'home') renderHome();
    else if (currentTab === 'warning') renderWarnings();
    else if (currentTab === 'advice') renderAdvices();
    else if (currentTab === 'task') renderTasks();
    else if (currentTab === 'works') location.href = 'works.html';
    else if (currentTab === 'download') location.href = 'download.html';
    else if (currentTab === 'admin') renderAdmin();
  }

  function renderHome() {
    const warnings = Store.get('warnings', []);
    const tasks = ParentTaskManager.getAll();
    const unreadWarnings = warnings.filter(w => w.status === 'unread').length;
    const pendingTasks = tasks.filter(t => t.status === 'published').length;
    const hasRisk = unreadWarnings > 0;
    app.innerHTML = `
      <div style="padding:24px 16px 16px;text-align:center;">
        <div style="font-size:56px;">👨‍👩‍👧</div>
        <h2 style="font-size:22px;font-weight:800;margin-top:8px;">家长端</h2>
        <p style="font-size:13px;color:var(--muted);margin-top:4px;">关注孩子成长，家校协同守护</p>
      </div>
      <div style="padding:0 16px;">
        <div onclick="document.querySelector('[data-tab=warning]').click()" style="background:${hasRisk ? 'linear-gradient(135deg,#f5222d,#fa8c16)' : 'linear-gradient(135deg,#52c41a,#b7eb8f)'};color:#fff;border-radius:18px;padding:24px 20px;margin-bottom:12px;box-shadow:0 6px 20px rgba(${hasRisk ? '245,34,45' : '82,196,26'},0.25);display:flex;align-items:center;gap:16px;">
          <div style="font-size:40px;">${hasRisk ? '⚠️' : '✅'}</div>
          <div style="flex:1;"><div style="font-size:18px;font-weight:800;">${hasRisk ? unreadWarnings + ' 条未读预警' : '孩子状态良好'}</div><div style="font-size:13px;opacity:0.9;margin-top:2px;">${hasRisk ? '点击查看风险预警报告' : '暂无风险预警'}</div></div>
          <div style="font-size:24px;">→</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
          <div onclick="document.querySelector('[data-tab=advice]').click()" style="background:linear-gradient(135deg,#e6f7ff,#fffbf5);border:1px solid #91d5ff;border-radius:16px;padding:18px 14px;">
            <div style="font-size:32px;">💡</div>
            <div style="font-size:15px;font-weight:700;margin-top:6px;">监护建议</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">远程监护建议推送</div>
          </div>
          <div onclick="document.querySelector('[data-tab=task]').click()" style="background:linear-gradient(135deg,#f6ffed,#fffbf5);border:1px solid #b7eb8f;border-radius:16px;padding:18px 14px;">
            <div style="font-size:32px;">📋</div>
            <div style="font-size:15px;font-weight:700;margin-top:6px;">亲子任务</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">${pendingTasks > 0 ? pendingTasks + ' 个待完成' : '发起亲子互动'}</div>
          </div>
        </div>
      </div>
      <div class="page-title">📂 项目资料</div>
      <div class="list-item" onclick="location.href='works.html'">
        <h4>🏆 成果展示</h4><p>法治宣讲、心理陪伴、调研报告等实践成果</p>
      </div>
      <div class="list-item" onclick="location.href='download.html'">
        <h4>📁 资源下载</h4><p>项目策划书、调研报告、宣讲课件等资料</p>
      </div>
      <div class="page-title">🏛️ 社区后台</div>
      <div class="list-item" onclick="document.querySelector('[data-tab=admin]').click()">
        <h4>📊 北滘镇数据看板</h4><p>辖区数据看板与治理报告</p>
      </div>
    `;
    if (location.hash === '#admin') { currentTab = 'admin'; renderAdmin(); }
  }

  function renderWarnings() {
    const warnings = Store.get('warnings', []);
    app.innerHTML = `<div class="page-title">⚠️ 风险预警报告</div>`;
    if (warnings.length === 0) {
      app.innerHTML += `<div class="empty"><div class="icon">✅</div>暂无预警<br>孩子状态良好</div>`;
      return;
    }
    warnings.forEach(w => {
      const risk = RISK_LEVELS[w.riskLevel];
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <h4>${w.title}</h4>
        <p><span class="tag" style="background:${risk.color}20;color:${risk.color};">${risk.label}</span> ${new Date(w.createdAt).toLocaleString('zh-CN')}</p>
        ${w.status === 'unread' ? '<span class="tag tag-red" style="margin-top:4px;">未读</span>' : ''}
      `;
      div.onclick = () => { w.status = 'read'; Store.set('warnings', warnings); showWarningDetail(w); };
      app.appendChild(div);
    });
  }

  function showWarningDetail(w) {
    const risk = RISK_LEVELS[w.riskLevel];
    app.innerHTML = `
      <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> 预警详情</a></div>
      <div class="card"><h3>${w.title}</h3><p><span class="tag" style="background:${risk.color}20;color:${risk.color};">${risk.label}</span></p></div>
      <div class="page-title">📋 风险表现</div>
      ${w.manifestations.map(m => `<div class="list-item"><p>• ${m}</p></div>`).join('')}
      <div class="page-title">💡 建议措施</div>
      ${w.suggestions.map(s => `<div class="list-item"><p>• ${s}</p></div>`).join('')}
      <div style="padding:16px;"><a class="btn btn-primary btn-block" href="parent.html">返回</a></div>
    `;
  }

  function renderAdvices() {
    app.innerHTML = `<div class="page-title">💡 远程监护建议</div><div class="page-subtitle">基于孩子测评数据推送</div>`;
    const advices = [
      { title: '加强亲子沟通', content: '建议每天抽出15分钟与孩子进行一对一交流，了解其在校生活与心理状态。', topic: '情感联结' },
      { title: '关注网络行为', content: '北滘镇近期发生多起未成年人网络诈骗案，建议关注孩子上网内容，设置支付密码。', topic: '网络安全' },
      { title: '留守儿童专项', content: '作为留守儿童家长，建议每周至少视频通话2次，假期尽量回家陪伴。', topic: '留守关怀' },
      { title: '法治共学', content: '建议与孩子共同学习《未成年人保护法》，结合北滘镇本地案例讨论。', topic: '法治教育' },
    ];
    advices.forEach(a => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<h4>${a.title}</h4><span class="tag tag-blue">${a.topic}</span><p style="margin-top:8px;">${a.content}</p>`;
      app.appendChild(div);
    });
  }

  function renderTasks() {
    const tasks = ParentTaskManager.getAll();
    app.innerHTML = `
      <div class="page-title">📋 亲子任务</div>
      <div style="padding:0 16px;"><button class="btn btn-primary btn-block" onclick="showTaskForm()">+ 发起亲子任务</button></div>
      <div id="taskList"></div>
    `;
    const list = document.getElementById('taskList');
    if (tasks.length === 0) {
      list.innerHTML = `<div class="empty"><div class="icon">📋</div>暂无任务<br>点击上方发起亲子任务</div>`;
      return;
    }
    tasks.forEach(t => {
      const div = document.createElement('div');
      div.className = 'list-item';
      const statusTag = t.status === 'verified' ? '<span class="tag tag-green">已完成</span>' : '<span class="tag tag-yellow">进行中</span>';
      div.innerHTML = `<h4>${t.title}</h4><p>${t.description}</p><div style="margin-top:8px;">${statusTag} <span class="tag tag-orange">${t.pointsReward} 积分</span></div>`;
      if (t.status !== 'verified') {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline';
        btn.style.cssText = 'margin-top:8px;font-size:13px;padding:6px 12px;';
        btn.textContent = '✓ 验收完成';
        btn.onclick = () => { ParentTaskManager.verify(t.id); renderTasks(); };
        div.appendChild(btn);
      }
      list.appendChild(div);
    });
  }

  window.showTaskForm = function() {
    app.innerHTML = `
      <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> 发起亲子任务</a></div>
      <div class="card">
        <label style="display:block;font-weight:700;margin-bottom:8px;">任务标题</label>
        <input id="t-title" type="text" placeholder="如：一起学习未成年人保护法" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;margin-bottom:16px;font-size:15px;">
        <label style="display:block;font-weight:700;margin-bottom:8px;">任务描述</label>
        <textarea id="t-desc" placeholder="任务详细要求..." style="width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;margin-bottom:16px;font-size:15px;min-height:80px;"></textarea>
        <label style="display:block;font-weight:700;margin-bottom:8px;">任务类型</label>
        <select id="t-cat" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;margin-bottom:16px;font-size:15px;">
          <option value="LAW_STUDY">法治共学</option>
          <option value="EMOTION">情感交流</option>
          <option value="LIFE_PRACTICE">生活实践</option>
        </select>
        <label style="display:block;font-weight:700;margin-bottom:8px;">积分奖励</label>
        <input id="t-points" type="number" value="30" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;margin-bottom:16px;font-size:15px;">
        <button class="btn btn-primary btn-block" onclick="submitTask()">发布任务</button>
      </div>
    `;
  };

  window.submitTask = function() {
    const title = document.getElementById('t-title').value.trim();
    const desc = document.getElementById('t-desc').value.trim();
    const cat = document.getElementById('t-cat').value;
    const points = parseInt(document.getElementById('t-points').value) || 30;
    if (!title || !desc) { alert('请填写完整'); return; }
    const catLabel = { LAW_STUDY: '法治共学', EMOTION: '情感交流', LIFE_PRACTICE: '生活实践' }[cat];
    ParentTaskManager.create({ title, description: desc, category: catLabel, pointsReward: points });
    location.reload();
  };

  // ============ 社区后台功能（并入家长端） ============
  function renderAdmin() {
    const history = AssessmentEngine.getHistory();
    const warnings = Store.get('warnings', []);
    const tasks = Store.get('parentTasks', []);
    const dist = BeijiaoData.riskDistribution;
    app.innerHTML = `
      <div class="card" style="text-align:center;background:linear-gradient(135deg,#f9f0ff,#fffbf5);">
        <div style="font-size:48px;">🏛️</div>
        <h3 style="margin-top:8px;">北滘镇数据看板</h3>
        <p>家校社协同治理 · 数据中台</p>
      </div>
      <div class="page-title">📊 核心指标</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px;">
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--accent);">${BeijiaoData.totalMinors}</div>
          <div style="font-size:12px;color:var(--muted);">辖区未成年人</div>
        </div>
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--gold-dark);">${BeijiaoData.leftBehindCount}</div>
          <div style="font-size:12px;color:var(--muted);">留守儿童</div>
        </div>
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#52c41a;">${history.length}</div>
          <div style="font-size:12px;color:var(--muted);">测评总数</div>
        </div>
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#f5222d;">${warnings.length}</div>
          <div style="font-size:12px;color:var(--muted);">预警次数</div>
        </div>
      </div>
      <div class="page-title">🎯 风险分布</div>
      <div class="card">
    `;
    Object.keys(dist).forEach(level => {
      const count = dist[level];
      const pct = Math.round((count / BeijiaoData.totalMinors) * 100);
      const colors = { '无风险': '#52c41a', '低风险': '#73d13d', '中风险': '#faad14', '高风险': '#fa8c16', '极高风险': '#f5222d' };
      app.innerHTML += `
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
            <span>${level}</span><span>${count} 人 (${pct}%)</span>
          </div>
          <div class="progress"><div class="progress-bar" style="width:${pct}%;background:${colors[level]};"></div></div>
        </div>
      `;
    });
    app.innerHTML += `</div>`;
    // 治理报告
    app.innerHTML += `<div class="page-title">📄 治理报告</div>`;
    app.innerHTML += `<div style="padding:0 16px;"><button class="btn btn-primary btn-block" onclick="showReportForm()">+ 生成治理报告</button></div>`;
    const reports = ReportGenerator.getAll();
    if (reports.length > 0) {
      reports.slice(0, 5).forEach(r => {
        const periodLabel = { WEEKLY: '周报', MONTHLY: '月报', TERM: '学期报' }[r.period] || r.period;
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<h4>北滘镇治理${periodLabel}</h4><p>${r.overview}</p><p style="font-size:12px;margin-top:4px;">${new Date(r.generatedAt).toLocaleString('zh-CN')}</p>`;
        div.onclick = () => showReportDetail(r);
        app.appendChild(div);
      });
    }
    // 本地资源
    app.innerHTML += `<div class="page-title">📍 本地治理资源</div>`;
    BeijiaoData.resources.forEach(r => {
      app.innerHTML += `<div class="list-item"><h4>🏛️ ${r}</h4></div>`;
    });
  }

  window.showReportForm = function() {
    app.innerHTML = `
      <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> 生成报告</a></div>
      <div class="card">
        <label style="display:block;font-weight:700;margin-bottom:8px;">报告周期</label>
        <select id="r-period" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;margin-bottom:16px;font-size:15px;">
          <option value="WEEKLY">周报</option>
          <option value="MONTHLY" selected>月报</option>
          <option value="TERM">学期报</option>
        </select>
        <button class="btn btn-primary btn-block" onclick="submitReport()">生成报告</button>
      </div>
    `;
  };

  window.submitReport = function() {
    const period = document.getElementById('r-period').value;
    const report = ReportGenerator.generate(period);
    ReportGenerator.save(report);
    currentTab = 'admin'; renderAdmin();
  };

  function showReportDetail(r) {
    app.innerHTML = `
      <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> 报告详情</a></div>
      <div class="card"><h3>北滘镇治理报告</h3><p>${new Date(r.generatedAt).toLocaleString('zh-CN')}</p></div>
      <div class="page-title">📋 总体情况</div><div class="card"><p>${r.overview}</p></div>
      <div class="page-title">⚠️ 风险干预</div><div class="card"><p>${r.riskIntervention}</p></div>
      <div class="page-title">🤝 协同成效</div><div class="card"><p>${r.collabEffectiveness}</p></div>
      <div class="page-title">📍 本地化分析</div><div class="card"><p>${r.localAnalysis}</p></div>
      <div class="page-title">❌ 存在问题</div>
      ${r.issues.map(i => `<div class="list-item"><p>• ${i}</p></div>`).join('')}
      <div class="page-title">💡 改进建议</div>
      ${r.suggestions.map(s => `<div class="list-item"><p>• ${s}</p></div>`).join('')}
      <div style="padding:16px;"><a class="btn btn-primary btn-block" href="parent.html#admin">返回</a></div>
    `;
  }

  render();
})();
