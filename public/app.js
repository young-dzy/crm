'use strict';

(function () {
  const STORAGE_KEY = 'young_demo_state_v1';

  const ICONS = {
    gauge: '<circle cx="12" cy="13" r="8"/><path d="M12 13l3.5-3.5M8.5 17h7"/>',
    robot: '<rect x="4" y="6" width="16" height="13" rx="3"/><path d="M12 3v3M9 11v2M15 11v2M8 15h8"/>',
    brain: '<path d="M9.5 4a3.5 3.5 0 0 0-3.5 3.5c0 .5.1 1 .3 1.4A3.5 3.5 0 0 0 5 15.5 3.5 3.5 0 0 0 8.5 19H11V4H9.5ZM14.5 4A3.5 3.5 0 0 1 18 7.5c0 .5-.1 1-.3 1.4A3.5 3.5 0 0 1 19 15.5 3.5 3.5 0 0 1 15.5 19H13V4h1.5Z"/>',
    scales: '<path d="M12 3v18M5 7h14M6 7l-2.5 6h5L6 7ZM18 7l-2.5 6h5L18 7ZM8 21h8"/>',
    inbox: '<path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M4 13l3.5 5h9L20 13M4 13h4l2 2h4l2-2h4"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l5-5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    kanban: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 10 0v2M16 6a2.5 2.5 0 0 1 0 5M21 20v-2a4 4 0 0 0-3-3.8"/>',
    tasks: '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    chart: '<path d="M4 20h16M7 16v-5M12 16V7M17 16v-8"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
    collapse: '<path d="M15 6l-6 6 6 6"/>',
    smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 18h.01"/>',
    flow: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 6h5a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H10"/>',
    shield: '<path d="m12 3 8 3v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z"/>',
  };

  function svg(name, size = 16) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return window.createInitialDemoState();
  }

  let state = loadState();
  let toastTimer = null;

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function toast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2600);
  }

  function getRoute() {
    const h = window.location.hash || '#/app/inbox';
    const path = h.startsWith('#') ? h.slice(1) : h;
    return path || '/app/inbox';
  }

  function navigate(path) {
    if (getRoute() !== path) {
      window.location.hash = '#' + path;
    } else {
      render();
    }
  }

  function getBadges() {
    return {
      unreadInbox: state.conversations.reduce((s, c) => s + (c.unread || 0), 0),
      radarCount: state.leads.filter((l) => l.stage !== 'won' && l.staleHours >= 24).length,
      openTasks: state.tasks.filter((t) => t.status !== 'done').length,
      pendingMemories: state.contacts.reduce((s, c) => s + c.memories.filter((m) => m.status === 'candidate').length, 0),
    };
  }

  function isFollowupsRoute(route) {
    return route === '/app/ai/followups' || route.indexOf('/app/ai/followups/') === 0;
  }

  function navIsActive(itemPath, route) {
    if (itemPath === '/app') return route === '/app';
    return route === itemPath || route.indexOf(itemPath + '/') === 0;
  }

  function getPageTitle(route) {
    if (isFollowupsRoute(route)) return '跟进流程';
    for (const g of window.DEMO_NAV_GROUPS) {
      for (const item of g.items) {
        if (item.path === route) return item.label;
      }
    }
    return '会话收件箱';
  }

  function mountFollowups() {
    const el = document.getElementById('followups-root');
    if (el && window.PiFollowupsDemo) window.PiFollowupsDemo.mount(el);
  }

  function openModal(title, bodyHtml, onSubmit) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <strong style="font-size:16px;">${window.DemoViews.esc(title)}</strong>
          <button class="btn sm ghost" id="modal-close">✕</button>
        </div>
        <div id="modal-body">${bodyHtml}</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
          <button class="btn" id="modal-cancel">取消</button>
          <button class="btn primary" id="modal-ok">确认</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelector('#modal-close').onclick = close;
    wrap.querySelector('#modal-cancel').onclick = close;
    wrap.onclick = (e) => { if (e.target === wrap) close(); };
    wrap.querySelector('#modal-ok').onclick = () => {
      if (onSubmit(wrap) !== false) close();
    };
  }

  function openCommandPalette() {
    const items = [];
    window.DEMO_NAV_GROUPS.forEach((g) => g.items.forEach((i) => items.push({ label: i.label, sub: g.label, path: i.path })));
    openModal(
      '快速跳转 (⌘K)',
      `<input class="input" id="cmd-q" placeholder="输入页面名称，如：收件箱、本体论、记忆、漏斗..." style="margin-bottom:10px;" />
       <div id="cmd-list" style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;">
         ${items.map((it) => `<button class="nav-item" data-cmd-path="${it.path}"><span>${window.DemoViews.esc(it.label)}</span><span class="small muted" style="margin-left:auto;">${window.DemoViews.esc(it.sub)}</span></button>`).join('')}
       </div>`,
      () => true
    );
    const qEl = document.getElementById('cmd-q');
    const listEl = document.getElementById('cmd-list');
    qEl?.focus();
    const bindCmd = () => {
      listEl.querySelectorAll('[data-cmd-path]').forEach((btn) => {
        btn.onclick = () => {
          document.querySelector('.modal-backdrop')?.remove();
          navigate(btn.dataset.cmdPath);
        };
      });
    };
    bindCmd();
    qEl?.addEventListener('input', () => {
      const val = qEl.value.trim().toLowerCase();
      const filtered = items.filter((it) => (it.label + it.sub).toLowerCase().includes(val));
      listEl.innerHTML = filtered
        .map((it) => `<button class="nav-item" data-cmd-path="${it.path}"><span>${window.DemoViews.esc(it.label)}</span><span class="small muted" style="margin-left:auto;">${window.DemoViews.esc(it.sub)}</span></button>`)
        .join('');
      bindCmd();
    });
  }

  function runScenario(scenarioId) {
    const sc = window.DEMO_SCENARIOS.find((s) => s.id === scenarioId) || window.DEMO_SCENARIOS[0];
    state.activeScenarioId = sc.id;
    state.workbenchAgent = sc.agent;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    state.workbenchRuns.unshift({
      id: 'run-' + Date.now(),
      agent: sc.agent,
      prompt: sc.prompt,
      time,
      steps: sc.steps,
      evidence: sc.evidence,
      reply: sc.reply,
      proposal: sc.proposal,
      proposalState: 'pending',
    });
    saveState();
    render();
    toast('已执行语义核验与受控 Agent 回合');
  }

  function runCustomPrompt(promptText) {
    const text = promptText.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    state.workbenchRuns.unshift({
      id: 'run-' + Date.now(),
      agent: state.workbenchAgent,
      prompt: text,
      time,
      steps: [
        { name: '1. ontology_check_answerable', status: 'full', detail: { query: text, ontologyVersion: '1.0.0', role: 'ontology_reader' } },
        { name: '2. memory_retrieve', status: 'ok', detail: { rulesLoaded: state.orgRules.length, contactsScanned: state.contacts.length } },
      ],
      evidence: {
        status: 'full',
        ontologyVersion: '1.0.0',
        scope: 'young 演示工作区 (0dae91cc)',
        visibility: '只读角色 ontology_reader',
        relations: 'crm_leads → contacts → customer_memories',
        template: 'custom_ad_hoc_readonly_v1 · 5 条（上限 50 条）',
      },
      reply: `已基于当前演示工作区的 5 位关键联系人与 ${state.leads.length} 笔医疗商机完成只读核验：\n- 指令：「${text}」\n- 当前共有 ${state.leads.filter((l) => l.staleHours >= 48).length} 笔高停滞商机需要重点人工跟进。\n- 所有外发建议均已受「院方消息 ≠ 外发授权」规则保护。`,
      proposal: null,
      proposalState: 'pending',
    });
    saveState();
    render();
  }

  function render(opts) {
    const force = !!(opts && opts.force);
    document.documentElement.setAttribute('data-theme', state.theme === 'dark' ? 'dark' : 'light');
    const route = getRoute();
    const followupsRoot = document.getElementById('followups-root');
    if (!force && followupsRoot && isFollowupsRoute(route) && followupsRoot.dataset.route === route) {
      document.querySelector('.sidebar')?.classList.toggle('collapsed', !!state.sidebarCollapsed);
      return;
    }
    const badges = getBadges();
    const isFlush = route === '/app/inbox' || route === '/app/ai/workbench' || isFollowupsRoute(route);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="shell">
        <aside class="sidebar ${state.sidebarCollapsed ? 'collapsed' : ''}">
          <div class="sidebar-header">
            <div class="brand">
              <div class="brand-mark">
                <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true"><path d="M14 16h9.5L32 28.5 40.5 16H50L35.8 35.5V48h-7.6V35.5L14 16Z" fill="#ecfdf5"/><circle cx="49" cy="15" r="4" fill="#22c55e"/></svg>
              </div>
              <span class="brand-text">商机工作台</span>
            </div>
            <button class="btn icon ghost" id="toggle-sidebar" title="折叠侧边栏">${svg('collapse', 15)}</button>
          </div>
          <nav class="sidebar-nav">
            ${window.DEMO_NAV_GROUPS.map(
              (g) => `
              <div class="nav-group">
                <div class="nav-group-label">${window.DemoViews.esc(g.label)}</div>
                ${g.items
                  .map((it) => {
                    const count = it.badgeKey ? badges[it.badgeKey] : 0;
                    const badgeHtml = it.badge
                      ? `<span class="nav-badge">${it.badge}</span>`
                      : count > 0
                        ? `<span class="nav-badge">${count}</span>`
                        : '';
                    return `
                      <button class="nav-item ${navIsActive(it.path, route) ? 'active' : ''}" data-nav="${it.path}">
                        ${svg(it.icon, 16)}
                        <span class="nav-label">${window.DemoViews.esc(it.label)}</span>
                        ${badgeHtml}
                      </button>`;
                  })
                  .join('')}
              </div>`
            ).join('')}
          </nav>
          <div class="sidebar-footer">
            <div class="small muted nav-label" style="padding:4px 8px;">young · 医疗器械 B2B 大客户经营</div>
          </div>
        </aside>

        <div class="main-col">
          <header class="topbar">
            <div class="topbar-left">
              <span class="workspace-pill">young · 演示工作区</span>
              <span class="divider-v"></span>
              <strong style="font-size:14px;">${window.DemoViews.esc(getPageTitle(route))}</strong>
            </div>
            <div class="topbar-right">
              <button class="btn sm" id="open-arch-intro" type="button">${svg('file', 14)} <span>架构与介绍</span></button>
              <a class="btn sm" href="mobile.html#${window.DemoViews.esc(route)}">${svg('smartphone', 14)} <span>手机端</span></a>
              <button class="btn sm" id="open-cmd">${svg('search', 14)} <span>搜索 ⌘K</span></button>
              <button class="btn icon" data-action="toggle-theme" title="切换深浅主题">${svg('sun', 15)}</button>
              <button class="btn sm" data-action="reset-demo">${svg('reset', 14)} <span>重置演示</span></button>
              <span class="badge outline">young · 管理员</span>
            </div>
          </header>
          <div class="demobar">
            ${svg('shield', 13)}<span>演示模式 · young 的医疗器械 B2B 商机工作台，纯静态运行，无真实模型调用或消息外发</span>
          </div>
          <main class="content ${isFlush ? 'flush' : ''}">
            ${window.DemoViews.render(route, state)}
          </main>
        </div>
      </div>
    `;

    bindEvents();
    mountFollowups();
  }

  function bindEvents() {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', () => navigate(el.dataset.nav));
    });

    const toggleSidebar = document.getElementById('toggle-sidebar');
    if (toggleSidebar) {
      toggleSidebar.onclick = () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        saveState();
        render();
      };
    }

    const openCmd = document.getElementById('open-cmd');
    if (openCmd) openCmd.onclick = openCommandPalette;

    const openArchIntro = document.getElementById('open-arch-intro');
    if (openArchIntro) openArchIntro.onclick = () => window.openProjectArchModal && window.openProjectArchModal('arch');

    document.querySelectorAll('[data-action="toggle-theme"]').forEach((el) => {
      el.onclick = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        saveState();
        render();
      };
    });

    document.querySelectorAll('[data-action="reset-demo"]').forEach((el) => {
      el.onclick = () => {
        state = window.createInitialDemoState();
        saveState();
        window.FollowupsDemoState?.reset();
        window.PiFollowupsDemo?.resetQueries();
        render({ force: true });
        toast('已恢复初始演示数据');
      };
    });

    // Inbox interactions
    const inboxSearch = document.getElementById('inbox-search');
    if (inboxSearch) {
      inboxSearch.oninput = (e) => {
        state.inboxSearch = e.target.value;
        render();
        const el = document.getElementById('inbox-search');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      };
    }

    document.querySelectorAll('[data-inbox-filter]').forEach((el) => {
      el.onclick = () => { state.inboxFilter = el.dataset.inboxFilter; render(); };
    });

    document.querySelectorAll('[data-conv-id]').forEach((el) => {
      el.onclick = () => {
        state.activeConvId = el.dataset.convId;
        const conv = state.conversations.find((c) => c.id === state.activeConvId);
        if (conv) conv.unread = 0;
        saveState();
        render();
      };
    });

    document.querySelectorAll('[data-composer-mode]').forEach((el) => {
      el.onclick = () => { state.composerMode = el.dataset.composerMode; render(); };
    });

    const tplPicker = document.getElementById('tpl-picker');
    if (tplPicker) {
      tplPicker.onchange = () => {
        const input = document.getElementById('inbox-input');
        if (input && tplPicker.value) {
          input.value = tplPicker.value;
          tplPicker.value = '';
          input.focus();
        }
      };
    }

    const sendBtn = document.getElementById('send-inbox-msg');
    if (sendBtn) {
      sendBtn.onclick = () => {
        const input = document.getElementById('inbox-input');
        const text = input?.value.trim();
        if (!text) return;
        const conv = state.conversations.find((c) => c.id === state.activeConvId);
        if (!conv) return;
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        conv.messages.push({
          id: 'msg-' + Date.now(),
          type: state.composerMode === 'note' ? 'note' : 'outbound',
          sender: state.composerMode === 'note' ? '内部备注（young）' : 'young（人工回复）',
          text,
          time,
        });
        conv.preview = text;
        conv.time = time;
        saveState();
        render();
        toast(state.composerMode === 'note' ? '已添加内部备注' : '已发送演示消息（无真实外发）');
      };
    }

    document.querySelectorAll('[data-action="toggle-conv-mode"]').forEach((el) => {
      el.onclick = () => {
        const conv = state.conversations.find((c) => c.id === el.dataset.conv);
        if (!conv) return;
        conv.status = conv.status === 'human' ? 'ai' : 'human';
        saveState();
        render();
        toast(conv.status === 'human' ? '已切换为人工接管' : '已恢复 AI 托管');
      };
    });

    // Memory confirm / reject
    document.querySelectorAll('[data-confirm-mem]').forEach((el) => {
      el.onclick = () => {
        const [cid, mid] = el.dataset.confirmMem.split(':');
        const ct = state.contacts.find((c) => c.id === cid);
        const mem = ct?.memories.find((m) => m.id === mid);
        if (mem) {
          mem.status = 'confirmed';
          mem.source = '人工审核确认 · 刚刚';
          saveState();
          render();
          toast('已采纳为正式客户记忆');
        }
      };
    });

    document.querySelectorAll('[data-reject-mem]').forEach((el) => {
      el.onclick = () => {
        const [cid, mid] = el.dataset.rejectMem.split(':');
        const ct = state.contacts.find((c) => c.id === cid);
        if (ct) {
          ct.memories = ct.memories.filter((m) => m.id !== mid);
          saveState();
          render();
          toast('已忽略该候选记忆');
        }
      };
    });

    // Lead stage changes & drag-drop
    document.querySelectorAll('[data-lead-stage]').forEach((el) => {
      el.onchange = () => {
        const lead = state.leads.find((l) => l.id === el.dataset.leadStage);
        if (lead) {
          lead.stage = el.value;
          saveState();
          render();
          toast('已更新商机阶段');
        }
      };
    });

    document.querySelectorAll('[data-lead-drag]').forEach((el) => {
      el.ondragstart = (ev) => ev.dataTransfer.setData('text/plain', el.dataset.leadDrag);
    });
    document.querySelectorAll('[data-stage-drop]').forEach((col) => {
      col.ondragover = (ev) => ev.preventDefault();
      col.ondrop = (ev) => {
        ev.preventDefault();
        const leadId = ev.dataTransfer.getData('text/plain');
        const lead = state.leads.find((l) => l.id === leadId);
        if (lead) {
          lead.stage = col.dataset.stageDrop;
          saveState();
          render();
          toast('已移动商机阶段');
        }
      };
    });

    // Workbench
    const wbAgent = document.getElementById('wb-agent');
    if (wbAgent) wbAgent.onchange = () => { state.workbenchAgent = wbAgent.value; saveState(); };
    const wbMode = document.getElementById('wb-mode');
    if (wbMode) wbMode.onchange = () => { state.workbenchMode = wbMode.value; saveState(); };

    document.querySelectorAll('[data-run-scenario]').forEach((el) => {
      el.onclick = () => runScenario(el.dataset.runScenario);
    });

    const wbRunCustom = document.getElementById('wb-run-custom');
    if (wbRunCustom) {
      wbRunCustom.onclick = () => {
        const inp = document.getElementById('wb-prompt-input');
        if (inp) runCustomPrompt(inp.value);
      };
    }

    document.querySelectorAll('[data-action="toggle-outbound"]').forEach((el) => {
      el.onclick = () => {
        state.outboundPaused = !state.outboundPaused;
        saveState();
        render();
        toast(state.outboundPaused ? '已暂停所有自动外发' : '已恢复审批后外发');
      };
    });

    document.querySelectorAll('[data-prop-action]').forEach((el) => {
      el.onclick = () => {
        const run = state.workbenchRuns.find((r) => r.id === el.dataset.runId);
        if (!run || !run.proposal) return;
        const act = el.dataset.propAction;
        if (act === 'approve') {
          run.proposalState = 'approved';
          if (run.proposal.actionType === 'create_tasks_batch') {
            run.proposal.tasksToAdd.forEach((t) => {
              state.tasks.unshift({ id: 't-prop-' + Date.now(), ...t, status: 'pending' });
            });
          } else if (run.proposal.actionType === 'confirm_memory') {
            const ct = state.contacts.find((c) => c.id === run.proposal.contactId);
            const mem = ct?.memories.find((m) => m.id === run.proposal.memoryId);
            if (mem) mem.status = 'confirmed';
          }
          toast('已批准提案并写入演示 CRM');
        } else if (act === 'reject') {
          run.proposalState = 'rejected';
          toast('已拒绝该提案');
        } else if (act === 'undo') {
          run.proposalState = 'pending';
          state.tasks = state.tasks.filter((t) => !String(t.id).startsWith('t-prop-'));
          toast('已撤销变更');
        }
        saveState();
        render();
      };
    });

    // Tasks
    document.querySelectorAll('[data-toggle-task]').forEach((el) => {
      el.onchange = () => {
        const task = state.tasks.find((t) => t.id === el.dataset.toggleTask);
        if (task) {
          task.status = el.checked ? 'done' : 'pending';
          saveState();
          render();
        }
      };
    });

    document.querySelectorAll('[data-action="new-task"], [data-action="quick-task"]').forEach((el) => {
      el.onclick = () => {
        const contactId = el.dataset.contact || state.contacts[0].id;
        openModal(
          '新建跟进任务',
          `<div style="display:flex;flex-direction:column;gap:10px;">
            <input class="input" id="m-task-title" placeholder="任务标题，例如：回访确认报价" />
            <input class="input" id="m-task-due" value="明天 14:30" />
          </div>`,
          () => {
            const title = document.getElementById('m-task-title').value.trim();
            if (!title) return false;
            state.tasks.unshift({
              id: 't-' + Date.now(),
              title,
              dueLabel: document.getElementById('m-task-due').value.trim() || '待定',
              priority: 'high',
              status: 'pending',
              contactId,
            });
            saveState();
            render();
            toast('已创建新任务');
          }
        );
      };
    });

    document.querySelectorAll('[data-action="new-lead"]').forEach((el) => {
      el.onclick = () => {
        openModal(
          '新建商机',
          `<div style="display:flex;flex-direction:column;gap:10px;">
            <input class="input" id="m-lead-title" placeholder="商机名称，例如：江海仁和医院 — 检验流水线扩容" />
            <input class="input" id="m-lead-val" type="number" value="18000" placeholder="金额（元）" />
          </div>`,
          () => {
            const title = document.getElementById('m-lead-title').value.trim();
            if (!title) return false;
            const yuan = Number(document.getElementById('m-lead-val').value || 0);
            state.leads.unshift({
              id: 'l-' + Date.now(),
              title,
              stage: 'new',
              valueCents: Math.round(yuan * 100),
              contactId: state.contacts[0].id,
              tags: ['待跟进'],
              staleHours: 0,
              owner: 'young',
            });
            saveState();
            render();
            toast('已新建商机');
          }
        );
      };
    });

    document.querySelectorAll('[data-action="new-contact"]').forEach((el) => {
      el.onclick = () => {
        openModal(
          '新建联系人',
          `<div style="display:flex;flex-direction:column;gap:10px;">
            <input class="input" id="m-ct-name" placeholder="姓名" />
            <input class="input" id="m-ct-company" placeholder="公司名称" />
            <input class="input" id="m-ct-phone" placeholder="手机号" />
          </div>`,
          () => {
            const name = document.getElementById('m-ct-name').value.trim();
            if (!name) return false;
            state.contacts.unshift({
              id: 'c-' + Date.now(),
              name,
              company: document.getElementById('m-ct-company').value.trim() || '演示医院',
              email: 'contact@example.test',
              phone: document.getElementById('m-ct-phone').value.trim() || '+86 138-0000-0000',
              source: '手动录入',
              tags: ['新客户'],
              memories: [],
            });
            saveState();
            render();
            toast('已添加联系人');
          }
        );
      };
    });
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
  });

  if (!window.location.hash) {
    window.location.hash = '#/app/inbox';
  }
  render();
})();
