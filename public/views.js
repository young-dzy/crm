'use strict';

window.DemoViews = (function () {
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

  function renderHome(state) {
    const openLeads = state.leads.filter((l) => l.stage !== 'won');
    const totalPipeline = openLeads.reduce((s, l) => s + l.valueCents, 0);
    const pendingTasks = state.tasks.filter((t) => t.status !== 'done').length;
    const unreadConvs = state.conversations.reduce((s, c) => s + (c.unread || 0), 0);
    const pendingMem = state.contacts.reduce(
      (s, c) => s + c.memories.filter((m) => m.status === 'candidate').length,
      0
    );

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">工作台概览</h1>
          <p class="page-desc">汇总客户会话、商机进展、待办任务与 Agent 本体论/记忆治理状态。</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn" data-nav="/app/inbox">打开会话收件箱</button>
          <button class="btn" data-nav="/app/ai/followups">打开跟进流程</button>
          <button class="btn primary" data-nav="/app/ai/workbench">进入 Agent 工作台</button>
        </div>
      </div>

      <div class="grid-4" style="margin-bottom:18px;">
        <div class="card">
          <div class="small muted">进行中商机总额</div>
          <div class="kpi-val">${fmtCny(totalPipeline)}</div>
          <div class="small muted" style="margin-top:6px;">${openLeads.length} 笔活跃商机</div>
        </div>
        <div class="card">
          <div class="small muted">收件箱未读消息</div>
          <div class="kpi-val">${unreadConvs}</div>
          <div class="small muted" style="margin-top:6px;">含 2 个需人工接管会话</div>
        </div>
        <div class="card">
          <div class="small muted">待处理跟进任务</div>
          <div class="kpi-val">${pendingTasks}</div>
          <div class="small muted" style="margin-top:6px;">1 项已逾期</div>
        </div>
        <div class="card">
          <div class="small muted">待审核客户记忆</div>
          <div class="kpi-val">${pendingMem}</div>
          <div class="small muted" style="margin-top:6px;">PR #29 记忆闭环候选</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="margin:0;font-size:15px;">最近待跟进任务</h3>
            <button class="btn sm ghost" data-nav="/app/tasks">查看全部</button>
          </div>
          ${state.tasks
            .slice(0, 4)
            .map(
              (t) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
              <div>
                <div style="font-weight:500;${t.status === 'done' ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${esc(t.title)}</div>
                <div class="small muted">${esc(t.dueLabel)}</div>
              </div>
              <span class="badge ${t.status === 'done' ? 'success' : t.priority === 'urgent' ? 'error' : 'warning'}">
                ${t.status === 'done' ? '已完成' : t.priority === 'urgent' ? '紧急' : '待处理'}
              </span>
            </div>`
            )
            .join('')}
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="margin:0;font-size:15px;">最新架构能力亮点</h3>
            <button class="btn sm ghost" data-nav="/app/ai/evals">查看评测基准</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="padding:10px;border-radius:8px;background:var(--sidebar);border:1px solid var(--border);">
              <div style="font-weight:600;font-size:13px;">业务本体论语义层 (Ontology v1.0.0)</div>
              <div class="small muted" style="margin-top:2px;">先验口径校验 + 只读角色 <code>ontology_reader</code> 行列隔离，拒绝臆造 SQL 与越权写入。</div>
            </div>
            <div style="padding:10px;border-radius:8px;background:var(--sidebar);border:1px solid var(--border);">
              <div style="font-weight:600;font-size:13px;">客户记忆闭环 (Customer Memory Loop)</div>
              <div class="small muted" style="margin-top:2px;">自动提取会话约束与偏好，区分「待审候选」与「已确认记忆」，严格遵守外发同意边界。</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderInbox(state) {
    const q = (state.inboxSearch || '').trim().toLowerCase();
    const filtered = state.conversations.filter((c) => {
      const contact = state.contacts.find((x) => x.id === c.contactId);
      if (state.inboxFilter === 'unread' && !c.unread) return false;
      if (state.inboxFilter === 'ai' && c.status !== 'ai') return false;
      if (state.inboxFilter === 'human' && c.status !== 'human') return false;
      if (q) {
        const hay = `${contact?.name || ''} ${contact?.company || ''} ${c.preview}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const active = state.conversations.find((c) => c.id === state.activeConvId) || filtered[0] || state.conversations[0];
    const contact = state.contacts.find((x) => x.id === active?.contactId);
    const lead = state.leads.find((x) => x.id === active?.leadId);

    return `
      <div class="inbox-layout">
        <div class="inbox-list-col">
          <div class="inbox-list-head">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:650;font-size:14px;">会话收件箱</span>
              <span class="badge">${state.conversations.length} 个会话</span>
            </div>
            <input class="input" id="inbox-search" placeholder="搜索联系人、公司或消息..." value="${esc(state.inboxSearch)}" />
            <div class="filter-pills">
              ${[
                ['all', '全部'],
                ['unread', '未读'],
                ['human', '人工接管'],
                ['ai', 'AI 托管'],
              ]
                .map(
                  ([k, label]) =>
                    `<button class="pill-btn ${state.inboxFilter === k ? 'active' : ''}" data-inbox-filter="${k}">${label}</button>`
                )
                .join('')}
            </div>
          </div>
          <div class="conv-scroll">
            ${
              filtered.length === 0
                ? `<div class="muted small" style="padding:20px;text-align:center;">没有匹配的会话</div>`
                : filtered
                    .map((c) => {
                      const ct = state.contacts.find((x) => x.id === c.contactId);
                      const isActive = active && active.id === c.id;
                      return `
                        <div class="conv-item ${isActive ? 'active' : ''}" data-conv-id="${c.id}">
                          <div class="conv-top">
                            <span class="conv-name">
                              ${c.unread ? '<span class="unread-dot"></span>' : ''}
                              ${esc(ct?.name || '未知客户')}
                            </span>
                            <span class="small muted">${esc(c.time)}</span>
                          </div>
                          <div style="display:flex;gap:5px;margin-bottom:5px;">
                            <span class="badge outline">${esc(c.channel)}</span>
                            <span class="badge ${c.status === 'human' ? 'warning' : 'success'}">
                              ${c.status === 'human' ? '人工接管中' : 'AI 托管中'}
                            </span>
                          </div>
                          <div class="conv-preview">${esc(c.preview)}</div>
                        </div>`;
                    })
                    .join('')
            }
          </div>
        </div>

        <div class="inbox-thread-col">
          ${
            active
              ? `
            <div class="thread-header">
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <strong style="font-size:15px;">${esc(contact?.name)}</strong>
                  <span class="small muted">${esc(contact?.company || '')}</span>
                  <span class="badge outline">${esc(active.channel)}</span>
                </div>
                <div class="small muted" style="margin-top:2px;">${esc(contact?.phone || '')} · ${esc(contact?.email || '')}</div>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <button class="btn sm" data-action="toggle-conv-mode" data-conv="${active.id}">
                  ${active.status === 'human' ? '恢复 AI 托管' : '切换为人工接管'}
                </button>
                <button class="btn sm primary" data-nav="/app/ai/workbench">在工作台诊断</button>
              </div>
            </div>

            <div class="thread-messages" id="thread-scroll">
              ${active.messages
                .map((m) => {
                  if (m.type === 'handoff') {
                    return `
                      <div class="handoff-card">
                        <span>${esc(m.text)}</span>
                        <span class="small">${esc(m.time)}</span>
                      </div>`;
                  }
                  return `
                    <div class="msg-row ${m.type}">
                      <div class="msg-bubble">${esc(m.text)}</div>
                      <div class="msg-meta">
                        <span>${esc(m.sender || '')} · ${esc(m.time)}</span>
                        ${m.badge ? `<span class="badge info">${esc(m.badge)}</span>` : ''}
                      </div>
                    </div>`;
                })
                .join('')}
            </div>

            <div class="composer">
              <div class="composer-tabs">
                <div style="display:flex;gap:6px;">
                  <button class="pill-btn ${state.composerMode === 'reply' ? 'active' : ''}" data-composer-mode="reply">回复客户</button>
                  <button class="pill-btn ${state.composerMode === 'note' ? 'active' : ''}" data-composer-mode="note">内部备注</button>
                </div>
                <select class="select" id="tpl-picker" style="width:auto;padding:4px 8px;font-size:12px;">
                  <option value="">插入快速回复模板...</option>
                  ${state.templates.map((t) => `<option value="${esc(t.content)}">${esc(t.title)}</option>`).join('')}
                </select>
              </div>
              <div class="composer-box">
                <textarea class="textarea" id="inbox-input" rows="2" placeholder="${
                  state.composerMode === 'note' ? '输入团队内部备注（仅内部可见）...' : '输入演示回复消息（本地模拟，不会真实外发）...'
                }"></textarea>
                <button class="btn primary" id="send-inbox-msg">发送</button>
              </div>
            </div>
          `
              : `<div class="muted" style="margin:auto;">请选择左侧会话</div>`
          }
        </div>

        <div class="inbox-crm-col">
          ${
            contact
              ? `
            <div>
              <h4 class="panel-section-title">关联商机</h4>
              ${
                lead
                  ? `
                <div class="card" style="padding:12px;">
                  <div style="font-weight:600;font-size:13.5px;">${esc(lead.title)}</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                    <span style="font-weight:700;">${fmtCny(lead.valueCents)}</span>
                    <select class="select" data-lead-stage="${lead.id}" style="width:auto;padding:3px 8px;font-size:12px;">
                      ${window.DEMO_STAGES.map(
                        (s) => `<option value="${s.id}" ${lead.stage === s.id ? 'selected' : ''}>${esc(s.name)}</option>`
                      ).join('')}
                    </select>
                  </div>
                </div>`
                  : `<div class="small muted">暂无关联商机</div>`
              }
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <h4 class="panel-section-title" style="margin:0;">客户记忆 (${contact.memories.length})</h4>
                <button class="btn sm ghost" data-nav="/app/ai/memory">管理</button>
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${contact.memories
                  .map(
                    (m) => `
                  <div style="padding:9px 10px;border-radius:8px;border:1px solid var(--border);background:var(--sidebar);">
                    <div style="font-size:12.5px;line-height:1.45;">${esc(m.text)}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                      <span class="badge ${m.status === 'confirmed' ? 'success' : 'warning'}">
                        ${m.status === 'confirmed' ? '已确认记忆' : '待审核候选'}
                      </span>
                      ${
                        m.status === 'candidate'
                          ? `<button class="btn sm" data-confirm-mem="${contact.id}:${m.id}">确认</button>`
                          : ''
                      }
                    </div>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>

            <div>
              <h4 class="panel-section-title">快捷操作</h4>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <button class="btn sm" data-action="quick-task" data-contact="${contact.id}">+ 为该客户创建跟进任务</button>
                <button class="btn sm" data-nav="/app/kanban">在商机看板中查看</button>
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  function renderWorkbench(state) {
    const scenario = window.DEMO_SCENARIOS.find((s) => s.id === state.activeScenarioId) || window.DEMO_SCENARIOS[0];

    return `
      <div class="workbench-layout">
        <div class="workbench-main">
          <div class="workbench-topbar">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <strong>医疗商机 Agent 工作台</strong>
              <select class="select" id="wb-agent" style="width:auto;padding:4px 10px;font-size:12.5px;">
                ${['医疗商机诊断 Agent', '院方记忆整理 Agent', '大客户跟进 Agent', '渠道协同 Agent']
                  .map((a) => `<option ${state.workbenchAgent === a ? 'selected' : ''}>${a}</option>`)
                  .join('')}
              </select>
              <select class="select" id="wb-mode" style="width:auto;padding:4px 10px;font-size:12.5px;">
                <option value="controlled" ${state.workbenchMode === 'controlled' ? 'selected' : ''}>受控行动模式（需审批）</option>
                <option value="readonly" ${state.workbenchMode === 'readonly' ? 'selected' : ''}>只读调查模式</option>
              </select>
            </div>
            <div style="display:flex;gap:8px;">
              ${window.DEMO_SCENARIOS.map(
                (sc) => `
                <button class="btn sm ${state.activeScenarioId === sc.id ? 'primary' : ''}" data-run-scenario="${sc.id}">
                  运行：${esc(sc.title.split('：')[0])}
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="workbench-stream" id="wb-stream">
            ${
              state.workbenchRuns.length === 0
                ? `
              <div class="card" style="max-width:720px;margin:20px auto;">
                <h3 style="margin:0 0 8px;">选择一个内置场景或输入自然语言任务</h3>
                <p class="small muted" style="margin:0 0 14px;">工作台会演示医疗器械大客户经营的完整受控执行链路：语义口径校验（Ontology）→ 客户记忆读取 → 持久化 Trace → 人工审批提案。</p>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  ${window.DEMO_SCENARIOS.map(
                    (sc) => `<button class="btn" data-run-scenario="${sc.id}">▶ ${esc(sc.title)}</button>`
                  ).join('')}
                </div>
              </div>`
                : state.workbenchRuns
                    .map(
                      (run) => `
                  <div class="card" style="max-width:860px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span class="badge info">${esc(run.agent)}</span>
                        <strong>${esc(run.prompt)}</strong>
                      </div>
                      <span class="small muted mono">${esc(run.time)}</span>
                    </div>

                    ${run.steps
                      .map(
                        (st) => `
                      <details class="trace-step">
                        <summary>
                          <span>${esc(st.name)}</span>
                          <span class="badge success">${esc(st.status)}</span>
                        </summary>
                        <pre class="trace-pre">${esc(JSON.stringify(st.detail, null, 2))}</pre>
                      </details>`
                      )
                      .join('')}

                    ${
                      run.evidence
                        ? `
                      <details class="trace-step" open style="border-color:var(--border-strong);margin-top:10px;">
                        <summary>
                          <span>语义依据、范围与查询回执 (OntologyEvidence)</span>
                          <span class="badge ${run.evidence.status === 'full' ? 'success' : 'warning'}">${esc(run.evidence.status)}</span>
                        </summary>
                        <div class="small" style="margin-top:8px;display:grid;grid-template-columns:120px 1fr;gap:4px 10px;">
                          <span class="muted">定义版本：</span><span class="mono">${esc(run.evidence.ontologyVersion)}</span>
                          <span class="muted">查询范围：</span><span>${esc(run.evidence.scope)}</span>
                          <span class="muted">隔离与可见性：</span><span>${esc(run.evidence.visibility)}</span>
                          <span class="muted">语义关系：</span><span class="mono">${esc(run.evidence.relations)}</span>
                          <span class="muted">查询回执：</span><span class="mono">${esc(run.evidence.template)}</span>
                        </div>
                      </details>`
                        : ''
                    }

                    <div style="margin-top:12px;padding:12px;border-radius:8px;background:var(--sidebar);white-space:pre-line;font-size:13.5px;">
                      ${esc(run.reply)}
                    </div>

                    ${
                      run.proposal
                        ? `
                      <div style="margin-top:12px;padding:12px;border-radius:8px;border:1px solid var(--border-strong);background:var(--surface);">
                        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                          <div>
                            <div style="font-weight:600;">待审批提案：${esc(run.proposal.title)}</div>
                            <div class="small muted">${esc(run.proposal.summary)}</div>
                          </div>
                          <div style="display:flex;gap:6px;">
                            ${
                              run.proposalState === 'pending'
                                ? `<button class="btn sm primary" data-prop-action="approve" data-run-id="${run.id}">批准并写入 CRM</button>
                                   <button class="btn sm danger" data-prop-action="reject" data-run-id="${run.id}">拒绝</button>`
                                : run.proposalState === 'approved'
                                  ? `<span class="badge success">已批准写入</span>
                                     <button class="btn sm" data-prop-action="undo" data-run-id="${run.id}">撤销变更</button>`
                                  : `<span class="badge error">已拒绝</span>`
                            }
                          </div>
                        </div>
                      </div>`
                        : ''
                    }
                  </div>`
                    )
                    .join('')
            }
          </div>

          <div class="composer">
            <div class="composer-box">
              <input class="input" id="wb-prompt-input" placeholder="输入工作台指令，例如：检查本周未跟进的重点商机并生成回访任务..." />
              <button class="btn primary" id="wb-run-custom">运行 Agent</button>
            </div>
          </div>
        </div>

        <div class="workbench-side">
          <div>
            <h4 class="panel-section-title">Mission 方向与外发护栏</h4>
            <div class="card" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-weight:600;font-size:13px;">外发暂停开关</span>
                <button class="btn sm ${state.outboundPaused ? 'danger' : ''}" data-action="toggle-outbound">
                  ${state.outboundPaused ? '已暂停外发' : '允许审批后外发'}
                </button>
              </div>
              <div class="small muted">默认遵循「院方消息 ≠ 外发授权」边界，任何对客动作均需通过人工审批门禁。</div>
            </div>
          </div>

          <div>
            <h4 class="panel-section-title">活跃场景说明</h4>
            <div class="card" style="padding:12px;">
              <div style="font-weight:600;font-size:13px;">${esc(scenario.title)}</div>
              <div class="small muted" style="margin-top:6px;">${esc(scenario.prompt)}</div>
            </div>
          </div>

          <div>
            <h4 class="panel-section-title">数据库安全边界</h4>
            <div style="display:flex;flex-direction:column;gap:6px;" class="small">
              <div class="badge outline">角色：ontology_reader (只读)</div>
              <div class="badge outline">隔离：Postgres RLS + 列级授权</div>
              <div class="badge outline">事件序：fn_append_workbench_event 原子锁</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMemory(state) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">院方记忆与组织规则</h1>
          <p class="page-desc">PR #29 客户记忆闭环：管理医疗大客户经营约束，以及每家医院与关键联系人的已确认记忆和待审核候选。</p>
        </div>
      </div>

      <div class="card" style="margin-bottom:18px;">
        <h3 style="margin:0 0 12px;font-size:15px;">组织级 AI 规则 (org_memory_versions)</h3>
        <div class="grid-3">
          ${state.orgRules
            .map(
              (r) => `
            <div style="padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--sidebar);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <strong style="font-size:13px;">${esc(r.title)}</strong>
                <span class="badge success">生效中</span>
              </div>
              <div class="small muted" style="line-height:1.5;">${esc(r.body)}</div>
              <div class="small muted" style="margin-top:8px;">来源：${esc(r.source)}</div>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <h3 style="margin:0 0 12px;font-size:15px;">院方与联系人记忆审核</h3>
      <div class="grid-2">
        ${state.contacts
          .map(
            (c) => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <div>
                <strong>${esc(c.name)}</strong>
                <span class="small muted"> · ${esc(c.company)}</span>
              </div>
              <span class="badge">${c.memories.length} 条记忆</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${c.memories
                .map(
                  (m) => `
                <div style="padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--sidebar);">
                  <div style="font-size:13px;">${esc(m.text)}</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                    <span class="small muted">${esc(m.source)}</span>
                    <div style="display:flex;gap:6px;align-items:center;">
                      <span class="badge ${m.status === 'confirmed' ? 'success' : 'warning'}">
                        ${m.status === 'confirmed' ? '已确认' : '待审核候选'}
                      </span>
                      ${
                        m.status === 'candidate'
                          ? `<button class="btn sm primary" data-confirm-mem="${c.id}:${m.id}">采纳</button>
                             <button class="btn sm" data-reject-mem="${c.id}:${m.id}">忽略</button>`
                          : ''
                      }
                    </div>
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>`
          )
          .join('')}
      </div>
    `;
  }

  function renderEvals() {
    const terms = [
      { key: 'deal.stalled_high_value', label: '高价值停滞商机', def: 'value_cents >= 2000000 且超过 48h 无入站/推进事件' },
      { key: 'memory.confirmed_constraint', label: '已确认客户约束', def: '经人工或高置信度确认、写入 customer_memories 的联系/预算边界' },
      { key: 'consent.outbound_boundary', label: '外发同意边界', def: '入站消息不构成自动外发同意，需显式授权或审批通过' },
    ];
    const dims = [
      ['口径可回答性校验', 96],
      ['只读角色权限隔离', 100],
      ['院方记忆约束遵守', 94],
      ['工具调用参数准确性', 92],
      ['审批与可回滚提案', 98],
      ['外发同意边界守卫', 100],
      ['端到端交付完整度', 89],
    ];
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">业务本体论与评测基准</h1>
          <p class="page-desc">PR #38 语义层目录 (Catalog v1.0.0)、PG15/PG17 双库不变式与 7 维量化评测摘要。</p>
        </div>
        <button class="btn primary" data-nav="/app/ai/workbench">在工作台实测本体论查询</button>
      </div>

      <div class="grid-4" style="margin-bottom:18px;">
        <div class="card"><div class="small muted">本体论基准集</div><div class="kpi-val">44 题</div><div class="small muted">含独立 SQL Oracle 对照</div></div>
        <div class="card"><div class="small muted">双库不变式门禁</div><div class="kpi-val">280 组</div><div class="small muted">PG15 & PG17 同步验证</div></div>
        <div class="card"><div class="small muted">语义工具模块</div><div class="kpi-val">5 个</div><div class="small muted">search / check / query / describe</div></div>
        <div class="card"><div class="small muted">综合 Judge 评分</div><div class="kpi-val">92 / 100</div><div class="small muted">Pass · 零越权写库</div></div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 style="margin:0 0 12px;font-size:15px;">Semantic Catalog v1.0.0 核心口径</h3>
          ${terms
            .map(
              (t) => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border);">
              <div style="display:flex;justify-content:space-between;">
                <strong>${esc(t.label)}</strong>
                <code class="small mono muted">${esc(t.key)}</code>
              </div>
              <div class="small muted" style="margin-top:4px;">${esc(t.def)}</div>
            </div>`
            )
            .join('')}
        </div>

        <div class="card">
          <h3 style="margin:0 0 12px;font-size:15px;">7 维量化评测得分</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${dims
              .map(
                ([name, score]) => `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
                  <span>${esc(name)}</span>
                  <strong>${score}%</strong>
                </div>
                <div style="height:7px;border-radius:999px;background:var(--elevated);overflow:hidden;">
                  <div style="height:100%;width:${score}%;background:var(--accent);"></div>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderKanban(state) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">医疗设备商机看板</h1>
          <p class="page-desc">支持拖拽卡片或下拉切换阶段，体验医院设备商机从临床评估到招采审批的流转。</p>
        </div>
        <button class="btn primary" data-action="new-lead">+ 新建商机</button>
      </div>

      <div class="kanban-board">
        ${window.DEMO_STAGES.map((st) => {
          const items = state.leads.filter((l) => l.stage === st.id);
          const sum = items.reduce((s, l) => s + l.valueCents, 0);
          return `
            <div class="kanban-col" data-stage-drop="${st.id}">
              <div class="kanban-col-head">
                <span>${esc(st.name)} (${items.length})</span>
                <span class="small muted">${fmtCny(sum)}</span>
              </div>
              ${items
                .map((l) => {
                  const ct = state.contacts.find((c) => c.id === l.contactId);
                  return `
                    <div class="lead-card" draggable="true" data-lead-drag="${l.id}">
                      <div style="font-weight:600;font-size:13.5px;margin-bottom:6px;">${esc(l.title)}</div>
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="font-weight:700;">${fmtCny(l.valueCents)}</span>
                        ${l.staleHours >= 48 ? `<span class="badge warning">停滞 ${l.staleHours}h</span>` : `<span class="badge outline">${esc(ct?.company || '')}</span>`}
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                        <span class="small muted">${esc(ct?.name || '')}</span>
                        <select class="select" data-lead-stage="${l.id}" style="width:auto;padding:2px 6px;font-size:11.5px;">
                          ${window.DEMO_STAGES.map(
                            (opt) => `<option value="${opt.id}" ${l.stage === opt.id ? 'selected' : ''}>${esc(opt.name)}</option>`
                          ).join('')}
                        </select>
                      </div>
                    </div>`;
                })
                .join('')}
            </div>`;
        }).join('')}
      </div>
    `;
  }

  function renderContacts(state) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">医院联系人</h1>
          <p class="page-desc">医院与科室档案、来源渠道和关联客户记忆数量。</p>
        </div>
        <button class="btn primary" data-action="new-contact">+ 新建联系人</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>公司</th>
              <th>联系方式</th>
              <th>来源</th>
              <th>标签</th>
              <th>院方记忆</th>
            </tr>
          </thead>
          <tbody>
            ${state.contacts
              .map(
                (c) => `
              <tr>
                <td><strong>${esc(c.name)}</strong></td>
                <td>${esc(c.company)}</td>
                <td class="small"><div>${esc(c.phone)}</div><div class="muted">${esc(c.email)}</div></td>
                <td><span class="badge outline">${esc(c.source)}</span></td>
                <td>${c.tags.map((t) => `<span class="badge">${esc(t)}</span>`).join(' ')}</td>
                <td><span class="badge info">${c.memories.length} 条</span></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRadar(state) {
    const atRisk = state.leads.filter((l) => l.stage !== 'won' && l.staleHours >= 24);
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">风险雷达</h1>
          <p class="page-desc">识别超过 24 小时未推进的高价值医疗设备商机，优先处理招采窗口与临床评估风险。</p>
        </div>
      </div>
      <div class="grid-2">
        ${atRisk
          .map((l) => {
            const ct = state.contacts.find((c) => c.id === l.contactId);
            return `
              <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong>${esc(l.title)}</strong>
                  <span class="badge error">停滞 ${l.staleHours} 小时</span>
                </div>
                <div class="small muted" style="margin:6px 0 12px;">关键联系人：${esc(ct?.name)} · 金额：${fmtCny(l.valueCents)}</div>
                <div style="display:flex;gap:8px;">
                  <button class="btn sm primary" data-nav="/app/inbox">前往收件箱处理</button>
                  <button class="btn sm" data-nav="/app/ai/workbench">在工作台诊断</button>
                </div>
              </div>`;
          })
          .join('')}
      </div>
    `;
  }

  function renderTasks(state) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">跟进任务</h1>
          <p class="page-desc">支持切换完成状态或新建跟进待办。</p>
        </div>
        <button class="btn primary" data-action="new-task">+ 新建任务</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>状态</th>
              <th>任务标题</th>
              <th>截止时间</th>
              <th>优先级</th>
              <th>关联联系人</th>
            </tr>
          </thead>
          <tbody>
            ${state.tasks
              .map((t) => {
                const ct = state.contacts.find((c) => c.id === t.contactId);
                return `
                  <tr>
                    <td>
                      <input type="checkbox" data-toggle-task="${t.id}" ${t.status === 'done' ? 'checked' : ''} />
                    </td>
                    <td style="${t.status === 'done' ? 'text-decoration:line-through;color:var(--text-muted);' : 'font-weight:500;'}">${esc(t.title)}</td>
                    <td class="small muted">${esc(t.dueLabel)}</td>
                    <td><span class="badge ${t.priority === 'urgent' ? 'error' : t.priority === 'high' ? 'warning' : 'outline'}">${esc(t.priority)}</span></td>
                    <td>${esc(ct?.name || '—')}</td>
                  </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAgenda(state) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">日程预约</h1>
          <p class="page-desc">结合院方记忆中的联系时间窗安排临床访谈、招采答疑与现场评审。</p>
        </div>
      </div>
      <div class="grid-3">
        ${state.agenda
          .map(
            (a) => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span class="badge ${a.status === '已预约' ? 'success' : 'warning'}">${esc(a.status)}</span>
              <span class="small muted">${esc(a.owner)}</span>
            </div>
            <div style="font-weight:600;margin-bottom:6px;">${esc(a.title)}</div>
            <div class="small muted">${esc(a.time)}</div>
            <div class="small muted" style="margin-top:4px;">${esc(a.channel)}</div>
          </div>`
          )
          .join('')}
      </div>
    `;
  }

  function renderTemplates(state) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">快速回复模板</h1>
          <p class="page-desc">在会话收件箱中可直接下拉插入使用。</p>
        </div>
      </div>
      <div class="grid-3">
        ${state.templates
          .map(
            (t) => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <strong>${esc(t.title)}</strong>
              <span class="badge outline">${esc(t.category)}</span>
            </div>
            <div class="small muted" style="line-height:1.6;">${esc(t.content)}</div>
          </div>`
          )
          .join('')}
      </div>
    `;
  }

  function renderMetrics(state) {
    const won = state.leads.filter((l) => l.stage === 'won');
    const wonSum = won.reduce((s, l) => s + l.valueCents, 0);
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">指标分析</h1>
          <p class="page-desc">基于演示数据汇总的漏斗转化与响应效率。</p>
        </div>
      </div>
      <div class="grid-3">
        <div class="card"><div class="small muted">已成交金额</div><div class="kpi-val">${fmtCny(wonSum)}</div></div>
        <div class="card"><div class="small muted">平均首次响应</div><div class="kpi-val">1 分 12 秒</div></div>
        <div class="card"><div class="small muted">AI 记忆命中率</div><div class="kpi-val">94.2%</div></div>
      </div>
    `;
  }

  function renderSettings(state) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">工作区设置</h1>
          <p class="page-desc">管理外观主题、演示数据重置与当前演示环境边界说明。</p>
        </div>
      </div>
      <div class="card" style="max-width:620px;display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>界面主题</strong>
            <div class="small muted">支持 Neutral Aerada 浅色与深色模式切换</div>
          </div>
          <button class="btn" data-action="toggle-theme">${state.theme === 'dark' ? '切换为浅色' : '切换为深色'}</button>
        </div>
        <hr style="border:0;border-top:1px solid var(--border);margin:0;" />
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>重置演示数据</strong>
            <div class="small muted">清除本地浏览器中的修改记录，恢复初始虚构数据</div>
          </div>
          <button class="btn danger" data-action="reset-demo">恢复初始数据</button>
        </div>
      </div>
    `;
  }

  return {
    esc,
    render(route, state) {
      if (route === '/app/ai/followups' || route.indexOf('/app/ai/followups/') === 0) {
        return '<div id="followups-root" data-route="' + esc(route) + '"></div>';
      }
      switch (route) {
        case '/app':
          return renderHome(state);
        case '/app/inbox':
          return renderInbox(state);
        case '/app/ai/workbench':
          return renderWorkbench(state);
        case '/app/ai/memory':
          return renderMemory(state);
        case '/app/ai/evals':
          return renderEvals(state);
        case '/app/kanban':
          return renderKanban(state);
        case '/app/contacts':
          return renderContacts(state);
        case '/app/radar':
          return renderRadar(state);
        case '/app/tasks':
          return renderTasks(state);
        case '/app/agenda':
          return renderAgenda(state);
        case '/app/templates':
          return renderTemplates(state);
        case '/app/metrics':
          return renderMetrics(state);
        case '/app/settings':
          return renderSettings(state);
        default:
          return renderInbox(state);
      }
    },
  };
})();
