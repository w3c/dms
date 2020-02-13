const PLANNER_LOG_TAG = "DMOS_DM5_PLANNER";
const PLANNER_LOG_TAG_LENGTH = PLANNER_LOG_TAG.length;

let debug_mode_ = false;
const ERROR_PREFIX = "ERROR";
const ERROR_PREFIX_LENGTH = ERROR_PREFIX.length;

let runtimeReady= false;

var Module = {
  onRuntimeInitialized: function() {
    // Set the runtimeReady flag to true, indicating that the WebAssembly
    // module has been compiled and its components are ready to use.
    runtimeReady = true;
    console.log('Runtime is ready.');
  },
  print: function(text) {
    // console.log(text);
    if (text.substr(0, PLANNER_LOG_TAG_LENGTH) === PLANNER_LOG_TAG) {
      const msg = text.substr(PLANNER_LOG_TAG_LENGTH+1);
      if (msg.substr(0, ERROR_PREFIX_LENGTH) === ERROR_PREFIX && !debug_mode_) {
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
  debug_mode_ = debug_mode;
  inst = new Module.PlannerWrapper('__main__', JSON.stringify(dependencies), debug_mode_);
  setInterval(callDMHandleEvent, 200);
}

function handleEvent(input, slots = {}) {
  // need to serialize every value passed to dm.js
  inst.SetInformationState("_nlu", JSON.stringify(input));
  inst.SetInformationState("_slots", String(JSON.stringify(slots)));
}

function processWhenRuntimeReady(messageData) {
  // Processing messages sent from "main" require calling functions from
  // the WebAssembly module. Therefore we must wait until the WebAssembly
  // module is fully initialized before processing any messages.

  if (!runtimeReady) {
    // The WebAssembly module has not been compiled yet. Try again in 100ms.
    setTimeout(processWhenRuntimeReady, 100, messageData);
  } else {
    // The WebAssembly module has been compiled and its components are ready to
    // use.
    switch (messageData.type) {
      case 'start':
        start_dm(messageData.dependencies, messageData.debug_mode);
        break;
      case 'handle-event':
        // console.log("handling event");
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