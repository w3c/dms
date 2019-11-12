const PLANNER_LOG_TAG = "DMOS_DM5_PLANNER";
const PLANNER_LOG_TAG_LENGTH = PLANNER_LOG_TAG.length;

let debug_mode_ = false;
const ERROR_PREFIX = "ERROR";
const ERROR_PREFIX_LENGTH = ERROR_PREFIX.length;

var Module = {
  onRuntimeInitialized: function() {},
  print: function(text) {
    if (text.substr(0, PLANNER_LOG_TAG_LENGTH) === PLANNER_LOG_TAG) {
      const msg = text.substr(PLANNER_LOG_TAG_LENGTH+1);
      if (msg.substr(0, ERROR_PREFIX_LENGTH) === ERROR_PREFIX && !debug_mode_) {
        return;
      }
      postMessage({ type: 'print', text: msg});
    }
  }
};

importScripts('./dm.js');

let inst = null;

function callDMHandleEvent() {
  inst.HandleEvent();
}

function start_dm(dependencies, debug_mode) {
  debug_mode_ = debug_mode;
  inst = new Module.PlannerWrapper('__main__', JSON.stringify(dependencies), debug_mode_);
  setInterval(callDMHandleEvent, 200);
}

function handleEvent(input, slots = {}) {
  // need to serialize every value passed to dm.js
  inst.SetInformationState("_nlu", JSON.stringify(input));
  inst.SetInformationState("_slots", String(JSON.stringify(slots)));
}

self.onmessage = msg => {
  let msg_data = msg.data;

  switch (msg_data.type) {
    case 'start':
      start_dm(msg_data.dependencies, msg_data.debug_mode);
      break;
    case 'handle-event':
        handleEvent(msg_data.input, msg_data.slots);
      break;
    default:
      throw new Error('Unknown message from main: ' + JSON.stringify(msg_data));
  }
};