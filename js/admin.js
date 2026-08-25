// 社区后台逻辑
(function() {
  const { Store, AssessmentEngine, BeijiaoData, ReportGenerator, RISK_LEVELS } = window.MG;
  const app = document.getElementById('app');
  let currentTab = 'home';

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
    if (currentTab === 'home') renderDashboard();
    else if (currentTab === 'risk') renderRiskMap();
    else if (currentTab === 'report') renderReports();
    else if (currentTab === 'collab') renderCollab();
  }

  function renderDashboard() {
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
    // 主要风险
    app.innerHTML += `<div class="page-title">⚠️ 主要风险</div>`;
    BeijiaoData.keyRisks.forEach(r => {
      app.innerHTML += `<div class="list-item"><p>• ${r}</p></div>`;
    });
  }

  function renderRiskMap() {
    app.innerHTML = `
      <div class="page-title">🗺️ 风险分布地图</div>
      <div class="page-subtitle">北滘镇下属村/社区</div>
    `;
    const villages = [
      { name: '北滘社区', risk: 15, total: 1200 },
      { name: '碧江村', risk: 8, total: 900 },
      { name: '沙墩村', risk: 22, total: 800 },
      { name: '林头村', risk: 10, total: 1100 },
      { name: '新城社区', risk: 5, total: 1500 },
      { name: '波波社区', risk: 12, total: 1000 },
    ];
    villages.forEach(v => {
      const rate = (v.risk / v.total * 100).toFixed(1);
      const color = rate > 2 ? '#f5222d' : rate > 1 ? '#fa8c16' : '#52c41a';
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h3 style="margin:0;">📍 ${v.name}</h3>
            <p style="margin:0;font-size:12px;">未成年人 ${v.total} 人 · 高风险 ${v.risk} 人</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:24px;font-weight:900;color:${color};">${rate}%</div>
            <div style="font-size:11px;color:var(--muted);">风险率</div>
          </div>
        </div>
        <div class="progress" style="margin-top:8px;"><div class="progress-bar" style="width:${rate * 30}%;background:${color};"></div></div>
      `;
      app.appendChild(div);
    });
  }

  function renderReports() {
    const reports = ReportGenerator.getAll();
    app.innerHTML = `
      <div class="page-title">📄 治理报告</div>
      <div style="padding:0 16px;"><button class="btn btn-primary btn-block" onclick="showReportForm()">+ 生成治理报告</button></div>
      <div id="reportList" style="margin-top:12px;"></div>
    `;
    const list = document.getElementById('reportList');
    if (reports.length === 0) {
      list.innerHTML = `<div class="empty"><div class="icon">📄</div>暂无报告<br>点击上方生成治理报告</div>`;
      return;
    }
    reports.forEach(r => {
      const div = document.createElement('div');
      div.className = 'list-item';
      const periodLabel = { WEEKLY: '周报', MONTHLY: '月报', TERM: '学期报' }[r.period] || r.period;
      div.innerHTML = `<h4>北滘镇治理${periodLabel}</h4><p>${r.overview}</p><p style="font-size:12px;margin-top:4px;">${new Date(r.generatedAt).toLocaleString('zh-CN')}</p>`;
      div.onclick = () => showReportDetail(r);
      list.appendChild(div);
    });
  }

  function showReportDetail(r) {
    app.innerHTML = `
      <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> 报告详情</a></div>
      <div class="card"><h3>北滘镇治理报告</h3><p>${new Date(r.generatedAt).toLocaleString('zh-CN')}</p></div>
      <div class="page-title">📋 总体情况</div>
      <div class="card"><p>${r.overview}</p></div>
      <div class="page-title">⚠️ 风险干预</div>
      <div class="card"><p>${r.riskIntervention}</p></div>
      <div class="page-title">🤝 协同成效</div>
      <div class="card"><p>${r.collabEffectiveness}</p></div>
      <div class="page-title">📍 本地化分析</div>
      <div class="card"><p>${r.localAnalysis}</p></div>
      <div class="page-title">❌ 存在问题</div>
      ${r.issues.map(i => `<div class="list-item"><p>• ${i}</p></div>`).join('')}
      <div class="page-title">💡 改进建议</div>
      ${r.suggestions.map(s => `<div class="list-item"><p>• ${s}</p></div>`).join('')}
      <div style="padding:16px;"><a class="btn btn-primary btn-block" href="admin.html">返回</a></div>
    `;
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
    location.reload();
  };

  function renderCollab() {
    const history = AssessmentEngine.getHistory();
    const tasks = Store.get('parentTasks', []);
    const warnings = Store.get('warnings', []);
    const verifiedTasks = tasks.filter(t => t.status === 'verified').length;
    app.innerHTML = `
      <div class="page-title">🤝 家校社协同状态</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px;">
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--accent);">${history.length}</div>
          <div style="font-size:12px;color:var(--muted);">儿童端测评</div>
        </div>
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--gold-dark);">${tasks.length}</div>
          <div style="font-size:12px;color:var(--muted);">亲子任务</div>
        </div>
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#f5222d;">${warnings.length}</div>
          <div style="font-size:12px;color:var(--muted);">家长端预警</div>
        </div>
        <div class="card" style="margin:0;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#52c41a;">${verifiedTasks}</div>
          <div style="font-size:12px;color:var(--muted);">已完成任务</div>
        </div>
      </div>
      <div class="page-title">📈 协同覆盖率</div>
      <div class="card">
    `;
    const coverage = history.length > 0 ? Math.round((verifiedTasks / history.length) * 100) : 0;
    app.innerHTML += `
        <div style="text-align:center;">
          <div style="font-size:36px;font-weight:900;color:${coverage >= 50 ? '#52c41a' : '#fa8c16'};">${coverage}%</div>
          <p>家校协同干预覆盖率</p>
        </div>
        <div class="progress" style="margin-top:12px;"><div class="progress-bar" style="width:${coverage}%;"></div></div>
      </div>
    `;
    // 本地资源
    app.innerHTML += `<div class="page-title">📍 本地治理资源</div>`;
    BeijiaoData.resources.forEach(r => {
      app.innerHTML += `<div class="list-item"><h4>🏛️ ${r}</h4></div>`;
    });
    // 典型案例
    app.innerHTML += `<div class="page-title">📚 典型案例</div>`;
    BeijiaoData.cases.forEach(c => {
      app.innerHTML += `<div class="list-item"><h4>${c.title}</h4><p>${c.desc}</p><p style="margin-top:4px;color:var(--accent-dark);">💡 ${c.lesson}</p></div>`;
    });
  }

  render();
})();
