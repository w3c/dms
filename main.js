let worker = new Worker('./worker.js');

document.addEventListener('DOMContentLoaded', (event) => {
    worker.onmessage = function(msg) {
        let { data } = msg;
        switch(data.type) {
            case 'print':
                console.log(data.text);
                break;
            default:
                throw new Error('Unknown message from worker: ' + JSON.stringify(data));
        }
    };
    worker.onerror = function(msg) {
        console.error('error on the web worker', msg);
    };
});

let runClicked = function() {
    let runInput1 = document.getElementById("run-input-1");
    let runOutput1 = document.getElementById("run-output-1");
    console.log("run clicked", runInput1.innerText);
    console.log("run clicked", runOutput1);
    let allComponenets = {
        "__main__": {"@act": "`hi from dm`"}
    }
    worker.postMessage({
        type: 'start', 
        dependencies: allComponenets, 
        debug_mode: false 
    });
    return false;
}