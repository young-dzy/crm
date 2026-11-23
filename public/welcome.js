'use strict';

(function () {
  var STORAGE_KEY = 'young_demo_arch_intro_v2';
  var LEGACY_KEY = 'young_demo_intro_seen_v1';
  var STYLE_ID = 'crm-arch-modal-styles';
  var MODAL_ID = 'welcome-backdrop';

  var NODE_NOTES = {
    // Architecture nodes
    'arch-channels': {
      badge: '交互与渠道层',
      title: '多端会话入口与可恢复 SSE 事件流',
      body: '大客户经理在收件箱处理院方企业微信、经销商群与招采平台消息，在工作台以按序持久化的 SSE 事件流查看思考、工具调用与提案审批；断网重连按序号补读，绝不因页面刷新重跑任务。',
    },
    'arch-ontology': {
      badge: '语义与权限闸门',
      title: '业务本体论口径校验 + 租户只读隔离',
      body: '将 CRM 领域能力封装为强类型工具契约并在入口绑定组织与角色权限。查询先过本体论口径校验，底层走只读角色与行级安全隔离，拒绝臆造 SQL 与越权跨租户访问。',
    },
    'arch-queue': {
      badge: '异步编排',
      title: '落库入队 + Worker 租约防重入',
      body: '长耗时商机分析先落库生成 Run 再入队，由后台 Worker 凭租约领取执行，解耦 HTTP 请求生命周期，避免页面超时悬挂或并发 Worker 重复领取同一任务。',
    },
    'arch-runtime': {
      badge: '推理与交叉核验',
      title: 'Agent 执行内核 + 并行只读专家交叉核验',
      body: '对临床需求、设备交付可行性与招采资质合规性并行做只读分析，再交叉比对注册证、授权链与数据库字段。发现报价冲突或依据不足时主动挂起，把差异交由人工裁决。',
    },
    'arch-gate': {
      badge: '副作用安全闸门',
      title: '工具效果分级：只读直行 / 可逆写快照 / 外部动作必审',
      body: '把模型“建议做什么”和系统“实际做了什么”彻底分开：仅 6 个低敏感辅助字段允许带版本快照的可逆自动写，其余写操作与对客沟通一律生成待审提案，经人确认后执行。',
    },
    'arch-sql': {
      badge: '唯一事实源',
      title: 'PostgreSQL + RLS 权威业务事实',
      body: '医院、联系人、设备装机、商机阶段与合同以关系数据库为唯一事实真源并执行租户行级隔离；任何记忆或检索摘要都无权覆盖最新业务字段。',
    },
    'arch-mem0': {
      badge: '客户画像记忆',
      title: 'Mem0 + Outbox 确认式客户记忆',
      body: '沉淀客户价格敏感度、采购偏好与沟通禁忌：人工确认后在同事务写入本地事实与同步待办，夜间异步清洗去重；删除即刻在本地停读，杜绝过期偏好误导跟进。',
    },
    'arch-wiki': {
      badge: '分级知识库',
      title: 'WeKnora / LLM Wiki 可追溯产品与政策知识',
      body: '存放企业静态产品手册与报价政策，按角色分级授权检索范围，强制记录内容指纹、文档版本与原文锚点，自动屏蔽已下架政策，避免幻觉承诺折扣。',
    },
    'arch-eval': {
      badge: '可观测与回归',
      title: 'Langfuse 召回追踪 + 三层评测门禁',
      body: '追踪粗排/重排召回与冲突轨迹，结合“代码确定性断言 → LLM-as-a-Judge → 人工抽检”沉淀 Golden Case 回归集；改进只调提示、工具与召回，权限与外发红线永久锁定。',
    },
    // State machine nodes
    'fsm-queued': {
      badge: 'STATE · QUEUED',
      title: 'Queued（任务入队）',
      body: '创建接口完成租户与对象范围校验后先写 Run 记录与起始事件，再投递持久化队列，HTTP 立刻返回 runId。',
    },
    'fsm-running': {
      badge: 'STATE · RUNNING',
      title: 'Running（租约执行与交叉核验）',
      body: 'Worker 凭租约与旧状态条件领取任务，装配组织记忆、知识库与只读子专家进行多轮分析，每步映射为可回放产品事件。',
    },
    'fsm-autowrite': {
      badge: 'STATE · REVERSIBLE',
      title: 'Auto-Write（6 字段带快照可逆写）',
      body: '仅对标题、预计成交日等 6 个低敏字段放行自动写入，写前保存旧值快照与版本号，撤销时校验是否已被人工改写。',
    },
    'fsm-awaiting': {
      badge: 'STATE · HITL GATE',
      title: 'Awaiting Confirmation（挂起等待人工审批）',
      body: '遇到高敏感改库或对客消息，系统暂存 Action Proposal 并告知模型“未执行”，释放 Worker 等待销售或主管确认。',
    },
    'fsm-settling': {
      badge: 'STATE · CLAIM & SETTLE',
      title: 'Claimed → Settling（事务领取与结果结算）',
      body: '人工批准时先以数据库事务锁定 Run 与提案防重入，执行后再同事务写入执行观察并排入 resume 工单继续推理。',
    },
    'fsm-completed': {
      badge: 'TERMINAL · COMPLETED',
      title: 'Completed（满足业务验收）',
      body: '所有只读核验与已批准动作均已明确结算，产出带证据来源、缺失材料与下一步建议的结构化报告。',
    },
    'fsm-partial': {
      badge: 'SAFETY · PARTIAL',
      title: 'Partial / Needs Review（冲突或不确定写回停机）',
      body: '若报价与现行策略冲突、快照缺失，或动作执行后记账前崩溃（effect_may_have_completed），宁可停机人工核对，绝不盲目重放。',
    },
    'fsm-cancelled': {
      badge: 'SAFETY · CANCELLED',
      title: 'Cancelled（策略升版或紧急熔断）',
      body: '主管切换跟进策略版本或触发租户/单客紧急熔断时，立刻废止待执行提案并终止后续推理，已完成的写操作走独立补偿路径。',
    },
  };

  var HIGHLIGHTS = [
    {
      tag: '数据隔离与语义门禁',
      title: '业务本体论口径校验 + 租户行级隔离',
      pain: '大模型直查业务表易臆造 SQL 口径，且多租户与跨客户场景下存在越权读取风险。',
      design: '把 CRM 能力抽象为统一强类型工具契约，查询前先经业务本体论做先验口径核验，入口强制绑定组织租户与只读角色权限。',
      guard: '零自由 SQL 越权 · 全操作可审计',
    },
    {
      tag: '三源数据权威分层',
      title: 'SQL 事实源 / Mem0 客户画像 / WeKnora 知识库解耦',
      pain: '把实时装机记录、院方偏好与静态招采资质混进同一检索池，常导致旧资料覆盖新状态或引用过期注册证。',
      design: '数据库管业务真源；Mem0 沉淀经确认的院方画像（增量写入 + 夜间清洗 + 删除即刻失效）；WeKnora 存分级授权的设备与招采知识并绑定版本指纹与原文链接。',
      guard: '三源职责清晰 · 证据可溯源不串线',
    },
    {
      tag: '受控长任务与安全边界',
      title: '显式状态机 + 分级动作提案与防重入审批',
      pain: '长链路商机分析易因断网/重启丢进度；直接让模型对客或改库可能造成越权承诺与重复执行。',
      design: '任务落库入队由 Worker 凭租约推进，副作用分为只读、6 字段带快照可逆写、必审外部动作；批准用事务锁防重入，写回不确定宁可停在 partial 也不重放。',
      guard: '对客零越权 · 一键版本校验撤销',
    },
    {
      tag: '可观测与回归门禁',
      title: 'Langfuse 召回轨迹追踪 + 三层评测回归闭环',
      pain: '模型与上下文调优靠体感，假引用、注册证信息与商机事实冲突等 Bad Case 难以稳定复现与回归验证。',
      design: '用 Langfuse 追踪检索粗排/重排与并行核验冲突，构建「代码确定性断言 → LLM-as-a-Judge → 人工抽检」三层门禁并沉淀 Golden Case，安全边界永久锁定。',
      guard: '改优有回归基线 · 权限外发红线锁定',
    },
  ];

  var TECH_TAGS = [
    'Agent Runtime',
    'Ontology Semantic Layer',
    'PostgreSQL + RLS',
    'Mem0 + Outbox',
    'WeKnora / LLM Wiki',
    'SSE 可恢复事件流',
    'Langfuse + 3-Tier Eval',
  ];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      ':root {',
      '  --am-bg: #ffffff;',
      '  --am-canvas: #f7f8fa;',
      '  --am-elev: #f1f2f4;',
      '  --am-text: #1d1d1f;',
      '  --am-muted: #5b5b62;',
      '  --am-border: #e5e7eb;',
      '  --am-border-strong: #c8cbd0;',
      '  --am-primary-bg: #1d1d1f;',
      '  --am-primary-fg: #ffffff;',
      '  --am-brand: #15803d;',
      '  --am-brand-warm: #86efac;',
      '  --am-brand-soft: rgba(21, 128, 61, 0.12);',
      '  --am-brand-ring: rgba(21, 128, 61, 0.42);',
      '  --am-info: #375a78;',
      '  --am-info-soft: rgba(80, 110, 138, 0.12);',
      '  --am-ok: #35633b;',
      '  --am-ok-soft: rgba(94, 139, 98, 0.13);',
      '  --am-warn: #8c5514;',
      '  --am-warn-soft: rgba(156, 99, 33, 0.13);',
      '  --am-err: #9c3423;',
      '  --am-err-soft: rgba(169, 68, 49, 0.12);',
      '  --am-node-fill: #ffffff;',
      '  --am-plane-fill: #f9fafb;',
      '  --am-line: #8b93a0;',
      '}',
      '[data-theme="dark"] {',
      '  --am-bg: #18181b;',
      '  --am-canvas: #111113;',
      '  --am-elev: #222226;',
      '  --am-text: #f4f4f5;',
      '  --am-muted: #a8a8b3;',
      '  --am-border: #2c2c31;',
      '  --am-border-strong: #45454e;',
      '  --am-primary-bg: #f4f4f5;',
      '  --am-primary-fg: #111113;',
      '  --am-brand: #4ade80;',
      '  --am-brand-warm: #86efac;',
      '  --am-brand-soft: rgba(34, 197, 94, 0.18);',
      '  --am-brand-ring: rgba(74, 222, 128, 0.50);',
      '  --am-info: #93b8d9;',
      '  --am-info-soft: rgba(80, 110, 138, 0.24);',
      '  --am-ok: #93c497;',
      '  --am-ok-soft: rgba(94, 139, 98, 0.22);',
      '  --am-warn: #e5ad68;',
      '  --am-warn-soft: rgba(156, 99, 33, 0.24);',
      '  --am-err: #f09584;',
      '  --am-err-soft: rgba(169, 68, 49, 0.24);',
      '  --am-node-fill: #1e1e23;',
      '  --am-plane-fill: #141417;',
      '  --am-line: #767684;',
      '}',
      '.archm-backdrop {',
      '  position: fixed; inset: 0; z-index: 120; grid-template-columns: minmax(0, 1fr);',
      '  background: rgba(12, 12, 14, 0.56);',
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
      '  display: grid; place-items: center; padding: 18px;',
      '  animation: archmFadeIn 180ms ease-out;',
      '}',
      '@keyframes archmFadeIn { from { opacity: 0; } to { opacity: 1; } }',
      '.archm-dialog {',
      '  width: 100%; max-width: min(960px, 100%); min-width: 0; max-height: min(90dvh, 840px); box-sizing: border-box;',
      '  background: var(--am-bg); color: var(--am-text);',
      '  border: 1px solid var(--am-border); border-radius: 18px;',
      '  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.28);',
      '  display: flex; flex-direction: column; overflow: hidden;',
      '  font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif);',
      '}',
      '.archm-head {',
      '  padding: 18px 22px 14px; border-bottom: 1px solid var(--am-border);',
      '  display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;',
      '  background: linear-gradient(180deg, var(--am-brand-soft) 0%, transparent 100%);',
      '  flex-shrink: 0;',
      '}',
      '.archm-head-left { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }',
      '.archm-logo {',
      '  width: 40px; height: 40px; border-radius: 11px; background: #064e3b;',
      '  display: grid; place-items: center; flex-shrink: 0; margin-top: 1px;',
      '  box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.35);',
      '}',
      '.archm-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }',
      '.archm-title { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; }',
      '.archm-kicker {',
      '  font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px;',
      '  background: var(--am-brand-soft); color: var(--am-brand);',
      '  border: 1px solid var(--am-brand-ring); letter-spacing: 0.02em;',
      '}',
      '.archm-sub { margin: 5px 0 0; font-size: 13px; color: var(--am-muted); line-height: 1.5; }',
      '.archm-close {',
      '  width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--am-border);',
      '  background: var(--am-bg); color: var(--am-muted); cursor: pointer;',
      '  display: grid; place-items: center; flex-shrink: 0; font-size: 15px; transition: all 140ms;',
      '}',
      '.archm-close:hover { background: var(--am-elev); color: var(--am-text); }',
      '.archm-toolbar {',
      '  padding: 10px 22px; border-bottom: 1px solid var(--am-border);',
      '  display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;',
      '  background: var(--am-bg); flex-shrink: 0;',
      '}',
      '.archm-tabs { display: inline-flex; gap: 4px; padding: 3px; border-radius: 10px; background: var(--am-elev); }',
      '.archm-tab {',
      '  border: 0; background: transparent; color: var(--am-muted); cursor: pointer;',
      '  padding: 6px 13px; border-radius: 8px; font-size: 12.5px; font-weight: 600;',
      '  display: inline-flex; align-items: center; gap: 6px; transition: all 150ms; white-space: nowrap;',
      '}',
      '.archm-tab:hover { color: var(--am-text); }',
      '.archm-tab.active {',
      '  background: var(--am-bg); color: var(--am-text);',
      '  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.09), 0 0 0 1px var(--am-border);',
      '}',
      '.archm-tab-num { font-family: var(--font-mono, monospace); font-size: 11px; color: var(--am-brand); }',
      '.archm-filters { display: inline-flex; align-items: center; gap: 5px; flex-wrap: wrap; }',
      '.archm-pill {',
      '  border: 1px solid var(--am-border); background: var(--am-bg); color: var(--am-muted);',
      '  padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 550; cursor: pointer; transition: all 140ms;',
      '}',
      '.archm-pill:hover { color: var(--am-text); border-color: var(--am-border-strong); }',
      '.archm-pill.active { background: var(--am-brand-soft); color: var(--am-brand); border-color: var(--am-brand-ring); }',
      '.archm-hint { font-size: 11.5px; color: var(--am-muted); }',
      '.archm-body { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 22px 18px; background: var(--am-canvas); }',
      '.archm-svg-stage {',
      '  background: var(--am-bg); border: 1px solid var(--am-border); border-radius: 14px;',
      '  padding: 10px 12px; overflow-x: auto; -webkit-overflow-scrolling: touch;',
      '}',
      '.archm-svg { display: block; width: 100%; min-width: 680px; height: auto; user-select: none; }',
      '.archm-node { cursor: pointer; transition: opacity 180ms ease, filter 180ms ease; }',
      '.archm-node:hover .node-box { stroke: var(--am-brand); stroke-width: 2; }',
      '.archm-node.is-selected .node-box { stroke: var(--am-brand); stroke-width: 2.2; filter: drop-shadow(0 3px 10px var(--am-brand-soft)); }',
      '.archm-edge { transition: opacity 200ms ease; }',
      '.archm-dim { opacity: 0.18 !important; }',
      '.archm-callout {',
      '  margin-top: 12px; padding: 12px 15px; border-radius: 12px;',
      '  background: var(--am-bg); border: 1px solid var(--am-border);',
      '  border-left: 3px solid var(--am-brand);',
      '  display: flex; flex-direction: column; gap: 4px;',
      '}',
      '.archm-callout-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }',
      '.archm-callout-badge {',
      '  font-size: 10.5px; font-weight: 700; font-family: var(--font-mono, monospace);',
      '  padding: 2px 7px; border-radius: 6px; background: var(--am-brand-soft); color: var(--am-brand);',
      '}',
      '.archm-callout-title { font-size: 13.5px; font-weight: 650; color: var(--am-text); }',
      '.archm-callout-body { margin: 0; font-size: 12.5px; color: var(--am-muted); line-height: 1.62; }',
      '.archm-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }',
      '.archm-card {',
      '  background: var(--am-bg); border: 1px solid var(--am-border); border-radius: 14px;',
      '  padding: 15px 16px; display: flex; flex-direction: column; gap: 8px;',
      '}',
      '.archm-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }',
      '.archm-card-tag { font-size: 11px; font-weight: 650; color: var(--am-brand); background: var(--am-brand-soft); padding: 2px 8px; border-radius: 999px; }',
      '.archm-card-guard { font-size: 11px; font-weight: 600; color: var(--am-ok); background: var(--am-ok-soft); padding: 2px 8px; border-radius: 999px; }',
      '.archm-card h3 { margin: 0; font-size: 14.5px; font-weight: 650; line-height: 1.35; letter-spacing: -0.01em; }',
      '.archm-kv { margin: 0; font-size: 12.5px; color: var(--am-muted); line-height: 1.6; }',
      '.archm-kv strong { color: var(--am-text); font-weight: 600; }',
      '.archm-tech-strip {',
      '  margin-top: 12px; padding: 11px 14px; border-radius: 12px;',
      '  background: var(--am-bg); border: 1px solid var(--am-border);',
      '  display: flex; align-items: center; gap: 7px; flex-wrap: wrap;',
      '}',
      '.archm-tech-label { font-size: 11.5px; font-weight: 650; color: var(--am-muted); margin-right: 4px; }',
      '.archm-chip {',
      '  font-size: 11.5px; font-family: var(--font-mono, monospace); padding: 3px 8px;',
      '  border-radius: 7px; background: var(--am-elev); color: var(--am-text); border: 1px solid var(--am-border);',
      '}',
      '.archm-foot {',
      '  padding: 12px 22px; border-top: 1px solid var(--am-border); background: var(--am-bg);',
      '  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; flex-shrink: 0;',
      '}',
      '.archm-foot-note { font-size: 12px; color: var(--am-muted); display: flex; align-items: center; gap: 6px; }',
      '.archm-foot-actions { display: flex; align-items: center; gap: 8px; }',
      '.archm-btn {',
      '  display: inline-flex; align-items: center; justify-content: center; gap: 6px;',
      '  padding: 7px 14px; border-radius: 9px; font-size: 13px; font-weight: 600;',
      '  border: 1px solid var(--am-border); background: var(--am-bg); color: var(--am-text);',
      '  cursor: pointer; text-decoration: none; transition: all 140ms; line-height: 1.2;',
      '}',
      '.archm-btn:hover { background: var(--am-elev); }',
      '.archm-btn.primary { background: var(--am-primary-bg); color: var(--am-primary-fg); border-color: var(--am-primary-bg); }',
      '.archm-btn.primary:hover { opacity: 0.92; }',
      '@media (max-width: 720px) {',
      '  .archm-backdrop { padding: 8px; align-items: flex-end; grid-template-columns: minmax(0, 1fr); }',
      '  .archm-dialog { width: 100%; max-width: 100%; min-width: 0; max-height: 92dvh; border-radius: 16px; }',
      '  .archm-head { padding: 14px 14px 12px; gap: 10px; }',
      '  .archm-head-left { min-width: 0; }',
      '  .archm-title-row { align-items: flex-start; }',
      '  .archm-title { font-size: 16px; }',
      '  .archm-toolbar { padding: 8px 14px; align-items: stretch; flex-direction: column; }',
      '  .archm-tabs { display: grid; width: 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); }',
      '  .archm-tab { justify-content: center; padding: 6px 4px; font-size: 11.5px; white-space: normal; }',
      '  .archm-tab-num { display: none; }',
      '  .archm-hint { line-height: 1.5; }',
      '  .archm-body { padding: 12px 14px; overflow-x: hidden; }',
      '  .archm-svg-stage { max-width: 100%; }',
      '  .archm-grid { grid-template-columns: 1fr; }',
      '  .archm-foot { padding: 10px 14px; }',
      '  .archm-foot-note { display: none; }',
      '  .archm-foot-actions { width: 100%; }',
      '  .archm-foot-actions .archm-btn { flex: 1; }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function renderArchSvg() {
    return (
      '<svg class="archm-svg" viewBox="0 0 880 492" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="商机工作台系统设计架构图">' +
        '<defs>' +
          '<marker id="crm-arr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
            '<path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="var(--am-line)"/>' +
          '</marker>' +
          '<marker id="crm-arr-brand" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
            '<path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="var(--am-brand)"/>' +
          '</marker>' +
          '<marker id="crm-arr-ok" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
            '<path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="var(--am-ok)"/>' +
          '</marker>' +
        '</defs>' +

        /* Plane 1: Surface & Channels */
        '<rect x="14" y="10" width="852" height="84" rx="13" fill="var(--am-plane-fill)" stroke="var(--am-border)" stroke-width="1.2"/>' +
        '<text x="28" y="29" font-size="11" font-weight="700" fill="var(--am-muted)" letter-spacing="0.04em">01 · 交互与渠道层  SURFACE &amp; CHANNELS</text>' +
        '<g class="archm-node" data-node="arch-channels">' +
          '<rect class="node-box" x="28" y="38" width="256" height="46" rx="9" fill="var(--am-node-fill)" stroke="var(--am-border)" stroke-width="1.2"/>' +
          '<text x="42" y="57" font-size="12.5" font-weight="700" fill="var(--am-text)">院方与经销商消息入口</text>' +
          '<text x="42" y="74" font-size="11" fill="var(--am-muted)">多渠道沟通线程 · 随时人工接管</text>' +

          '<rect class="node-box" x="312" y="38" width="256" height="46" rx="9" fill="var(--am-node-fill)" stroke="var(--am-brand-ring)" stroke-width="1.3"/>' +
          '<text x="326" y="57" font-size="12.5" font-weight="700" fill="var(--am-text)">Agent 工作台 (可恢复 SSE 流)</text>' +
          '<text x="326" y="74" font-size="11" fill="var(--am-muted)">按序回放思考/工具事件 · 审批对客提案</text>' +

          '<rect class="node-box" x="596" y="38" width="256" height="46" rx="9" fill="var(--am-node-fill)" stroke="var(--am-border)" stroke-width="1.2"/>' +
          '<text x="610" y="57" font-size="12.5" font-weight="700" fill="var(--am-text)">医疗商机与跟进编排</text>' +
          '<text x="610" y="74" font-size="11" fill="var(--am-muted)">商机阶段 · 停滞风险雷达 · 策略版本</text>' +
        '</g>' +

        /* Connector P1 -> P2 (clean breathing room) */
        '<line x1="156" y1="94" x2="156" y2="127" stroke="var(--am-line)" stroke-width="1.4" marker-end="url(#crm-arr)"/>' +
        '<line x1="440" y1="94" x2="440" y2="127" stroke="var(--am-brand)" stroke-width="1.6" marker-end="url(#crm-arr-brand)"/>' +
        '<line x1="724" y1="94" x2="724" y2="127" stroke="var(--am-line)" stroke-width="1.4" marker-end="url(#crm-arr)"/>' +
        '<rect x="454" y="102" width="246" height="19" rx="9" fill="var(--am-bg)" stroke="var(--am-border)" stroke-width="0.9"/>' +
        '<text x="577" y="115" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--am-muted)">租户身份鉴权 + 精确客户/商机 Scope</text>' +

        /* Plane 2: Controlled Agent Harness */
        '<rect x="14" y="130" width="852" height="132" rx="13" fill="var(--am-brand-soft)" stroke="var(--am-brand-ring)" stroke-width="1.3"/>' +
        '<text x="28" y="150" font-size="11" font-weight="700" fill="var(--am-brand)" letter-spacing="0.04em">02 · 受控 AGENT HARNESS 与编排核心  CONTROLLED EXECUTION PLANE</text>' +

        '<g class="archm-node is-selected" data-node="arch-ontology">' +
          '<rect class="node-box" x="28" y="162" width="182" height="86" rx="10" fill="var(--am-node-fill)" stroke="var(--am-brand)" stroke-width="1.6"/>' +
          '<rect x="38" y="172" width="88" height="17" rx="5" fill="var(--am-brand-soft)"/>' +
          '<text x="45" y="184" font-size="10" font-weight="700" fill="var(--am-brand)">Ontology Gate</text>' +
          '<text x="38" y="206" font-size="12.5" font-weight="700" fill="var(--am-text)">业务本体论语义层</text>' +
          '<text x="38" y="223" font-size="10.8" fill="var(--am-muted)">先验口径核验 · 只读角色</text>' +
          '<text x="38" y="238" font-size="10.8" fill="var(--am-muted)">拦截臆造 SQL 与越权查询</text>' +
        '</g>' +

        '<line x1="210" y1="205" x2="233" y2="205" stroke="var(--am-brand)" stroke-width="1.5" marker-end="url(#crm-arr-brand)"/>' +

        '<g class="archm-node" data-node="arch-queue">' +
          '<rect class="node-box" x="236" y="162" width="186" height="86" rx="10" fill="var(--am-node-fill)" stroke="var(--am-border-strong)" stroke-width="1.2"/>' +
          '<rect x="246" y="172" width="84" height="17" rx="5" fill="var(--am-info-soft)"/>' +
          '<text x="253" y="184" font-size="10" font-weight="700" fill="var(--am-info)">Queue + Lease</text>' +
          '<text x="246" y="206" font-size="12.5" font-weight="700" fill="var(--am-text)">持久化队列与租约</text>' +
          '<text x="246" y="223" font-size="10.8" fill="var(--am-muted)">Run 先落库再入队执行</text>' +
          '<text x="246" y="238" font-size="10.8" fill="var(--am-muted)">超时租约校验 · 断网可续跑</text>' +
        '</g>' +

        '<line x1="422" y1="205" x2="445" y2="205" stroke="var(--am-brand)" stroke-width="1.5" marker-end="url(#crm-arr-brand)"/>' +

        '<g class="archm-node" data-node="arch-runtime">' +
          '<rect class="node-box" x="448" y="162" width="188" height="86" rx="10" fill="var(--am-node-fill)" stroke="var(--am-border-strong)" stroke-width="1.2"/>' +
          '<rect x="458" y="172" width="104" height="17" rx="5" fill="var(--am-info-soft)"/>' +
          '<text x="465" y="184" font-size="10" font-weight="700" fill="var(--am-info)">Agent + Specialists</text>' +
          '<text x="458" y="206" font-size="12.5" font-weight="700" fill="var(--am-text)">并行只读交叉核验</text>' +
          '<text x="458" y="223" font-size="10.8" fill="var(--am-muted)">临床 / 交付 / 招采资质比对</text>' +
          '<text x="458" y="238" font-size="10.8" fill="var(--am-muted)">发现证据冲突即挂起裁决</text>' +
        '</g>' +

        '<line x1="636" y1="205" x2="659" y2="205" stroke="var(--am-brand)" stroke-width="1.5" marker-end="url(#crm-arr-brand)"/>' +

        '<g class="archm-node" data-node="arch-gate">' +
          '<rect class="node-box" x="662" y="162" width="190" height="86" rx="10" fill="var(--am-node-fill)" stroke="var(--am-warn)" stroke-width="1.4"/>' +
          '<rect x="672" y="172" width="96" height="17" rx="5" fill="var(--am-warn-soft)"/>' +
          '<text x="679" y="184" font-size="10" font-weight="700" fill="var(--am-warn)">Effect Gate · HITL</text>' +
          '<text x="672" y="206" font-size="12.5" font-weight="700" fill="var(--am-text)">动作分级审批闸门</text>' +
          '<text x="672" y="223" font-size="10.8" fill="var(--am-muted)">6 低敏字段带快照可逆写</text>' +
          '<text x="672" y="238" font-size="10.8" fill="var(--am-muted)">对客与高敏写强走提案人审</text>' +
        '</g>' +

        /* Trust Boundary + clean connectors terminating at Plane 3 top edge */
        '<line x1="158" y1="262" x2="158" y2="294" stroke="var(--am-line)" stroke-width="1.4" marker-end="url(#crm-arr)"/>' +
        '<line x1="722" y1="262" x2="722" y2="294" stroke="var(--am-line)" stroke-width="1.4" marker-end="url(#crm-arr)"/>' +
        '<line x1="24" y1="278" x2="856" y2="278" stroke="var(--am-border-strong)" stroke-width="1.1" stroke-dasharray="5 4"/>' +
        '<rect x="288" y="268" width="304" height="20" rx="9" fill="var(--am-bg)" stroke="var(--am-border)" stroke-width="0.9"/>' +
        '<text x="440" y="281.5" text-anchor="middle" font-size="10.5" font-weight="650" fill="var(--am-muted)">三源权威边界（记忆与摘要绝不覆盖 SQL 真源）</text>' +

        /* Plane 3: Three Trusted Data Planes */
        '<rect x="14" y="297" width="852" height="100" rx="13" fill="var(--am-plane-fill)" stroke="var(--am-border)" stroke-width="1.2"/>' +
        '<text x="28" y="316" font-size="11" font-weight="700" fill="var(--am-muted)" letter-spacing="0.04em">03 · 可信数据与记忆面  AUTHORITATIVE DATA &amp; KNOWLEDGE PLANES</text>' +

        '<g class="archm-node" data-node="arch-sql">' +
          '<rect class="node-box" x="28" y="325" width="260" height="60" rx="10" fill="var(--am-node-fill)" stroke="var(--am-ok)" stroke-width="1.3"/>' +
          '<text x="42" y="345" font-size="12.5" font-weight="700" fill="var(--am-text)">PostgreSQL + RLS（权威真源）</text>' +
          '<text x="42" y="363" font-size="10.8" fill="var(--am-muted)">医院 · 装机 · 商机 · 合同 · 租户行级隔离</text>' +
          '<text x="42" y="377" font-size="10.2" font-weight="600" fill="var(--am-ok)">Single Source of Truth</text>' +
        '</g>' +

        '<g class="archm-node" data-node="arch-mem0">' +
          '<rect class="node-box" x="310" y="325" width="260" height="60" rx="10" fill="var(--am-node-fill)" stroke="var(--am-info)" stroke-width="1.3"/>' +
          '<text x="324" y="345" font-size="12.5" font-weight="700" fill="var(--am-text)">Mem0 + Outbox（客户画像记忆）</text>' +
          '<text x="324" y="363" font-size="10.8" fill="var(--am-muted)">偏好 · 价格敏感度 · 沟通禁忌 · 夜间清洗</text>' +
          '<text x="324" y="377" font-size="10.2" font-weight="600" fill="var(--am-info)">人工确认落库 · 删除即刻停读</text>' +
        '</g>' +

        '<g class="archm-node" data-node="arch-wiki">' +
          '<rect class="node-box" x="592" y="325" width="260" height="60" rx="10" fill="var(--am-node-fill)" stroke="var(--am-brand-ring)" stroke-width="1.3"/>' +
          '<text x="606" y="345" font-size="12.5" font-weight="700" fill="var(--am-text)">WeKnora / LLM Wiki（产品知识库）</text>' +
          '<text x="606" y="363" font-size="10.8" fill="var(--am-muted)">产品手册 · 报价政策 · 按角色白名单授权</text>' +
          '<text x="606" y="377" font-size="10.2" font-weight="600" fill="var(--am-brand)">版本指纹校验 · 摘要绑定原文</text>' +
        '</g>' +

        /* Connector P3 -> P4 */
        '<line x1="440" y1="397" x2="440" y2="416" stroke="var(--am-ok)" stroke-width="1.4" marker-end="url(#crm-arr-ok)"/>' +

        /* Plane 4: Observability & Eval Loop */
        '<g class="archm-node" data-node="arch-eval">' +
          '<rect class="node-box" x="14" y="419" width="852" height="62" rx="13" fill="var(--am-node-fill)" stroke="var(--am-ok)" stroke-width="1.3"/>' +
          '<text x="28" y="439" font-size="11" font-weight="700" fill="var(--am-ok)" letter-spacing="0.04em">04 · 可观测与三层评测回归闭环  LANGFUSE &amp; EVAL GATE</text>' +
          '<rect x="28" y="447" width="184" height="24" rx="6" fill="var(--am-elev)"/>' +
          '<text x="120" y="463" text-anchor="middle" font-size="11" font-weight="600" fill="var(--am-text)">Langfuse 粗排/重排追踪</text>' +
          '<line x1="214" y1="459" x2="238" y2="459" stroke="var(--am-ok)" stroke-width="1.4" marker-end="url(#crm-arr-ok)"/>' +
          '<rect x="242" y="447" width="166" height="24" rx="6" fill="var(--am-elev)"/>' +
          '<text x="325" y="463" text-anchor="middle" font-size="11" font-weight="600" fill="var(--am-text)">代码确定性规则断言</text>' +
          '<line x1="410" y1="459" x2="434" y2="459" stroke="var(--am-ok)" stroke-width="1.4" marker-end="url(#crm-arr-ok)"/>' +
          '<rect x="438" y="447" width="174" height="24" rx="6" fill="var(--am-elev)"/>' +
          '<text x="525" y="463" text-anchor="middle" font-size="11" font-weight="600" fill="var(--am-text)">LLM-as-a-Judge 语义审校</text>' +
          '<line x1="614" y1="459" x2="638" y2="459" stroke="var(--am-ok)" stroke-width="1.4" marker-end="url(#crm-arr-ok)"/>' +
          '<rect x="642" y="447" width="208" height="24" rx="6" fill="var(--am-ok-soft)"/>' +
          '<text x="746" y="463" text-anchor="middle" font-size="11" font-weight="700" fill="var(--am-ok)">Golden Case 回归 · 安全边界锁定</text>' +
        '</g>' +
      '</svg>'
    );
  }

  function renderFsmSvg() {
    return (
      '<svg class="archm-svg" viewBox="0 0 880 426" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="商机工作台持久化 Run 与动作提案状态机">' +
        '<defs>' +
          '<marker id="crm-fsm-ok" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
            '<path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="var(--am-ok)"/>' +
          '</marker>' +
          '<marker id="crm-fsm-warn" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
            '<path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="var(--am-warn)"/>' +
          '</marker>' +
          '<marker id="crm-fsm-err" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
            '<path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="var(--am-err)"/>' +
          '</marker>' +
        '</defs>' +

        /* EDGES FIRST */
        /* S1 -> S2 */
        '<g class="archm-edge" data-paths="main approval safety">' +
          '<line x1="170" y1="74" x2="218" y2="74" stroke="var(--am-ok)" stroke-width="1.8" marker-end="url(#crm-fsm-ok)"/>' +
          '<text x="194" y="65" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-ok)">租约领取</text>' +
        '</g>' +

        /* S2 -> S3 */
        '<g class="archm-edge" data-paths="main">' +
          '<line x1="398" y1="74" x2="452" y2="74" stroke="var(--am-ok)" stroke-width="1.8" marker-end="url(#crm-fsm-ok)"/>' +
          '<text x="425" y="65" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-ok)">可逆写</text>' +
        '</g>' +

        /* S3 -> S4 */
        '<g class="archm-edge" data-paths="main">' +
          '<line x1="636" y1="74" x2="684" y2="74" stroke="var(--am-ok)" stroke-width="1.8" marker-end="url(#crm-fsm-ok)"/>' +
          '<text x="660" y="65" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-ok)">验收集成</text>' +
        '</g>' +

        /* S2 -> S4 top arc (main readonly) */
        '<g class="archm-edge" data-paths="main">' +
          '<path d="M 310 40 C 310 10, 772 10, 772 38" fill="none" stroke="var(--am-ok)" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#crm-fsm-ok)"/>' +
          '<rect x="462" y="9" width="160" height="17" rx="8" fill="var(--am-bg)" stroke="var(--am-border)" stroke-width="0.8"/>' +
          '<text x="542" y="21" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-ok)">纯只读分析完成（直达终态）</text>' +
        '</g>' +

        /* S2 -> S5 (approval) */
        '<g class="archm-edge" data-paths="approval">' +
          '<line x1="274" y1="108" x2="274" y2="174" stroke="var(--am-warn)" stroke-width="1.8" marker-end="url(#crm-fsm-warn)"/>' +
          '<rect x="198" y="130" width="152" height="19" rx="8" fill="var(--am-bg)" stroke="var(--am-warn)" stroke-width="0.8"/>' +
          '<text x="274" y="143" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-warn)">对客/高敏动作生成提案</text>' +
        '</g>' +

        /* S5 -> S6 (approval) */
        '<g class="archm-edge" data-paths="approval">' +
          '<line x1="406" y1="212" x2="466" y2="212" stroke="var(--am-warn)" stroke-width="1.8" marker-end="url(#crm-fsm-warn)"/>' +
          '<text x="436" y="203" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-warn)">人工批准</text>' +
        '</g>' +

        /* S6 -> S2 resume loop (well separated from S2->S5 pill) */
        '<g class="archm-edge" data-paths="approval">' +
          '<path d="M 562 178 L 562 140 L 372 140 L 372 111" fill="none" stroke="var(--am-warn)" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#crm-fsm-warn)"/>' +
          '<rect x="410" y="130" width="144" height="19" rx="8" fill="var(--am-bg)" stroke="var(--am-warn)" stroke-width="0.8"/>' +
          '<text x="482" y="143" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-warn)">写入观察 + resume 续跑</text>' +
        '</g>' +

        /* S6 -> S4 (approval complete) */
        '<g class="archm-edge" data-paths="approval">' +
          '<path d="M 656 212 L 772 212 L 772 111" fill="none" stroke="var(--am-ok)" stroke-width="1.6" marker-end="url(#crm-fsm-ok)"/>' +
          '<rect x="708" y="152" width="128" height="19" rx="8" fill="var(--am-bg)" stroke="var(--am-border)" stroke-width="0.8"/>' +
          '<text x="772" y="165" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-ok)">提案全部结算完成</text>' +
        '</g>' +

        /* S2 -> S7 (safety conflict, clean left lane) */
        '<g class="archm-edge" data-paths="safety">' +
          '<path d="M 220 92 L 94 92 L 94 344 L 210 344" fill="none" stroke="var(--am-err)" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#crm-fsm-err)"/>' +
          '<rect x="24" y="204" width="140" height="20" rx="8" fill="var(--am-bg)" stroke="var(--am-err)" stroke-width="0.8"/>' +
          '<text x="94" y="217" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-err)">报价冲突 / 证据不足</text>' +
        '</g>' +

        /* S6 -> S7 (safety uncertain write) */
        '<g class="archm-edge" data-paths="safety">' +
          '<path d="M 526 246 L 526 276 L 332 276 L 332 307" fill="none" stroke="var(--am-err)" stroke-width="1.7" marker-end="url(#crm-fsm-err)"/>' +
          '<rect x="336" y="266" width="176" height="19" rx="8" fill="var(--am-bg)" stroke="var(--am-err)" stroke-width="0.8"/>' +
          '<text x="424" y="279" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-err)">写回不确定 · 绝不自动重试</text>' +
        '</g>' +

        /* S5 -> S8 (safety reject / kill-switch) */
        '<g class="archm-edge" data-paths="safety">' +
          '<path d="M 310 246 L 310 258 L 623 258 L 623 307" fill="none" stroke="var(--am-err)" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#crm-fsm-err)"/>' +
          '<rect x="556" y="266" width="136" height="19" rx="8" fill="var(--am-bg)" stroke="var(--am-err)" stroke-width="0.8"/>' +
          '<text x="624" y="279" text-anchor="middle" font-size="10" font-weight="600" fill="var(--am-err)">拒绝 / 策略升版熔断</text>' +
        '</g>' +

        /* NODES */
        '<g class="archm-node" data-node="fsm-queued" data-paths="main approval safety">' +
          '<rect class="node-box" x="20" y="42" width="148" height="64" rx="11" fill="var(--am-node-fill)" stroke="var(--am-border-strong)" stroke-width="1.4"/>' +
          '<text x="94" y="68" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-text)">Queued</text>' +
          '<text x="94" y="88" text-anchor="middle" font-size="10.8" fill="var(--am-muted)">落库入队 · 返回 runId</text>' +
        '</g>' +

        '<g class="archm-node is-selected" data-node="fsm-running" data-paths="main approval safety">' +
          '<rect class="node-box" x="222" y="42" width="174" height="64" rx="11" fill="var(--am-node-fill)" stroke="var(--am-brand)" stroke-width="1.8"/>' +
          '<text x="309" y="68" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-text)">Running</text>' +
          '<text x="309" y="88" text-anchor="middle" font-size="10.8" fill="var(--am-muted)">只读核验 · 事件流落盘</text>' +
        '</g>' +

        '<g class="archm-node" data-node="fsm-autowrite" data-paths="main">' +
          '<rect class="node-box" x="456" y="42" width="178" height="64" rx="11" fill="var(--am-node-fill)" stroke="var(--am-info)" stroke-width="1.4"/>' +
          '<text x="545" y="68" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-text)">Auto-Write</text>' +
          '<text x="545" y="88" text-anchor="middle" font-size="10.8" fill="var(--am-muted)">6 低敏字段 · 快照可撤销</text>' +
        '</g>' +

        '<g class="archm-node" data-node="fsm-completed" data-paths="main approval">' +
          '<rect class="node-box" x="688" y="42" width="168" height="64" rx="11" fill="var(--am-ok-soft)" stroke="var(--am-ok)" stroke-width="1.6"/>' +
          '<text x="772" y="68" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-ok)">Completed</text>' +
          '<text x="772" y="88" text-anchor="middle" font-size="10.8" fill="var(--am-text)">带来源报告 · 终态归档</text>' +
        '</g>' +

        '<g class="archm-node" data-node="fsm-awaiting" data-paths="approval safety">' +
          '<rect class="node-box" x="214" y="178" width="192" height="68" rx="11" fill="var(--am-warn-soft)" stroke="var(--am-warn)" stroke-width="1.6"/>' +
          '<text x="310" y="205" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-warn)">Awaiting Confirmation</text>' +
          '<text x="310" y="225" text-anchor="middle" font-size="10.8" fill="var(--am-text)">挂起等待确认 · 绝不直接外发</text>' +
        '</g>' +

        '<g class="archm-node" data-node="fsm-settling" data-paths="approval safety">' +
          '<rect class="node-box" x="470" y="178" width="186" height="68" rx="11" fill="var(--am-node-fill)" stroke="var(--am-warn)" stroke-width="1.5"/>' +
          '<text x="563" y="205" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-text)">Claimed → Settling</text>' +
          '<text x="563" y="225" text-anchor="middle" font-size="10.8" fill="var(--am-muted)">事务锁防重入 · 结算写观察</text>' +
        '</g>' +

        '<g class="archm-node" data-node="fsm-partial" data-paths="safety">' +
          '<rect class="node-box" x="214" y="310" width="236" height="68" rx="11" fill="var(--am-err-soft)" stroke="var(--am-err)" stroke-width="1.6"/>' +
          '<text x="332" y="337" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-err)">Partial / Needs Review</text>' +
          '<text x="332" y="357" text-anchor="middle" font-size="10.8" fill="var(--am-text)">保留差异与不确定态 · 交人工核对</text>' +
        '</g>' +

        '<g class="archm-node" data-node="fsm-cancelled" data-paths="safety">' +
          '<rect class="node-box" x="506" y="310" width="234" height="68" rx="11" fill="var(--am-node-fill)" stroke="var(--am-err)" stroke-width="1.4" stroke-dasharray="5 3"/>' +
          '<text x="623" y="337" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--am-text)">Cancelled / Circuit Open</text>' +
          '<text x="623" y="357" text-anchor="middle" font-size="10.8" fill="var(--am-muted)">终止待发草稿 · 已写字段独立补偿</text>' +
        '</g>' +

        /* Clean bottom legend bar */
        '<rect x="20" y="394" width="840" height="24" rx="7" fill="var(--am-plane-fill)" stroke="var(--am-border)" stroke-width="0.9"/>' +
        '<circle cx="40" cy="406" r="4" fill="var(--am-brand)"/>' +
        '<text x="50" y="410" font-size="10.5" font-weight="600" fill="var(--am-muted)">主执行链 (Queue → Running)</text>' +
        '<circle cx="242" cy="406" r="4" fill="var(--am-warn)"/>' +
        '<text x="252" y="410" font-size="10.5" font-weight="600" fill="var(--am-muted)">人审提案闭环 (HITL Gate)</text>' +
        '<circle cx="430" cy="406" r="4" fill="var(--am-err)"/>' +
        '<text x="440" y="410" font-size="10.5" font-weight="600" fill="var(--am-muted)">冲突停机 / 熔断兜底</text>' +
        '<circle cx="602" cy="406" r="4" fill="var(--am-ok)"/>' +
        '<text x="612" y="410" font-size="10.5" font-weight="600" fill="var(--am-muted)">验收归档终态</text>' +
        '<text x="848" y="410" text-anchor="end" font-size="10" fill="var(--am-muted)">点击任意状态查看边界</text>' +
      '</svg>'
    );
  }

  function renderHighlightsHtml() {
    return (
      '<div class="archm-grid">' +
        HIGHLIGHTS.map(function (h) {
          return (
            '<article class="archm-card">' +
              '<div class="archm-card-top">' +
                '<span class="archm-card-tag">' + h.tag + '</span>' +
                '<span class="archm-card-guard">' + h.guard + '</span>' +
              '</div>' +
              '<h3>' + h.title + '</h3>' +
              '<p class="archm-kv"><strong>痛点：</strong>' + h.pain + '</p>' +
              '<p class="archm-kv"><strong>设计：</strong>' + h.design + '</p>' +
            '</article>'
          );
        }).join('') +
      '</div>' +
      '<div class="archm-tech-strip">' +
        '<span class="archm-tech-label">架构组成</span>' +
        TECH_TAGS.map(function (t) { return '<span class="archm-chip">' + t + '</span>'; }).join('') +
      '</div>'
    );
  }

  function markSeen() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.setItem(LEGACY_KEY, '1');
    } catch (e) {}
  }

  function openModal(initialTab) {
    injectStyles();
    var existing = document.getElementById(MODAL_ID);
    if (existing) existing.remove();

    var activeTab = initialTab || 'arch';
    var activeFsmPath = 'all';
    var selectedNode = { arch: 'arch-ontology', fsm: 'fsm-running' };

    var wrap = document.createElement('div');
    wrap.className = 'archm-backdrop';
    wrap.id = MODAL_ID;
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'archm-title');

    function close() {
      markSeen();
      document.removeEventListener('keydown', onKey);
      wrap.remove();
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    function renderCallout(nodeId) {
      var info = NODE_NOTES[nodeId];
      if (!info) return '';
      return (
        '<div class="archm-callout">' +
          '<div class="archm-callout-head">' +
            '<span class="archm-callout-badge">' + info.badge + '</span>' +
            '<span class="archm-callout-title">' + info.title + '</span>' +
          '</div>' +
          '<p class="archm-callout-body">' + info.body + '</p>' +
        '</div>'
      );
    }

    function applyFsmFilter() {
      if (activeTab !== 'fsm') return;
      var nodes = wrap.querySelectorAll('.archm-svg [data-paths]');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (activeFsmPath === 'all') {
          el.classList.remove('archm-dim');
        } else {
          var paths = (el.getAttribute('data-paths') || '').split(/\s+/);
          if (paths.indexOf(activeFsmPath) >= 0) el.classList.remove('archm-dim');
          else el.classList.add('archm-dim');
        }
      }
    }

    function renderContent() {
      var toolbarRight = activeTab === 'fsm'
        ? '<div class="archm-filters">' +
            '<button class="archm-pill ' + (activeFsmPath === 'all' ? 'active' : '') + '" data-fsm-path="all" type="button">全部路径</button>' +
            '<button class="archm-pill ' + (activeFsmPath === 'main' ? 'active' : '') + '" data-fsm-path="main" type="button">只读 / 可逆写主链</button>' +
            '<button class="archm-pill ' + (activeFsmPath === 'approval' ? 'active' : '') + '" data-fsm-path="approval" type="button">人审提案闭环</button>' +
            '<button class="archm-pill ' + (activeFsmPath === 'safety' ? 'active' : '') + '" data-fsm-path="safety" type="button">冲突与熔断兜底</button>' +
          '</div>'
        : activeTab === 'arch'
          ? '<span class="archm-hint">点击图中任意架构模块，查看设计边界说明</span>'
          : '<span class="archm-hint">痛点 → 架构设计 → 工程保障（简历亮点同步）</span>';

      var bodyHtml = '';
      if (activeTab === 'arch') {
        bodyHtml = '<div class="archm-svg-stage">' + renderArchSvg() + '</div>' + renderCallout(selectedNode.arch);
      } else if (activeTab === 'fsm') {
        bodyHtml = '<div class="archm-svg-stage">' + renderFsmSvg() + '</div>' + renderCallout(selectedNode.fsm);
      } else {
        bodyHtml = renderHighlightsHtml();
      }

      wrap.innerHTML =
        '<div class="archm-dialog">' +
          '<header class="archm-head">' +
            '<div class="archm-head-left">' +
              '<div class="archm-logo" aria-hidden="true">' +
                '<svg width="24" height="24" viewBox="0 0 64 64"><path d="M14 16h9.5L32 28.5 40.5 16H50L35.8 35.5V48h-7.6V35.5L14 16Z" fill="#ecfdf5"/><circle cx="49" cy="15" r="4" fill="#22c55e"/></svg>' +
              '</div>' +
              '<div>' +
                '<div class="archm-title-row">' +
                  '<h2 class="archm-title" id="archm-title">young 的商机工作台 · 设计架构导览</h2>' +
                  '<span class="archm-kicker">医疗器械大客户经营 · 受控 Agent 架构</span>' +
                '</div>' +
                '<p class="archm-sub">以「数据库权威事实 + 分层记忆 + 业务本体论」约束 Agent 推理，通过异步状态机与分级动作提案守住对客与改库边界。</p>' +
              '</div>' +
            '</div>' +
            '<button class="archm-close" id="archm-close" type="button" aria-label="关闭">✕</button>' +
          '</header>' +

          '<div class="archm-toolbar">' +
            '<div class="archm-tabs" role="tablist">' +
              '<button class="archm-tab ' + (activeTab === 'arch' ? 'active' : '') + '" data-tab="arch" role="tab" type="button"><span class="archm-tab-num">01</span> 架构全景</button>' +
              '<button class="archm-tab ' + (activeTab === 'fsm' ? 'active' : '') + '" data-tab="fsm" role="tab" type="button"><span class="archm-tab-num">02</span> 核心状态机</button>' +
              '<button class="archm-tab ' + (activeTab === 'highlights' ? 'active' : '') + '" data-tab="highlights" role="tab" type="button"><span class="archm-tab-num">03</span> 核心架构亮点</button>' +
            '</div>' +
            toolbarRight +
          '</div>' +

          '<div class="archm-body">' + bodyHtml + '</div>' +

          '<footer class="archm-foot">' +
            '<div class="archm-foot-note">young · 医疗器械 B2B 大客户经营 · 纯静态演示环境，无真实外发</div>' +
            '<div class="archm-foot-actions">' +
              '<a class="archm-btn" href="about.html" id="archm-about">完整架构页</a>' +
              '<button class="archm-btn primary" id="archm-enter" type="button">进入交互演示</button>' +
            '</div>' +
          '</footer>' +
        '</div>';

      wrap.querySelector('#archm-close').onclick = close;
      wrap.querySelector('#archm-enter').onclick = close;
      wrap.querySelector('#archm-about').onclick = function () { markSeen(); };

      var tabBtns = wrap.querySelectorAll('[data-tab]');
      for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].onclick = function () {
          activeTab = this.getAttribute('data-tab');
          renderContent();
        };
      }

      var fsmBtns = wrap.querySelectorAll('[data-fsm-path]');
      for (var j = 0; j < fsmBtns.length; j++) {
        fsmBtns[j].onclick = function () {
          activeFsmPath = this.getAttribute('data-fsm-path');
          renderContent();
        };
      }

      var nodeEls = wrap.querySelectorAll('.archm-node[data-node]');
      var currentSel = activeTab === 'arch' ? selectedNode.arch : selectedNode.fsm;
      for (var k = 0; k < nodeEls.length; k++) {
        var el = nodeEls[k];
        if (el.getAttribute('data-node') === currentSel) el.classList.add('is-selected');
        else el.classList.remove('is-selected');
        el.onclick = function () {
          var id = this.getAttribute('data-node');
          if (activeTab === 'arch') selectedNode.arch = id;
          else if (activeTab === 'fsm') selectedNode.fsm = id;
          renderContent();
        };
      }

      applyFsmFilter();
    }

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) close();
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    renderContent();
  }

  window.openProjectArchModal = openModal;
  window.CrmArchDiagrams = {
    renderArchSvg: renderArchSvg,
    renderFsmSvg: renderFsmSvg,
  };

  function autoMount() {
    if (document.getElementById(MODAL_ID)) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch (e) {}
    if (window.location.pathname.indexOf('about') >= 0) return;
    openModal('arch');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})();
