const PLANNER_LOG_TAG = "DMOS_DM5_PLANNER";
const PLANNER_LOG_TAG_LENGTH = PLANNER_LOG_TAG.length;

let debugMode = false;
const ERROR_PREFIX = "ERROR";
const ERROR_PREFIX_LENGTH = ERROR_PREFIX.length;

let runtimeReady= false;

var Module = {
  onRuntimeInitialized: function() {
    runtimeReady = true;
  },
  print: function(text) {
    if (text.substr(0, PLANNER_LOG_TAG_LENGTH) === PLANNER_LOG_TAG) {
      const msg = text.substr(PLANNER_LOG_TAG_LENGTH+1);
      if (msg.substr(0, ERROR_PREFIX_LENGTH) === ERROR_PREFIX && !debugMode) {
        return;
      }
      postMessage({ type: 'print', text: msg});
    }
  }
};

importScripts('dm.js');

let inst = null;

function callDMHandleEvent() {
  inst.HandleEvent();
}
function start_dm(dependencies, debug_mode) {
  debugMode = debug_mode;
  inst = new Module.PlannerWrapper('__main__', JSON.stringify(dependencies), debugMode);
  setInterval(callDMHandleEvent, 200);
}

function handleEvent(input, slots = {}) {
  // need to serialize every value passed to dm.js
  inst.SetInformationState("_nlu", JSON.stringify(input));
  inst.SetInformationState("_slots", String(JSON.stringify(slots)));
}

function processWhenRuntimeReady(messageData) {
  if (!runtimeReady) {
    setTimeout(processWhenRuntimeReady, 100, messageData);
  } else {
    switch (messageData.type) {
      case 'start':
        start_dm(messageData.dependencies, messageData.debug_mode);
        break;
      case 'handle-event':
        handleEvent(messageData.input, messageData.slots);
        break;
      default:
        throw new Error('Unknown message from main: ' + JSON.stringify(messageData));
    }
  }
}

self.onmessage = msg => {
  let messageData = msg.data;
  processWhenRuntimeReady(messageData);
};
