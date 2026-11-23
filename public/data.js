'use strict';

window.DEMO_NAV_GROUPS = [
  {
    id: 'overview',
    label: '概览',
    items: [
      { path: '/app', label: '首页概览', icon: 'gauge' },
    ],
  },
  {
    id: 'ai',
    label: 'Agent 经营',
    items: [
      { path: '/app/ai/workbench', label: '医疗商机工作台', icon: 'robot', badge: 'Ontology' },
      { path: '/app/ai/followups', label: '跟进入口', icon: 'flow' },
      { path: '/app/ai/memory', label: '客户记忆与规则', icon: 'brain', badgeKey: 'pendingMemories' },
      { path: '/app/ai/evals', label: '本体论与评测基准', icon: 'scales' },
    ],
  },
  {
    id: 'service',
    label: '客户协同',
    items: [
      { path: '/app/inbox', label: '消息收件箱', icon: 'inbox', badgeKey: 'unreadInbox' },
      { path: '/app/radar', label: '商机风险雷达', icon: 'radar', badgeKey: 'radarCount' },
      { path: '/app/agenda', label: '临床日程', icon: 'calendar' },
      { path: '/app/templates', label: '资质与话术', icon: 'file' },
    ],
  },
  {
    id: 'sales',
    label: '大客户经营',
    items: [
      { path: '/app/kanban', label: '医疗设备商机', icon: 'kanban' },
      { path: '/app/contacts', label: '医院联系人', icon: 'users' },
      { path: '/app/tasks', label: '跟进任务', icon: 'tasks', badgeKey: 'openTasks' },
    ],
  },
  {
    id: 'system',
    label: '分析与设置',
    items: [
      { path: '/app/metrics', label: '指标分析', icon: 'chart' },
      { path: '/app/settings', label: '工作区设置', icon: 'settings' },
    ],
  },
];

window.DEMO_STAGES = [
  { id: 'new', name: '意向确认' },
  { id: 'contacted', name: '临床评估' },
  { id: 'proposal', name: '招采审批' },
  { id: 'won', name: '已中标' },
];

window.createInitialDemoState = function createInitialDemoState() {
  return {
    theme: 'light',
    sidebarCollapsed: false,
    activeConvId: 'conv-1',
    inboxFilter: 'all',
    inboxSearch: '',
    composerMode: 'reply',
    workbenchAgent: '医疗大客户商机 Agent',
    workbenchMode: 'controlled',
    outboundPaused: false,
    activeScenarioId: 'ontology-stalled',
    workbenchRuns: [],
    contacts: [
      {
        id: 'c-1',
        name: '林晓梅',
        company: '华澜区域医疗集团',
        email: 'lin.xiaomei@example.test',
        phone: '+86 138-0013-8001',
        source: '院方企业微信',
        tags: ['重点', '影像设备'],
        memories: [
          { id: 'm-1', text: '设备与临床联合评审安排在每周四下午，电话沟通仅限工作日 14:00 后，禁止机器人连续自动外呼', status: 'confirmed', source: '会话提取 · 2026-11-16' },
          { id: 'm-2', text: '3.0T 磁共振升级预算上限 ¥8,600,000，投标前必须提供 NMPA 注册证、UDI 与安装验收清单', status: 'confirmed', source: '人工确认 · 2026-11-17' },
          { id: 'm-3', text: '放射科希望在临床评估前补充低噪声成像与工作流演示方案', status: 'candidate', source: '待审核候选记忆 · 来自院方企业微信' },
        ],
      },
      {
        id: 'c-2',
        name: '陈伟',
        company: '康衡医疗器械供应链',
        email: 'chen.wei@example.test',
        phone: '+86 138-0013-8002',
        source: '经销商协同群',
        tags: ['渠道', '超声设备'],
        memories: [
          { id: 'm-4', text: '覆盖 6 家二级医院，投标时需由厂商提供项目级授权链与售后响应承诺', status: 'confirmed', source: '人工确认 · 2026-11-15' },
        ],
      },
      {
        id: 'c-3',
        name: '王芳',
        company: '江海仁和医院',
        email: 'wang.fang@example.test',
        phone: '+86 138-0013-8003',
        source: '招采平台答疑',
        tags: ['重点', '检验流水线'],
        memories: [
          { id: 'm-5', text: '检验科关注自动化流水线 TAT 与双机冗余，需提供同级别医院案例', status: 'confirmed', source: '会话提取 · 2026-11-14' },
          { id: 'm-6', text: '法务与招采联合审核约 5 个工作日，需提前准备注册证、授权书和 SLA 附件', status: 'candidate', source: '待审核候选记忆 · 来自招采答疑纪要' },
        ],
      },
      {
        id: 'c-4',
        name: '赵强',
        company: '云岭医科大学附属医院',
        email: 'zhao.qiang@example.test',
        phone: '+86 138-0013-8004',
        source: '设备科拜访纪要',
        tags: ['重点', '大型设备'],
        memories: [
          { id: 'm-7', text: '大型设备招标需先完成场地承重、供电、屏蔽与 EMC 检测资料评审', status: 'confirmed', source: '人工确认 · 2026-11-12' },
        ],
      },
      {
        id: 'c-5',
        name: '周敏',
        company: '安澜妇幼保健院',
        email: 'zhou.min@example.test',
        phone: '+86 138-0013-8005',
        source: '中标项目交接',
        tags: ['已中标', '监护设备'],
        memories: [
          { id: 'm-8', text: '已中标 18 台监护设备，计划下一季度扩展至分院区并追加中央站', status: 'confirmed', source: '合同归档 · 2026-11-10' },
        ],
      },
    ],
    leads: [
      { id: 'l-1', title: '林晓梅 — 3.0T 磁共振升级', stage: 'new', valueCents: 860000000, contactId: 'c-1', tags: ['待跟进'], staleHours: 4, owner: 'young' },
      { id: 'l-2', title: '陈伟 — 区域超声集采渠道项目', stage: 'contacted', valueCents: 420000000, contactId: 'c-2', tags: ['渠道协同'], staleHours: 18, owner: 'young' },
      { id: 'l-3', title: '王芳 — 检验流水线扩容', stage: 'proposal', valueCents: 520000000, contactId: 'c-3', tags: ['重点客户'], staleHours: 52, owner: 'young' },
      { id: 'l-4', title: '赵强 — 医用加速器配套项目', stage: 'proposal', valueCents: 1280000000, contactId: 'c-4', tags: ['重点客户'], staleHours: 76, owner: 'young' },
      { id: 'l-5', title: '周敏 — 分院区监护设备扩容', stage: 'won', valueCents: 180000000, contactId: 'c-5', tags: ['已中标'], staleHours: 0, owner: 'young' },
    ],
    tasks: [
      { id: 't-1', title: '回访林晓梅：确认 MRI 升级临床评估窗口', dueLabel: '已逾期 2 小时', priority: 'urgent', status: 'pending', contactId: 'c-1', leadId: 'l-1' },
      { id: 't-2', title: '补齐王芳的检验流水线招采资质包', dueLabel: '3 小时后到期', priority: 'high', status: 'in_progress', contactId: 'c-3', leadId: 'l-3' },
      { id: 't-3', title: '跟进赵强的大型设备场地与安装条件', dueLabel: '明天 18:00', priority: 'medium', status: 'pending', contactId: 'c-4', leadId: 'l-4' },
      { id: 't-4', title: '整理陈伟的区域项目授权链', dueLabel: '昨天已完成', priority: 'low', status: 'done', contactId: 'c-2', leadId: 'l-2' },
    ],
    conversations: [
      {
        id: 'conv-1',
        contactId: 'c-1',
        leadId: 'l-1',
        channel: '院方企业微信',
        status: 'human',
        unread: 1,
        time: '16:22',
        preview: '演示客户：请安排真人客户经理沟通，暂时不要让助手继续回复。',
        messages: [
          { id: 'msg-1', type: 'inbound', sender: '林晓梅', text: '我们计划下季度启动 3.0T 磁共振升级，想先确认 NMPA 注册证、UDI 和安装验收资料是否齐全。', time: '16:15' },
          { id: 'msg-2', type: 'outbound', sender: 'young 助手', text: '林老师您好，注册证、UDI 与安装验收清单可先提供电子版；临床演示安排会由大客户经理确认后再排期。', time: '16:16', badge: '引用知识库 · 影像设备投标资料 v3' },
          { id: 'msg-3', type: 'inbound', sender: '林晓梅', text: '我想让真人客户经理直接沟通，暂时不要让助手继续回复。另外仅工作日 14:00 后方便接电话。', time: '16:22' },
          { id: 'msg-4', type: 'handoff', text: '触发人工接管护栏：院方明确要求人工沟通，已自动静默助手回复并同步提取客户记忆候选。', time: '16:22' },
          { id: 'msg-5', type: 'note', sender: '系统记忆提示', text: '检测到院方约束：「仅工作日 14:00 后接听电话」「暂停助手自动回复」。已加入客户记忆并阻塞自动外发。', time: '16:22' },
        ],
      },
      {
        id: 'conv-2',
        contactId: 'c-3',
        leadId: 'l-3',
        channel: '招采平台答疑',
        status: 'ai',
        unread: 0,
        time: '14:05',
        preview: '请把 NMPA 注册证、授权书和售后 SLA 一并上传到招采答疑附件。',
        messages: [
          { id: 'msg-21', type: 'inbound', sender: '王芳', text: '检验流水线方案总体方向没问题，我们法务与招采联合审核大概需要 5 个工作日。', time: '13:58' },
          { id: 'msg-22', type: 'outbound', sender: 'young 销售助手', text: '收到王老师，我这边先整理 NMPA 注册证、项目授权书与售后 SLA，供法务和招采预审。', time: '14:00', badge: '读取已确认记忆 · 检验流水线双机冗余' },
          { id: 'msg-23', type: 'inbound', sender: '王芳', text: '好的，请把 NMPA 注册证、授权书和售后 SLA 一并上传到招采答疑附件。', time: '14:05' },
        ],
      },
      {
        id: 'conv-3',
        contactId: 'c-4',
        leadId: 'l-4',
        channel: '设备科沟通群',
        status: 'human',
        unread: 2,
        time: '昨天',
        preview: '本周要先评审场地承重、供电和屏蔽条件，请补充 EMC 检测资料。',
        messages: [
          { id: 'msg-31', type: 'inbound', sender: '赵强', text: '配套项目已进入院内论证，但设备科本周要先评审场地承重、供电和屏蔽条件，请补充 EMC 检测资料。', time: '昨天 17:40' },
          { id: 'msg-32', type: 'note', sender: 'Agent 诊断建议', text: '该商机金额 ¥12,800,000 且停滞超过 72 小时，建议附带注册证、EMC 报告、场地条件清单与安装验收流程进行人工回访。', time: '昨天 17:42' },
        ],
      },
      {
        id: 'conv-4',
        contactId: 'c-2',
        leadId: 'l-2',
        channel: '经销商协同群',
        status: 'ai',
        unread: 0,
        time: '11-16',
        preview: '6 家医院的投标授权材料我已经转给商务同事了。',
        messages: [
          { id: 'msg-41', type: 'inbound', sender: '陈伟', text: '6 家医院的投标授权材料已经转给商务同事，周四反馈项目级授权链是否齐全。', time: '11-16 11:20' },
          { id: 'msg-42', type: 'outbound', sender: 'young 助手', text: '收到陈总，已登记周四跟进提醒，并同步准备厂商授权书模板与售后响应承诺。', time: '11-16 11:21' },
        ],
      },
    ],
    templates: [
      { id: 'tpl-1', title: '3.0T MRI 资质与验收资料清单', category: '招标资质', content: '可先提供 NMPA 注册证、UDI 信息、授权链、装机验收清单与同级别医院案例，具体配置和价格以正式投标文件为准。' },
      { id: 'tpl-2', title: '检验流水线招采合规材料', category: '法务合规', content: '随附 NMPA 注册证、项目授权书、数据接口说明与售后 SLA，供医院法务和招采部门联合预审。' },
      { id: 'tpl-3', title: '临床评估后人工回访', category: '大客户跟进', content: '您好，我是负责贵院的客户经理。想确认临床评估反馈，并核对招采时间窗与场地准备情况，请问下午两点后是否方便通话？' },
    ],
    agenda: [
      { id: 'ag-1', title: '林晓梅 · MRI 升级临床需求访谈', time: '今天 14:30 - 15:00', owner: 'young', channel: '电话（遵循仅 14:00 后偏好）', status: '已预约' },
      { id: 'ag-2', title: '王芳 · 检验流水线招采答疑', time: '明天 10:00 - 10:45', owner: 'young', channel: '线上会议', status: '待确认' },
      { id: 'ag-3', title: '赵强 · 设备场地与安装条件评审', time: '周五 15:00 - 16:00', owner: 'young', channel: '医院现场', status: '已预约' },
    ],
    orgRules: [
      { id: 'rule-1', title: '院方消息不等于外发授权', body: '院方首次询问或要求转人工时，禁止自动触发主动外发或助手连续追问，必须经过人工审批或取得明确沟通同意。', source: '系统内置规则 v4', status: 'active' },
      { id: 'rule-2', title: '严格遵循院方联系时间窗', body: '若客户记忆中存在明确联系时段限制（如「仅工作日 14:00 后」），所有跟进排期提案不得落在禁区时段内。', source: 'PR #29 记忆闭环', status: 'active' },
      { id: 'rule-3', title: '临床与招采口径以本体论为准', body: '统计高价值停滞商机、中标概率或回访优先级前，必须先校验本体论口径，并核对注册证、授权链和招采状态。', source: 'PR #38 本体论规范', status: 'active' },
    ],
  };
};

window.DEMO_SCENARIOS = [
  {
    id: 'ontology-stalled',
    title: '本体论查询：核对高价值停滞商机并生成医疗大客户跟进方案',
    prompt: '基于业务本体论核对高价值停滞商机、注册证与院方记忆，生成可执行跟进方案（先校验口径再读取）。',
    agent: '医疗大客户商机 Agent',
    steps: [
      {
        name: '1. ontology_search_terms',
        status: 'ok',
        detail: { query: '高价值停滞商机', matchedTerms: ['deal.stalled_high_value', 'device.registration_status', 'tender.qualification_status', 'conversation.last_inbound_at'] },
      },
      {
        name: '2. ontology_check_answerable',
        status: 'full',
        detail: { ontologyVersion: '1.0.0', answerability: 'full', role: 'ontology_reader (read-only)', visibility: 'org_scoped_rls' },
      },
      {
        name: '3. ontology_query (只读语义执行)',
        status: 'ok',
        detail: { template: 'stalled_device_deals_with_memory_v1', rowCount: 2, rowLimit: 50, rows: ['赵强 — 医用加速器配套项目 (¥12,800,000, 停滞 76h)', '王芳 — 检验流水线扩容 (¥5,200,000, 停滞 52h)'] },
      },
    ],
    evidence: {
      status: 'full',
      ontologyVersion: '1.0.0',
      scope: 'young 演示工作区 (0dae91cc)',
      visibility: '全量可见医疗商机 · 行列隔离角色 ontology_reader',
      relations: 'crm_leads → hospital_contacts → customer_memories',
      sources: 'crm_leads, device_registrations, tender_qualifications, org_memory_entries',
      template: 'stalled_device_deals_with_memory_v1 · 2 条（上限 50 条）',
    },
    reply: '已完成语义核验与只读查询，发现 2 笔高价值停滞商机：\n1. **赵强 — 医用加速器配套项目（¥12,800,000，停滞 76 小时）**：设备科正在评审场地承重、供电、屏蔽与 EMC 资料。\n2. **王芳 — 检验流水线扩容（¥5,200,000，停滞 52 小时）**：待补齐 NMPA 注册证、项目授权与售后 SLA，配合 5 个工作日招采审核。\n\n已为您生成可撤销的跟进任务提案，等待审批后写入 CRM。',
    proposal: {
      id: 'prop-ontology-1',
      title: '创建 2 条高优先级资质准备与回访任务',
      summary: '为「赵强 — 医用加速器配套项目」准备场地与 EMC 资料清单；为「王芳 — 检验流水线扩容」准备注册证、授权书与 SLA 附件（不直接外发消息）。',
      actionType: 'create_tasks_batch',
      tasksToAdd: [
        { title: '向赵强发送设备场地与 EMC 检测资料清单', dueLabel: '今天 17:30', priority: 'urgent', contactId: 'c-4', leadId: 'l-4' },
        { title: '补齐王芳的 NMPA 注册证、授权书与售后 SLA', dueLabel: '明天 10:00', priority: 'high', contactId: 'c-3', leadId: 'l-3' },
      ],
    },
  },
  {
    id: 'memory-boundary',
    title: '客户记忆闭环：准备林晓梅 MRI 升级回访建议（含院方时间窗检查）',
    prompt: '查看林晓梅的院方记忆与最近沟通，起草一份不触犯联系偏好的回访计划。',
    agent: '客户记忆整理 Agent',
    steps: [
      {
        name: '1. memory_retrieve (客户记忆读取)',
        status: 'ok',
        detail: { contact: '林晓梅', confirmedCount: 2, candidateCount: 1, constraints: ['仅工作日 14:00 后电话沟通', '暂停助手自动回复', '预算上限 ¥8,600,000', '招采前需 NMPA / UDI 资料'] },
      },
      {
        name: '2. ontology_describe_outcome (验收边界检查)',
        status: 'ok',
        detail: { inboundIsConsent: false, outboundAllowed: false, reason: '院方要求人工沟通，禁止助手自动外发' },
      },
    ],
    evidence: {
      status: 'partial',
      ontologyVersion: '1.0.0',
      scope: '联系人林晓梅 (c-1)',
      visibility: '已确认记忆 2 条 · 待审候选 1 条',
      relations: 'contacts → conversations → customer_memories',
      sources: 'customer_memories, conversations, device_registrations',
      template: 'contact_memory_context_v1 · 3 条（上限 20 条）',
    },
    reply: '根据林晓梅的**已确认客户记忆**：\n- 联系窗口：**仅工作日 14:00 后**，且**暂停助手自动回复**；\n- 预算约束：**上限 ¥8,600,000**（当前商机 ¥8,600,000 已到预算边界）。\n\n同时发现 1 条待审核候选记忆：「临床评估前补充低噪声成像与工作流演示」。建议由大客户经理在今天 14:30 的人工访谈中确认演示范围。',
    proposal: {
      id: 'prop-memory-1',
      title: '确认候选记忆并安排 14:30 人工回访任务',
      summary: '将「补充低噪声成像与工作流演示」转为已确认记忆，并保持助手自动外发静默状态。',
      actionType: 'confirm_memory',
      contactId: 'c-1',
      memoryId: 'm-3',
    },
  },
];
