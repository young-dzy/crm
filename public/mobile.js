'use strict';

(function () {
  const STORAGE_KEY = 'young_demo_state_v1';

  const ICONS = {
    inbox: '<path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M4 13l3.5 5h9L20 13M4 13h4l2 2h4l2-2h4"/>',
    bot: '<rect x="4" y="6" width="16" height="13" rx="3"/><path d="M12 3v3M9 11v2M15 11v2M8 15h8"/>',
    kanban: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
    brain: '<path d="M9.5 4a3.5 3.5 0 0 0-3.5 3.5c0 .5.1 1 .3 1.4A3.5 3.5 0 0 0 5 15.5 3.5 3.5 0 0 0 8.5 19H11V4H9.5ZM14.5 4A3.5 3.5 0 0 1 18 7.5c0 .5-.1 1-.3 1.4A3.5 3.5 0 0 1 19 15.5 3.5 3.5 0 0 1 15.5 19H13V4h1.5Z"/>',
    menu: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
    shield: '<path d="m12 3 8 3v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z"/>',
    play: '<polygon points="6 4 20 12 6 20 6 4"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    compass: '<circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  };

  function svg(name, size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtCny(cents) {
    return '¥' + (Number(cents || 0) / 100).toLocaleString('zh-CN');
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return window.createInitialDemoState();
  }

  let state = loadState();
  let mobileView = 'list';
  let activeKanbanStage = 'new';
  let sheetType = null;
  let toastTimer = null;

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function toast(msg) {
    document.querySelector('.toast')?.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.getElementById('mobile-app').appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2200);
  }

  function getRoute() {
    const h = window.location.hash || '#/app/inbox';
    return (h.startsWith('#') ? h.slice(1) : h) || '/app/inbox';
  }

  function navigate(path) {
    sheetType = null;
    if (path === '/app/inbox') mobileView = 'list';
    if (getRoute() !== path) {
      window.location.hash = '#' + path;
    } else {
      render();
    }
  }

  function renderInboxMobile() {
    if (mobileView === 'thread') {
      const conv = state.conversations.find((c) => c.id === state.activeConvId) || state.conversations[0];
      const ct = state.contacts.find((c) => c.id === conv?.contactId);
      return `
        <div class="thread-wrap">
          <div style="padding:10px 12px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;">
              <button class="btn sm ghost" id="m-back-list" style="padding:4px 6px;">${svg('back', 18)}</button>
              <div class="avatar-circle" style="width:32px;height:32px;font-size:12.5px;">${esc((ct?.name || '客')[0])}</div>
              <div style="min-width:0;">
                <div style="font-weight:650;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(ct?.name || '客户')}</div>
                <div class="small muted">${esc(conv.channel)} · ${conv.status === 'human' ? '人工接管' : 'AI 托管'}</div>
              </div>
            </div>
            <button class="btn sm" id="m-open-crm">${svg('user', 14)}<span>档案</span></button>
          </div>

          <div class="thread-scroll">
            ${conv.messages
              .map((m) => {
                if (m.type === 'handoff') {
                  return `<div class="card small muted" style="border-style:dashed;display:flex;gap:8px;align-items:flex-start;">${svg('shield', 15)}<span>${esc(m.text)}</span></div>`;
                }
                return `
                  <div class="msg ${m.type}">
                    <div class="bubble">${esc(m.text)}</div>
                    <div class="msg-sub">${esc(m.sender || '')} · ${esc(m.time)}</div>
                  </div>`;
              })
              .join('')}
          </div>

          <div class="composer">
            <div class="pills-row">
              <button class="pill ${state.composerMode === 'reply' ? 'active' : ''}" data-m-cmode="reply">回复客户</button>
              <button class="pill ${state.composerMode === 'note' ? 'active' : ''}" data-m-cmode="note">内部备注</button>
              <button class="pill" data-m-toggle-conv="${conv.id}">${conv.status === 'human' ? '恢复 AI' : '转人工'}</button>
            </div>
            <div class="composer-row">
              <input class="input" id="m-inbox-input" placeholder="${state.composerMode === 'note' ? '输入内部备注...' : '输入演示回复...'}" />
              <button class="btn primary" id="m-send-msg" style="padding:9px 12px;">${svg('send', 16)}</button>
            </div>
          </div>
        </div>
      `;
    }

    const q = (state.inboxSearch || '').trim().toLowerCase();
    const list = state.conversations.filter((c) => {
      const ct = state.contacts.find((x) => x.id === c.contactId);
      if (state.inboxFilter === 'unread' && !c.unread) return false;
      if (state.inboxFilter === 'human' && c.status !== 'human') return false;
      if (state.inboxFilter === 'ai' && c.status !== 'ai') return false;
      if (q && !(ct?.name + c.preview).toLowerCase().includes(q)) return false;
      return true;
    });

    return `
      <div class="search-wrap">
        ${svg('search', 15)}
        <input class="input" id="m-inbox-search" placeholder="搜索联系人或会话内容..." value="${esc(state.inboxSearch)}" />
      </div>
      <div class="pills-row">
        ${[
          ['all', '全部'],
          ['unread', '未读'],
          ['human', '人工接管'],
          ['ai', 'AI 托管'],
        ]
          .map(([k, l]) => `<button class="pill ${state.inboxFilter === k ? 'active' : ''}" data-m-filter="${k}">${l}</button>`)
          .join('')}
      </div>
      ${list
        .map((c) => {
          const ct = state.contacts.find((x) => x.id === c.contactId);
          return `
            <div class="conv-card" data-m-open-conv="${c.id}">
              <div class="avatar-circle">${esc((ct?.name || '客')[0])}</div>
              <div style="flex:1;min-width:0;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                  <strong style="font-size:14.5px;display:flex;align-items:center;gap:6px;">
                    ${esc(ct?.name || '客户')}
                    ${c.unread ? '<span style="width:7px;height:7px;border-radius:50%;background:var(--info-fg);display:inline-block;"></span>' : ''}
                  </strong>
                  <span class="small muted">${esc(c.time)}</span>
                </div>
                <div style="display:flex;gap:5px;margin-bottom:5px;">
                  <span class="badge">${esc(c.channel)}</span>
                  <span class="badge ${c.status === 'human' ? 'warning' : 'success'}">${c.status === 'human' ? '人工接管' : 'AI 托管'}</span>
                </div>
                <div class="small muted" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(c.preview)}</div>
              </div>
            </div>`;
        })
        .join('')}
    `;
  }

  function renderWorkbenchMobile() {
    return `
      <div class="pills-row">
        ${window.DEMO_SCENARIOS.map(
          (sc) => `<button class="pill ${state.activeScenarioId === sc.id ? 'active' : ''}" data-m-scenario="${sc.id}">${svg('play', 12)}<span>${esc(sc.title.split('：')[0])}</span></button>`
        ).join('')}
        <button class="pill ${state.outboundPaused ? 'active' : ''}" id="m-toggle-outbound">
          ${svg('shield', 12)}<span>${state.outboundPaused ? '已暂停外发' : '外发门禁'}</span>
        </button>
      </div>

      ${
        state.workbenchRuns.length === 0
          ? `
        <div class="card">
          <strong>医疗商机 Agent 移动工作台</strong>
          <p class="small muted" style="margin:6px 0 12px;">点击场景立即运行 PR #38 本体论校验或 PR #29 客户记忆闭环，也可在下方输入指令。</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${window.DEMO_SCENARIOS.map(
              (sc) => `<button class="btn" style="justify-content:flex-start;" data-m-scenario="${sc.id}">${svg('play', 14)}<span>${esc(sc.title)}</span></button>`
            ).join('')}
          </div>
        </div>`
          : state.workbenchRuns
              .map(
                (r) => `
            <div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span class="badge info">${esc(r.agent)}</span>
                <span class="small muted mono">${esc(r.time)}</span>
              </div>
              <div style="font-weight:600;margin-bottom:8px;">${esc(r.prompt)}</div>
              ${r.steps
                .map(
                  (st) => `
                <details style="border:1px solid var(--border);border-radius:10px;padding:8px 10px;margin-bottom:6px;">
                  <summary class="small" style="font-weight:600;cursor:pointer;">${esc(st.name)} · ${esc(st.status)}</summary>
                  <pre class="small mono" style="white-space:pre-wrap;margin:6px 0 0;">${esc(JSON.stringify(st.detail, null, 2))}</pre>
                </details>`
                )
                .join('')}
              ${
                r.evidence
                  ? `<div class="small" style="padding:10px;border-radius:10px;background:var(--elevated);margin-bottom:8px;">
                      <div style="display:flex;align-items:center;gap:6px;font-weight:600;">${svg('compass', 14)}<span>OntologyEvidence (${esc(r.evidence.ontologyVersion)})</span></div>
                      <div class="muted" style="margin-top:3px;">${esc(r.evidence.visibility)}</div>
                    </div>`
                  : ''
              }
              <div class="small" style="white-space:pre-line;line-height:1.55;">${esc(r.reply)}</div>
              ${
                r.proposal
                  ? `
                <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <span class="small" style="font-weight:600;">${esc(r.proposal.title)}</span>
                  ${
                    r.proposalState === 'pending'
                      ? `<div style="display:flex;gap:6px;flex-shrink:0;">
                           <button class="btn sm primary" data-m-prop="approve:${r.id}">批准</button>
                           <button class="btn sm" data-m-prop="reject:${r.id}">拒绝</button>
                         </div>`
                      : `<span class="badge ${r.proposalState === 'approved' ? 'success' : 'error'}">${r.proposalState === 'approved' ? '已批准' : '已拒绝'}</span>`
                  }
                </div>`
                  : ''
              }
            </div>`
              )
              .join('')
      }

      <div style="margin-top:auto;display:flex;gap:8px;">
        <input class="input" id="m-wb-input" placeholder="输入自然语言指令..." />
        <button class="btn primary" id="m-wb-run">运行</button>
      </div>
    `;
  }

  function renderKanbanMobile() {
    const items = state.leads.filter((l) => l.stage === activeKanbanStage);
    return `
      <div class="pills-row">
        ${window.DEMO_STAGES.map((s) => {
          const cnt = state.leads.filter((l) => l.stage === s.id).length;
          return `<button class="pill ${activeKanbanStage === s.id ? 'active' : ''}" data-m-stage="${s.id}">${esc(s.name)} (${cnt})</button>`;
        }).join('')}
      </div>
      ${items
        .map((l) => {
          const ct = state.contacts.find((c) => c.id === l.contactId);
          return `
            <div class="card">
              <div style="font-weight:650;margin-bottom:4px;">${esc(l.title)}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <strong style="font-size:16px;">${fmtCny(l.valueCents)}</strong>
                ${l.staleHours >= 48 ? `<span class="badge warning">停滞 ${l.staleHours}h</span>` : `<span class="badge">${esc(ct?.company || '')}</span>`}
              </div>
              <select class="select" data-m-lead-stage="${l.id}">
                ${window.DEMO_STAGES.map((s) => `<option value="${s.id}" ${l.stage === s.id ? 'selected' : ''}>阶段：${esc(s.name)}</option>`).join('')}
              </select>
            </div>`;
        })
        .join('')}
    `;
  }

  function renderMemoryMobile() {
    return `
      <div class="card">
        <strong style="font-size:14px;">组织级 AI 规则 (${state.orgRules.length})</strong>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
          ${state.orgRules
            .map(
              (r) => `
            <div style="padding:10px;border-radius:10px;background:var(--elevated);">
              <div style="font-weight:600;font-size:13px;">${esc(r.title)}</div>
              <div class="small muted" style="margin-top:2px;">${esc(r.body)}</div>
            </div>`
            )
            .join('')}
        </div>
      </div>

      ${state.contacts
        .map(
          (c) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong>${esc(c.name)} · <span class="muted small">${esc(c.company)}</span></strong>
            <span class="badge">${c.memories.length} 条</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${c.memories
              .map(
                (m) => `
              <div style="padding:9px 10px;border-radius:10px;border:1px solid var(--border);">
                <div class="small">${esc(m.text)}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                  <span class="badge ${m.status === 'confirmed' ? 'success' : 'warning'}">${m.status === 'confirmed' ? '已确认' : '待审核'}</span>
                  ${m.status === 'candidate' ? `<button class="btn sm primary" data-m-confirm="${c.id}:${m.id}">采纳</button>` : ''}
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>`
        )
        .join('')}
    `;
  }

  function renderFollowupsMobile(route) {
    const store = window.FollowupsDemoState;
    const db = store ? store.load() : null;
    if (!db) {
      return '<div class="card"><strong>跟进流程</strong></div>';
    }
    const detail = route.indexOf('/app/ai/followups/') === 0 ? route.slice('/app/ai/followups/'.length) : '';
    const pointer = detail ? db.pointers.find((item) => item.id === detail) : null;
    const intro = `
      <a class="btn sm primary" href="index.html#${esc(route || '/app/ai/followups')}">在桌面版打开</a>`;
    if (pointer) {
      const versions = db.versions.filter((item) => item.pointer_id === pointer.id);
      const graph = pointer.draft_graph || (versions.find((item) => item.id === pointer.active_version_id) || {}).graph;
      const nodes = (graph && graph.nodes) || [];
      const enrollments = db.enrollments.filter((item) => item.pointer_id === pointer.id);
      return `
        ${intro}
        <div class="card">
          <strong>${esc(pointer.name)}</strong>
          <div class="small muted" style="margin-top:6px;">状态 ${esc(pointer.status)} · 当前版本 ${(pointer.active_version_id || '—').slice(0, 8)}</div>
        </div>
        ${nodes
          .map(
            (node) => `
          <div class="card">
            <div class="small muted">${esc(node.type)}</div>
            <div style="font-weight:600;margin-top:2px;">${esc(node.label)}</div>
          </div>`
          )
          .join('')}
        ${enrollments
          .map((enrollment) => {
            const contact = db.contacts.find((item) => item.id === enrollment.contact_id);
            const same = enrollment.version_id === pointer.active_version_id;
            return `
            <div class="card">
              <strong>${esc(contact ? contact.name : '联系人')}</strong>
              <div class="small muted" style="margin-top:6px;">${esc(enrollment.status)} · ${(enrollment.version_id || '').slice(0, 8)} · ${same ? '当前版本' : '旧版本'}</div>
            </div>`;
          })
          .join('')}
        <button class="btn" data-m-nav="/app/ai/followups">返回流程列表</button>`;
    }
    return (
      intro +
      db.pointers
        .map(
          (item) => `
        <button class="card" data-m-nav="/app/ai/followups/${item.id}" style="text-align:left;width:100%;">
          <strong>${esc(item.name)}</strong>
          <div class="small muted" style="margin-top:6px;">${esc(item.status)} · 当前版本 ${(item.active_version_id || '尚无').slice(0, 8)}</div>
        </button>`
        )
        .join('')
    );
  }

  function renderGenericMobile(route) {
    if (route === '/app/tasks') {
      return state.tasks
        .map(
          (t) => `
        <div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <label style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" data-m-task="${t.id}" ${t.status === 'done' ? 'checked' : ''} />
            <div>
              <div style="font-weight:500;${t.status === 'done' ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${esc(t.title)}</div>
              <div class="small muted">${esc(t.dueLabel)}</div>
            </div>
          </label>
          <span class="badge ${t.status === 'done' ? 'success' : 'warning'}">${t.status === 'done' ? '已完成' : '待办'}</span>
        </div>`
        )
        .join('');
    }
    if (route === '/app/contacts') {
      return state.contacts
        .map(
          (c) => `
        <div class="card" style="display:flex;align-items:center;gap:12px;">
          <div class="avatar-circle">${esc(c.name[0])}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;">
              <strong>${esc(c.name)}</strong>
              <span class="badge info">${c.memories.length} 条记忆</span>
            </div>
            <div class="small muted" style="margin-top:2px;">${esc(c.company)} · ${esc(c.phone)}</div>
          </div>
        </div>`
        )
        .join('');
    }
    if (route === '/app/radar') {
      return state.leads
        .filter((l) => l.stage !== 'won' && l.staleHours >= 24)
        .map(
          (l) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;">
            <strong>${esc(l.title)}</strong>
            <span class="badge error">停滞 ${l.staleHours}h</span>
          </div>
          <div class="small muted" style="margin:6px 0 10px;">${fmtCny(l.valueCents)}</div>
          <button class="btn sm primary" data-m-nav="/app/inbox">前往收件箱处理</button>
        </div>`
        )
        .join('');
    }
    if (route === '/app/ai/evals') {
      return `
        <div class="card">
          <strong>PR #38 业务本体论与评测基准</strong>
          <div class="small muted" style="margin-top:6px;">44 题基准 · 280 组 PG15/PG17 双库门禁 · 综合 Judge 92/100 Pass</div>
        </div>
        <div class="card">
          <button class="btn primary" style="width:100%;" data-m-nav="/app/ai/workbench">在工作台实测本体论查询</button>
        </div>
      `;
    }
    return `
      <div class="card">
        <strong>演示概览</strong>
        <div class="small muted" style="margin-top:6px;">活跃商机 ${state.leads.length} 笔 · 会话 ${state.conversations.length} 个 · 待办 ${state.tasks.filter((t) => t.status !== 'done').length} 项</div>
      </div>
      <div class="card" style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn" data-m-nav="/app/tasks">查看跟进任务</button>
        <button class="btn" data-m-nav="/app/radar">查看风险雷达</button>
        <button class="btn" data-m-nav="/app/contacts">查看联系人</button>
        <button class="btn" data-m-nav="/app/ai/evals">查看本体论评测</button>
      </div>
    `;
  }

  function renderSheet() {
    if (!sheetType) return '';
    if (sheetType === 'crm') {
      const conv = state.conversations.find((c) => c.id === state.activeConvId) || state.conversations[0];
      const ct = state.contacts.find((c) => c.id === conv?.contactId);
      const lead = state.leads.find((l) => l.id === conv?.leadId);
      return `
        <div class="sheet-backdrop" id="sheet-backdrop">
          <div class="sheet">
            <div class="sheet-handle"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>${esc(ct?.name)} · 医院档案与记忆</strong>
              <button class="btn sm ghost" id="close-sheet">${svg('close', 16)}</button>
            </div>
            ${
              lead
                ? `<div class="card" style="background:var(--elevated);">
                     <div class="small muted">关联商机</div>
                     <div style="font-weight:600;margin-top:2px;">${esc(lead.title)} · ${fmtCny(lead.valueCents)}</div>
                   </div>`
                : ''
            }
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${(ct?.memories || [])
                .map(
                  (m) => `
                <div class="card">
                  <div class="small">${esc(m.text)}</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                    <span class="badge ${m.status === 'confirmed' ? 'success' : 'warning'}">${m.status === 'confirmed' ? '已确认' : '待审核'}</span>
                    ${m.status === 'candidate' ? `<button class="btn sm primary" data-m-confirm="${ct.id}:${m.id}">采纳</button>` : ''}
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="sheet-backdrop" id="sheet-backdrop">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong>全部功能模块</strong>
            <button class="btn sm ghost" id="close-sheet">${svg('close', 16)}</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <button class="btn" data-m-nav="/app">首页概览</button>
            <button class="btn" data-m-nav="/app/radar">风险雷达</button>
            <button class="btn" data-m-nav="/app/tasks">跟进任务</button>
            <button class="btn" data-m-nav="/app/contacts">联系人</button>
            <button class="btn" data-m-nav="/app/ai/evals">本体论评测</button>
            <button class="btn" data-m-nav="/app/ai/followups">跟进流程</button>
            <button class="btn" id="m-open-arch-sheet" type="button">${svg('file', 14)}<span>架构与介绍</span></button>
            <a class="btn" href="index.html#/app/inbox">${svg('monitor', 14)}<span>切换桌面版</span></a>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn" style="flex:1;" id="m-theme">${svg('sun', 14)}<span>${state.theme === 'dark' ? '浅色模式' : '深色模式'}</span></button>
            <button class="btn" style="flex:1;" id="m-reset">${svg('reset', 14)}<span>重置演示</span></button>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    document.documentElement.setAttribute('data-theme', state.theme === 'dark' ? 'dark' : 'light');
    const route = getRoute();
    const unread = state.conversations.reduce((s, c) => s + (c.unread || 0), 0);
    const pendingMem = state.contacts.reduce((s, c) => s + c.memories.filter((m) => m.status === 'candidate').length, 0);

    const titles = {
      '/app': '首页概览',
      '/app/inbox': '会话收件箱',
      '/app/ai/workbench': 'Agent 工作台',
      '/app/ai/memory': '客户记忆',
      '/app/ai/evals': '本体论评测',
      '/app/ai/followups': '跟进流程',
      '/app/kanban': '医疗设备商机',
      '/app/radar': '风险雷达',
      '/app/tasks': '跟进任务',
      '/app/contacts': '联系人',
    };

    const isFlush = route === '/app/inbox' && mobileView === 'thread';
    let bodyHtml = '';
    if (route === '/app/inbox') bodyHtml = renderInboxMobile();
    else if (route === '/app/ai/workbench') bodyHtml = renderWorkbenchMobile();
    else if (route === '/app/kanban') bodyHtml = renderKanbanMobile();
    else if (route === '/app/ai/memory') bodyHtml = renderMemoryMobile();
    else if (route === '/app/ai/followups' || route.indexOf('/app/ai/followups/') === 0) bodyHtml = renderFollowupsMobile(route);
    else bodyHtml = renderGenericMobile(route);

    document.getElementById('mobile-app').innerHTML = `
      <header class="m-header">
        <div class="m-header-left">
          <span style="width:26px;height:26px;border-radius:7px;background:#064e3b;display:grid;place-items:center;flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 64 64" aria-hidden="true"><path d="M14 16h9.5L32 28.5 40.5 16H50L35.8 35.5V48h-7.6V35.5L14 16Z" fill="#ecfdf5"/><circle cx="49" cy="15" r="4" fill="#22c55e"/></svg>
          </span>
          <span class="m-title">${esc(titles[route] || (route.indexOf('/app/ai/followups') === 0 ? '跟进流程' : '商机工作台'))}</span>
        </div>
        <div class="m-header-right">
          <button class="btn sm" id="m-open-arch" type="button">${svg('file', 13)}<span>架构</span></button>
          <a class="btn sm" href="index.html#${esc(route)}">${svg('monitor', 13)}<span>桌面版</span></a>
        </div>
      </header>
      <div class="m-demobar">${svg('shield', 12)}<span>young 的医疗器械演示 · 虚构数据 · 无真实外发</span></div>
      <main class="m-body ${isFlush ? 'flush' : ''}">${bodyHtml}</main>
      <nav class="m-tabbar">
        <button class="m-tab ${route === '/app/inbox' ? 'active' : ''}" data-m-nav="/app/inbox">
          <span class="m-tab-icon">${svg('inbox', 19)}</span><span>收件箱</span>
          ${unread > 0 ? `<span class="m-tab-badge">${unread}</span>` : ''}
        </button>
        <button class="m-tab ${route === '/app/ai/workbench' ? 'active' : ''}" data-m-nav="/app/ai/workbench">
          <span class="m-tab-icon">${svg('bot', 19)}</span><span>工作台</span>
        </button>
        <button class="m-tab ${route === '/app/kanban' ? 'active' : ''}" data-m-nav="/app/kanban">
          <span class="m-tab-icon">${svg('kanban', 19)}</span><span>漏斗</span>
        </button>
        <button class="m-tab ${route === '/app/ai/memory' ? 'active' : ''}" data-m-nav="/app/ai/memory">
          <span class="m-tab-icon">${svg('brain', 19)}</span><span>记忆</span>
          ${pendingMem > 0 ? `<span class="m-tab-badge">${pendingMem}</span>` : ''}
        </button>
        <button class="m-tab" id="m-more-btn">
          <span class="m-tab-icon">${svg('menu', 19)}</span><span>更多</span>
        </button>
      </nav>
      ${renderSheet()}
    `;

    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll('[data-m-nav]').forEach((el) => {
      el.onclick = () => navigate(el.dataset.mNav);
    });
    document.getElementById('m-more-btn').onclick = () => { sheetType = 'more'; render(); };
    document.getElementById('m-open-arch')?.addEventListener('click', () => {
      window.openProjectArchModal && window.openProjectArchModal('arch');
    });
    document.getElementById('m-open-arch-sheet')?.addEventListener('click', () => {
      sheetType = null;
      render();
      window.openProjectArchModal && window.openProjectArchModal('arch');
    });
    document.getElementById('close-sheet')?.addEventListener('click', () => { sheetType = null; render(); });
    document.getElementById('sheet-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'sheet-backdrop') { sheetType = null; render(); }
    });
    document.getElementById('m-theme')?.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      saveState();
      render();
    });
    document.getElementById('m-reset')?.addEventListener('click', () => {
      state = window.createInitialDemoState();
      sheetType = null;
      saveState();
      window.FollowupsDemoState?.reset();
      render();
      toast('已恢复初始演示数据');
    });

    // Inbox
    document.getElementById('m-inbox-search')?.addEventListener('input', (e) => {
      state.inboxSearch = e.target.value;
      render();
      const inp = document.getElementById('m-inbox-search');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    });
    document.querySelectorAll('[data-m-filter]').forEach((el) => {
      el.onclick = () => { state.inboxFilter = el.dataset.mFilter; render(); };
    });
    document.querySelectorAll('[data-m-open-conv]').forEach((el) => {
      el.onclick = () => {
        state.activeConvId = el.dataset.mOpenConv;
        const c = state.conversations.find((x) => x.id === state.activeConvId);
        if (c) c.unread = 0;
        mobileView = 'thread';
        saveState();
        render();
      };
    });
    document.getElementById('m-back-list')?.addEventListener('click', () => { mobileView = 'list'; render(); });
    document.getElementById('m-open-crm')?.addEventListener('click', () => { sheetType = 'crm'; render(); });

    document.querySelectorAll('[data-m-cmode]').forEach((el) => {
      el.onclick = () => { state.composerMode = el.dataset.mCmode; render(); };
    });
    document.querySelectorAll('[data-m-toggle-conv]').forEach((el) => {
      el.onclick = () => {
        const c = state.conversations.find((x) => x.id === el.dataset.mToggleConv);
        if (c) { c.status = c.status === 'human' ? 'ai' : 'human'; saveState(); render(); }
      };
    });
    document.getElementById('m-send-msg')?.addEventListener('click', () => {
      const inp = document.getElementById('m-inbox-input');
      const text = inp?.value.trim();
      if (!text) return;
      const c = state.conversations.find((x) => x.id === state.activeConvId);
      if (!c) return;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      c.messages.push({
        id: 'm-' + Date.now(),
        type: state.composerMode === 'note' ? 'note' : 'outbound',
        sender: state.composerMode === 'note' ? '内部备注' : 'young',
        text,
        time,
      });
      c.preview = text;
      c.time = time;
      saveState();
      render();
      toast('已发送演示消息');
    });

    // Workbench
    document.querySelectorAll('[data-m-scenario]').forEach((el) => {
      el.onclick = () => {
        const sc = window.DEMO_SCENARIOS.find((s) => s.id === el.dataset.mScenario) || window.DEMO_SCENARIOS[0];
        state.activeScenarioId = sc.id;
        state.workbenchRuns.unshift({
          id: 'run-' + Date.now(),
          agent: sc.agent,
          prompt: sc.prompt,
          time: '刚刚',
          steps: sc.steps,
          evidence: sc.evidence,
          reply: sc.reply,
          proposal: sc.proposal,
          proposalState: 'pending',
        });
        saveState();
        render();
        toast('已运行场景');
      };
    });
    document.getElementById('m-toggle-outbound')?.addEventListener('click', () => {
      state.outboundPaused = !state.outboundPaused;
      saveState();
      render();
    });
    document.getElementById('m-wb-run')?.addEventListener('click', () => {
      const text = document.getElementById('m-wb-input')?.value.trim();
      if (!text) return;
      state.workbenchRuns.unshift({
        id: 'run-' + Date.now(),
        agent: state.workbenchAgent,
        prompt: text,
        time: '刚刚',
        steps: [{ name: '1. ontology_check_answerable', status: 'full', detail: { query: text, role: 'ontology_reader' } }],
        evidence: { ontologyVersion: '1.0.0', visibility: '只读角色 ontology_reader' },
        reply: `已完成只读核验：「${text}」。当前演示环境共有 ${state.leads.length} 笔医疗商机，均受院方外发授权边界保护。`,
        proposal: null,
      });
      saveState();
      render();
    });
    document.querySelectorAll('[data-m-prop]').forEach((el) => {
      el.onclick = () => {
        const [act, id] = el.dataset.mProp.split(':');
        const r = state.workbenchRuns.find((x) => x.id === id);
        if (r) {
          r.proposalState = act === 'approve' ? 'approved' : 'rejected';
          saveState();
          render();
          toast(act === 'approve' ? '已批准写入' : '已拒绝提案');
        }
      };
    });

    // Kanban & Memory & Tasks
    document.querySelectorAll('[data-m-stage]').forEach((el) => {
      el.onclick = () => { activeKanbanStage = el.dataset.mStage; render(); };
    });
    document.querySelectorAll('[data-m-lead-stage]').forEach((el) => {
      el.onchange = () => {
        const l = state.leads.find((x) => x.id === el.dataset.mLeadStage);
        if (l) { l.stage = el.value; saveState(); render(); toast('已更新商机阶段'); }
      };
    });
    document.querySelectorAll('[data-m-confirm]').forEach((el) => {
      el.onclick = () => {
        const [cid, mid] = el.dataset.mConfirm.split(':');
        const ct = state.contacts.find((c) => c.id === cid);
        const m = ct?.memories.find((x) => x.id === mid);
        if (m) { m.status = 'confirmed'; m.source = '移动端确认 · 刚刚'; saveState(); render(); toast('已采纳记忆'); }
      };
    });
    document.querySelectorAll('[data-m-task]').forEach((el) => {
      el.onchange = () => {
        const t = state.tasks.find((x) => x.id === el.dataset.mTask);
        if (t) { t.status = el.checked ? 'done' : 'pending'; saveState(); render(); }
      };
    });
  }

  window.addEventListener('hashchange', render);
  if (!window.location.hash) window.location.hash = '#/app/inbox';
  render();
})();
