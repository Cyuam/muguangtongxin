// 教师端逻辑
(function() {
  const { AssessmentEngine, TeachingAdviceGenerator, RISK_LEVELS, BeijiaoData } = window.MG;
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
    if (currentTab === 'home') renderHome();
    else if (currentTab === 'diagnosis') renderDiagnosis();
    else if (currentTab === 'advice') renderAdvice();
    else if (currentTab === 'trend') renderTrend();
  }

  function renderHome() {
    const history = AssessmentEngine.getHistory();
    const highRisk = history.filter(h => h.riskLevel === 'HIGH').length;
    const hasRisk = highRisk > 0;
    app.innerHTML = `
      <div style="padding:24px 16px 16px;text-align:center;">
        <div style="font-size:56px;">👩‍🏫</div>
        <h2 style="font-size:22px;font-weight:800;margin-top:8px;">教师端</h2>
        <p style="font-size:13px;color:var(--muted);margin-top:4px;">北滘镇中心小学 · 五年级1班</p>
      </div>
      <div style="padding:0 16px;">
        <div onclick="location.href='register.html'" style="background:linear-gradient(135deg,var(--accent),var(--gold));color:#fff;border-radius:18px;padding:26px 20px;margin-bottom:12px;box-shadow:0 8px 24px rgba(242,129,31,0.3);display:flex;align-items:center;gap:16px;">
          <div style="font-size:44px;">📝</div>
          <div style="flex:1;"><div style="font-size:19px;font-weight:800;">队伍报名</div><div style="font-size:13px;opacity:0.92;margin-top:3px;">填写队伍信息与成员名单，加入实践团</div></div>
          <div style="font-size:26px;">→</div>
        </div>
        <div onclick="location.href='download.html'" style="background:linear-gradient(135deg,#1890ff,#91d5ff);color:#fff;border-radius:18px;padding:26px 20px;margin-bottom:12px;box-shadow:0 8px 24px rgba(24,144,255,0.28);display:flex;align-items:center;gap:16px;">
          <div style="font-size:44px;">📁</div>
          <div style="flex:1;"><div style="font-size:19px;font-weight:800;">资料下载</div><div style="font-size:13px;opacity:0.92;margin-top:3px;">项目策划书、调研报告、宣讲课件等资料</div></div>
          <div style="font-size:26px;">→</div>
        </div>
        <div onclick="location.href='works.html'" style="background:var(--card);border:2px solid var(--line);border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          <div style="font-size:36px;">🏆</div>
          <div style="flex:1;"><div style="font-size:16px;font-weight:700;">成果展示</div><div style="font-size:12px;color:var(--muted);margin-top:2px;">法治宣讲、心理陪伴、调研报告等实践成果</div></div>
          <div style="font-size:22px;color:var(--accent);">→</div>
        </div>
      </div>
      <div class="page-title">📊 班级学情</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 16px 20px;">
        <div style="background:linear-gradient(135deg,#f6ffed,#fffbf5);border:1px solid #b7eb8f;border-radius:14px;padding:14px 8px;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:var(--accent);">35</div>
          <div style="font-size:11px;color:var(--muted);">班级人数</div>
        </div>
        <div style="background:linear-gradient(135deg,#e6f7ff,#fffbf5);border:1px solid #91d5ff;border-radius:14px;padding:14px 8px;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#1890ff;">${history.length}</div>
          <div style="font-size:11px;color:var(--muted);">测评次数</div>
        </div>
        <div style="background:linear-gradient(135deg,${hasRisk ? '#fff1f0' : '#f6ffed'},#fffbf5);border:1px solid ${hasRisk ? '#ffa39e' : '#b7eb8f'};border-radius:14px;padding:14px 8px;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:${hasRisk ? '#f5222d' : '#52c41a'};">${highRisk}</div>
          <div style="font-size:11px;color:var(--muted);">高风险</div>
        </div>
      </div>
      <div style="padding:0 16px;">
        <div onclick="document.querySelector('[data-tab=diagnosis]').click()" style="background:var(--card);border:2px solid var(--line);border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:10px;">
          <div style="font-size:30px;">📊</div>
          <div style="flex:1;"><div style="font-size:15px;font-weight:700;">班级薄弱点诊断</div><div style="font-size:12px;color:var(--muted);margin-top:2px;">汇总测评数据，识别薄弱维度</div></div>
          <div style="font-size:20px;color:var(--accent);">→</div>
        </div>
        <div onclick="document.querySelector('[data-tab=advice]').click()" style="background:var(--card);border:2px solid var(--line);border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:10px;">
          <div style="font-size:30px;">💡</div>
          <div style="flex:1;"><div style="font-size:15px;font-weight:700;">教学建议生成</div><div style="font-size:12px;color:var(--muted);margin-top:2px;">基于薄弱点自动生成教学建议</div></div>
          <div style="font-size:20px;color:var(--accent);">→</div>
        </div>
        <div onclick="document.querySelector('[data-tab=trend]').click()" style="background:var(--card);border:2px solid var(--line);border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;">
          <div style="font-size:30px;">📈</div>
          <div style="flex:1;"><div style="font-size:15px;font-weight:700;">薄弱点变化趋势</div><div style="font-size:12px;color:var(--muted);margin-top:2px;">对比不同时间段诊断数据</div></div>
          <div style="font-size:20px;color:var(--accent);">→</div>
        </div>
      </div>
    `;
  }

  function renderDiagnosis() {
    const history = AssessmentEngine.getHistory();
    app.innerHTML = `<div class="page-title">📊 班级知识薄弱点诊断</div>`;
    if (history.length === 0) {
      app.innerHTML += `<div class="empty"><div class="icon">📝</div>暂无测评数据<br>请先让学生完成测评</div>`;
      return;
    }
    // 汇总各维度得分
    const dimScores = {}, dimCount = {};
    history.forEach(h => {
      Object.keys(h.dimensionScores || {}).forEach(d => {
        dimScores[d] = (dimScores[d] || 0) + h.dimensionScores[d];
        dimCount[d] = (dimCount[d] || 0) + h.dimensionMax[d];
      });
    });
    app.innerHTML += `<div class="page-subtitle">基于 ${history.length} 次测评数据</div>`;
    Object.keys(dimScores).forEach(d => {
      const rate = Math.round((dimScores[d] / dimCount[d]) * 100);
      const isWeak = rate < 60;
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h3 style="margin:0;">${d}</h3>
          <span class="tag ${isWeak ? 'tag-red' : 'tag-green'}">${isWeak ? '薄弱' : '良好'} ${rate}%</span>
        </div>
        <div class="progress"><div class="progress-bar" style="width:${rate}%;background:${isWeak ? '#f5222d' : '#52c41a'};"></div></div>
      `;
      app.appendChild(div);
    });
    // 高风险学生
    const highRiskStudents = history.filter(h => h.riskLevel === 'HIGH' || h.riskLevel === 'CRITICAL');
    if (highRiskStudents.length > 0) {
      const title = document.createElement('div');
      title.className = 'page-title';
      title.innerHTML = '⚠️ 重点关注学生';
      app.appendChild(title);
      highRiskStudents.forEach(h => {
        const risk = RISK_LEVELS[h.riskLevel];
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<h4>${h.scaleTitle}</h4><p><span class="tag" style="background:${risk.color}20;color:${risk.color};">${risk.label}</span> 薄弱：${h.weakDimensions.join('、')}</p>`;
        app.appendChild(div);
      });
    }
  }

  function renderAdvice() {
    const history = AssessmentEngine.getHistory();
    app.innerHTML = `<div class="page-title">💡 精准教学建议</div>`;
    // 收集所有薄弱维度
    const weakDims = new Set();
    history.forEach(h => (h.weakDimensions || []).forEach(d => weakDims.add(d)));
    if (weakDims.size === 0) {
      app.innerHTML += `<div class="empty"><div class="icon">✅</div>暂无薄弱点<br>班级整体表现良好</div>`;
      return;
    }
    const advices = TeachingAdviceGenerator.generate(Array.from(weakDims));
    advices.forEach(a => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3 style="color:var(--accent);">${a.title}</h3>
        <p style="margin-bottom:12px;">${a.content}</p>
        <div style="font-size:13px;font-weight:700;margin-bottom:6px;">推荐教学活动：</div>
        ${a.activities.map(act => `<span class="tag tag-blue" style="margin-right:4px;margin-bottom:4px;">${act}</span>`).join('')}
      `;
      app.appendChild(div);
    });
    // 北滘镇本地化案例
    const title = document.createElement('div');
    title.className = 'page-title';
    title.textContent = '📍 北滘镇本地案例';
    app.appendChild(title);
    BeijiaoData.cases.forEach(c => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<h4>${c.title}</h4><p>${c.desc}</p><p style="margin-top:4px;color:var(--accent-dark);">💡 ${c.lesson}</p>`;
      app.appendChild(div);
    });
  }

  function renderTrend() {
    const history = AssessmentEngine.getHistory();
    app.innerHTML = `<div class="page-title">📈 薄弱点变化趋势</div>`;
    if (history.length < 2) {
      app.innerHTML += `<div class="empty"><div class="icon">📊</div>数据不足<br>至少需要2次测评才能查看趋势</div>`;
      return;
    }
    // 按时间正序展示得分变化
    const sorted = [...history].reverse();
    app.innerHTML += `<div class="page-subtitle">最近 ${sorted.length} 次测评得分趋势</div>`;
    const maxScore = 100;
    const svgWidth = 320, svgHeight = 180, padding = 30;
    const points = sorted.map((h, i) => ({
      x: padding + (i / (sorted.length - 1)) * (svgWidth - 2 * padding),
      y: svgHeight - padding - (h.percentage / maxScore) * (svgHeight - 2 * padding),
      score: h.percentage,
      date: new Date(h.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const svg = `
      <div class="card" style="text-align:center;">
        <svg width="${svgWidth}" height="${svgHeight}" style="max-width:100%;">
          <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="#e8d5b8" />
          <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="#e8d5b8" />
          <path d="${pathD}" fill="none" stroke="#f2811f" stroke-width="2" />
          ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#f2811f" /><text x="${p.x}" y="${p.y - 8}" font-size="10" text-anchor="middle" fill="#7a6555">${p.score}%</text>`).join('')}
          ${points.map(p => `<text x="${p.x}" y="${svgHeight - padding + 14}" font-size="9" text-anchor="middle" fill="#7a6555">${p.date}</text>`).join('')}
        </svg>
      </div>
    `;
    app.innerHTML += svg;
    // 趋势分析
    const recent = sorted[sorted.length - 1].percentage;
    const prev = sorted[sorted.length - 2].percentage;
    const diff = recent - prev;
    const trendDiv = document.createElement('div');
    trendDiv.className = 'card';
    trendDiv.style.textAlign = 'center';
    trendDiv.innerHTML = `
      <h3>趋势分析</h3>
      <p style="font-size:24px;font-weight:900;color:${diff >= 0 ? '#52c41a' : '#f5222d'};">${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff)}%</p>
      <p>${diff >= 0 ? '班级整体表现提升中' : '需要加强关注'}</p>
    `;
    app.appendChild(trendDiv);
  }

  render();
})();
