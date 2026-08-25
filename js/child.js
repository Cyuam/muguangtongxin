// 儿童端逻辑
(function() {
  const { AssessmentScales, GameScenarios, AssessmentEngine, PointsManager, RISK_LEVELS } = window.MG;
  const app = document.getElementById('app');
  let currentTab = 'home';

  // Tab 切换
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
    else if (currentTab === 'assessment') renderAssessmentList();
    else if (currentTab === 'game') renderGameList();
    else if (currentTab === 'points') renderPoints();
  }

  // 首页
  function renderHome() {
    const points = PointsManager.get();
    const history = AssessmentEngine.getHistory();
    app.innerHTML = `
      <div style="padding:24px 16px 16px;text-align:center;">
        <div style="font-size:56px;">🧒</div>
        <h2 style="font-size:22px;font-weight:800;margin-top:8px;">欢迎来到沐光童心</h2>
        <p style="font-size:13px;color:var(--muted);margin-top:4px;">让我们一起学习法治知识，守护健康成长</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 16px 20px;">
        <div style="background:linear-gradient(135deg,#fff3e6,#fffbf5);border:1px solid #ffd8a8;border-radius:14px;padding:14px 8px;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:var(--gold-dark);">${points}</div>
          <div style="font-size:11px;color:var(--muted);">我的积分</div>
        </div>
        <div style="background:linear-gradient(135deg,#e6f7ff,#fffbf5);border:1px solid #91d5ff;border-radius:14px;padding:14px 8px;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:var(--accent);">${history.length}</div>
          <div style="font-size:11px;color:var(--muted);">测评次数</div>
        </div>
        <div style="background:linear-gradient(135deg,#f6ffed,#fffbf5);border:1px solid #b7eb8f;border-radius:14px;padding:14px 8px;text-align:center;">
          <div style="font-size:26px;font-weight:900;color:#52c41a;">${GameScenarios.length}</div>
          <div style="font-size:11px;color:var(--muted);">游戏场景</div>
        </div>
      </div>
      <div style="padding:0 16px;">
        <div onclick="document.querySelector('[data-tab=assessment]').click()" style="background:linear-gradient(135deg,var(--accent),var(--gold));color:#fff;border-radius:18px;padding:24px 20px;margin-bottom:12px;box-shadow:0 6px 20px rgba(242,129,31,0.25);display:flex;align-items:center;gap:16px;">
          <div style="font-size:40px;">📝</div>
          <div style="flex:1;"><div style="font-size:18px;font-weight:800;">开始测评</div><div style="font-size:13px;opacity:0.9;margin-top:2px;">分龄法治认知与心理状态测评</div></div>
          <div style="font-size:24px;">→</div>
        </div>
        <div onclick="document.querySelector('[data-tab=game]').click()" style="background:linear-gradient(135deg,#52c41a,#b7eb8f);color:#fff;border-radius:18px;padding:24px 20px;margin-bottom:12px;box-shadow:0 6px 20px rgba(82,196,26,0.25);display:flex;align-items:center;gap:16px;">
          <div style="font-size:40px;">🎮</div>
          <div style="flex:1;"><div style="font-size:18px;font-weight:800;">AI 情景游戏</div><div style="font-size:13px;opacity:0.9;margin-top:2px;">校园欺凌、网络安全等情景模拟</div></div>
          <div style="font-size:24px;">→</div>
        </div>
        <div onclick="document.querySelector('[data-tab=points]').click()" style="background:var(--card);border:2px solid var(--line);border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;">
          <div style="font-size:36px;">⭐</div>
          <div style="flex:1;"><div style="font-size:16px;font-weight:700;">我的积分</div><div style="font-size:12px;color:var(--muted);margin-top:2px;">查看积分、排行榜与成就</div></div>
          <div style="font-size:22px;color:var(--accent);">→</div>
        </div>
      </div>
    `;
  }

  // 测评列表
  function renderAssessmentList() {
    app.innerHTML = `<div class="page-title">📝 分龄测评</div><div class="page-subtitle">选择一个测评开始作答</div>`;
    AssessmentScales.forEach(scale => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<h4>${scale.title}</h4><p>${scale.ageGroup} · ${scale.questions.length} 题 · ${scale.category === 'LAW_AWARENESS' ? '法治认知' : '心理状态'}</p>`;
      div.onclick = () => startAssessment(scale);
      app.appendChild(div);
    });
    // 历史记录
    const history = AssessmentEngine.getHistory();
    if (history.length > 0) {
      const title = document.createElement('div');
      title.className = 'page-title';
      title.textContent = '📊 测评历史';
      app.appendChild(title);
      history.slice(0, 5).forEach(h => {
        const div = document.createElement('div');
        div.className = 'list-item';
        const risk = RISK_LEVELS[h.riskLevel];
        div.innerHTML = `<h4>${h.scaleTitle}</h4><p>得分：${h.percentage}% · <span class="tag" style="background:${risk.color}20;color:${risk.color};">${risk.label}</span> · ${new Date(h.createdAt).toLocaleDateString('zh-CN')}</p>`;
        app.appendChild(div);
      });
    }
  }

  // 开始测评
  function startAssessment(scale) {
    let currentQ = 0;
    const answers = {};
    renderQuestion();

    function renderQuestion() {
      const q = scale.questions[currentQ];
      const progress = ((currentQ) / scale.questions.length) * 100;
      app.innerHTML = `
        <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> ${scale.title}</a></div>
        <div style="padding:16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:var(--muted);">
            <span>第 ${currentQ + 1} / ${scale.questions.length} 题</span><span>${q.dimension}</span>
          </div>
          <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
        </div>
        <div class="card">
          <div class="assessment-q">${q.stem}</div>
          <div class="assessment-options" id="opts"></div>
        </div>
      `;
      const opts = document.getElementById('opts');
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('div');
        btn.className = 'assessment-opt';
        btn.textContent = opt.text;
        btn.onclick = () => {
          answers[q.id] = idx;
          currentQ++;
          if (currentQ < scale.questions.length) renderQuestion();
          else finishAssessment(scale, answers);
        };
        opts.appendChild(btn);
      });
    }
  }

  // 完成测评
  function finishAssessment(scale, answers) {
    const result = AssessmentEngine.score(scale, answers);
    AssessmentEngine.saveResult(scale.id, scale.title, result);
    const risk = RISK_LEVELS[result.riskLevel];
    let dimHtml = '';
    Object.keys(result.dimensionScores).forEach(d => {
      const rate = Math.round((result.dimensionScores[d] / result.dimensionMax[d]) * 100);
      dimHtml += `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>${d}</span><span>${rate}%</span></div><div class="progress"><div class="progress-bar" style="width:${rate}%;background:${rate>=60?'#52c41a':'#fa8c16'}"></div></div></div>`;
    });
    app.innerHTML = `
      <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> 测评结果</a></div>
      <div class="card" style="text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">${result.percentage >= 80 ? '🎉' : result.percentage >= 60 ? '👍' : '💪'}</div>
        <h3>测评完成！</h3>
        <div style="font-size:36px;font-weight:900;color:${risk.color};margin:12px 0;">${result.percentage}%</div>
        <span class="tag" style="background:${risk.color}20;color:${risk.color};font-size:14px;padding:4px 12px;">${risk.label}</span>
        <p style="margin-top:12px;">+20 积分已发放 ⭐</p>
      </div>
      <div class="page-title">📊 各维度得分</div>
      <div class="card">${dimHtml}</div>
      ${result.weakDimensions.length > 0 ? `<div class="card" style="background:#fff7e6;"><h3>💡 建议加强</h3><p>${result.weakDimensions.join('、')}方面需要重点关注</p></div>` : ''}
      <div style="padding:16px;">
        <a class="btn btn-primary btn-block" href="child.html">返回儿童端</a>
      </div>
    `;
  }

  // 游戏列表
  function renderGameList() {
    app.innerHTML = `<div class="page-title">🎮 AI 情景游戏</div><div class="page-subtitle">选择一个情景开始模拟体验</div>`;
    GameScenarios.forEach(g => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<h4 style="color:${g.color};">${g.icon} ${g.title}</h4><p>主题：${g.theme}</p>`;
      div.onclick = () => startGame(g);
      app.appendChild(div);
    });
  }

  // 开始游戏
  function startGame(game) {
    let currentNode = game.script.startNode;
    const history = [];
    renderNode();

    function renderNode() {
      const node = game.script.nodes[currentNode];
      history.push(node);
      const feedback = history.length > 1 && history[history.length - 2].lastFeedback ? history[history.length - 2].lastFeedback : null;

      let feedbackHtml = '';
      if (feedback) {
        feedbackHtml = `<div class="game-feedback ${feedback.type}">${feedback.text}</div>`;
      }

      if (node.terminal) {
        PointsManager.add(15, '完成游戏：' + game.title);
        app.innerHTML = `
          <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> ${game.title}</a></div>
          <div style="padding:16px;">
            ${feedbackHtml}
            <div class="game-scenario">${node.scenario}</div>
            <div class="card" style="text-align:center;background:#f6ffed;">
              <div style="font-size:36px;">🎉</div>
              <h3>游戏完成！</h3>
              <p>+15 积分已发放 ⭐</p>
            </div>
            <a class="btn btn-primary btn-block" href="child.html" style="margin-top:16px;">返回儿童端</a>
          </div>
        `;
        return;
      }

      app.innerHTML = `
        <div class="topbar"><a href="javascript:void(0)" onclick="location.reload()"><span class="back">←</span> ${game.title}</a></div>
        <div style="padding:16px;">
          ${feedbackHtml}
          <div class="game-scenario">${node.scenario}</div>
          <div style="font-size:15px;font-weight:700;margin-bottom:12px;">${node.prompt}</div>
          <div class="assessment-options" id="opts"></div>
        </div>
      `;
      const opts = document.getElementById('opts');
      node.choices.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'assessment-opt';
        btn.textContent = c.text;
        btn.onclick = () => {
          node.lastFeedback = { text: c.feedback, type: c.feedbackType || 'positive' };
          currentNode = c.next;
          renderNode();
        };
        opts.appendChild(btn);
      });
    }
  }

  // 积分
  function renderPoints() {
    const points = PointsManager.get();
    const ledger = PointsManager.getLedger();
    const ranking = PointsManager.getRanking();
    app.innerHTML = `
      <div class="page-title">⭐ 我的积分</div>
      <div class="card" style="text-align:center;">
        <div class="points-num">${points}</div>
        <p>当前积分余额</p>
      </div>
      <div class="page-title">🏆 班级排行榜</div>
    `;
    ranking.forEach((r, i) => {
      const div = document.createElement('div');
      div.className = 'rank-item';
      const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
      div.innerHTML = `<div class="rank-pos ${posClass}">${i + 1}</div><div style="flex:1;font-weight:600;">${r.name}</div><div style="color:var(--gold-dark);font-weight:700;">${r.points} 分</div>`;
      app.appendChild(div);
    });
    if (ledger.length > 0) {
      const title = document.createElement('div');
      title.className = 'page-title';
      title.textContent = '📋 积分流水';
      app.appendChild(title);
      ledger.slice(0, 10).forEach(l => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<h4>${l.amount > 0 ? '+' : ''}${l.amount} 积分</h4><p>${l.desc} · 余额 ${l.balance} · ${new Date(l.createdAt).toLocaleDateString('zh-CN')}</p>`;
        app.appendChild(div);
      });
    }
  }

  render();
})();
