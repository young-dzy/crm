"use strict";

/**
 * Browser-only stand-in for followup_flow_pointers, followup_flow_versions
 * and followup_enrollments. The React adapter (src/api-client.ts) is what
 * applies the product rules; this file only stores and seeds.
 *
 * Keep the shape aligned with the static demo's follow-up data model.
 */
(function () {
  var KEY = "young_demo_followups_v1";

  var FLOW = "11111111-1111-4111-8111-111111111111";
  var VER1 = "22222222-2222-4222-8222-222222222222";
  var ENR1 = "33333333-3333-4333-8333-333333333333";
  var LIN = "44444444-4444-4444-8444-444444444444";
  var CHEN = "55555555-5555-4555-8555-555555555555";
  var WANG = "66666666-6666-4666-8666-666666666666";
  var PIPE = "77777777-7777-4777-8777-777777777777";
  var ST_NEW = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
  var ST_CON = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
  var ST_PRO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3";
  var ST_WON = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4";
  var AGENDA = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1";
  var WHEN = "2026-11-18T02:00:00.000Z";

  function baseGraph(promptHint) {
    return {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          label: "流程开始",
          position: { x: 40, y: 80 },
          config: {},
        },
        {
          id: "wait-1",
          type: "wait",
          label: "等待",
          position: { x: 340, y: 80 },
          config: { mode: "fixed", duration_ms: 300000 },
        },
        {
          id: "action-1",
          type: "action",
          label: "发送消息",
          position: { x: 640, y: 80 },
          config: { mode: "ai_message", prompt_hint: promptHint },
        },
        {
          id: "end-1",
          type: "end",
          label: "流程结束",
          position: { x: 940, y: 80 },
          config: { outcome: "exhausted" },
        },
      ],
      edges: [
        { id: "edge-1", source: "trigger-1", target: "wait-1", priority: 0, condition: { type: "always" } },
        { id: "edge-2", source: "wait-1", target: "action-1", priority: 0, condition: { type: "always" } },
        { id: "edge-3", source: "action-1", target: "end-1", priority: 0, condition: { type: "always" } },
      ],
    };
  }

  function createSeed() {
    var graph = baseGraph("版本 1 的临床回访提示：确认设备试用反馈与招采时间窗。不得承诺未获批价格、交期或临床结论。");
    return {
      pointers: [
        {
          id: FLOW,
          name: "临床评估后回访",
          status: "active",
          active_version_id: VER1,
          draft_graph: graph,
          handoff_policy: "pause",
          trigger_config: { kind: "manual" },
          created_at: WHEN,
          updated_at: WHEN,
        },
      ],
      versions: [
        {
          id: VER1,
          pointer_id: FLOW,
          graph: JSON.parse(JSON.stringify(graph)),
          created_at: WHEN,
        },
      ],
      enrollments: [
        {
          id: ENR1,
          pointer_id: FLOW,
          version_id: VER1,
          contact_id: LIN,
          status: "active",
          current_node_id: "trigger-1",
          next_eval_at: WHEN,
          outcome: null,
          cancel_reason: null,
          started_at: WHEN,
          completed_at: null,
          updated_at: WHEN,
        },
      ],
      contacts: [
        { id: LIN, name: "林晓梅" },
        { id: CHEN, name: "陈伟" },
        { id: WANG, name: "王芳" },
      ],
      pipelines: [{ id: PIPE, name: "医疗设备商机" }],
      stages: [
        { id: ST_NEW, pipeline_id: PIPE, name: "意向确认", is_won: false, is_lost: false, is_archived: false },
        { id: ST_CON, pipeline_id: PIPE, name: "临床评估", is_won: false, is_lost: false, is_archived: false },
        { id: ST_PRO, pipeline_id: PIPE, name: "招采审批", is_won: false, is_lost: false, is_archived: false },
        { id: ST_WON, pipeline_id: PIPE, name: "已中标", is_won: true, is_lost: false, is_archived: false },
      ],
      agenda_types: [{ id: AGENDA, name: "演示：临床科室随访" }],
      message_templates: [
        {
          id: "00000000-0000-4000-8000-0000000000aa",
          title: "资质材料跟进（不会外发）",
          body: "这是静态演示里的招采资质沟通模板，选择它不会发送消息。",
          shortcut: null,
          owner_user_id: null,
        },
      ],
      notes: [
        {
          at: WHEN,
          text: "初始数据：林晓梅已纳入临床评估回访版本 1，停在触发节点。没有 worker 领取，也不会发消息。",
        },
      ],
    };
  }

  function emit() {
    try {
      window.dispatchEvent(new CustomEvent("pi-followups-store"));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var seed = createSeed();
    try {
      localStorage.setItem(KEY, JSON.stringify(seed));
    } catch (e2) {}
    return seed;
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
    emit();
  }

  function reset() {
    var seed = createSeed();
    try {
      localStorage.setItem(KEY, JSON.stringify(seed));
    } catch (e) {}
    emit();
    return seed;
  }

  window.FollowupsDemoState = {
    KEY: KEY,
    load: load,
    save: save,
    reset: reset,
    createSeed: createSeed,
  };
})();
