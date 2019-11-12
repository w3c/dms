
let worker = null;

document.addEventListener('DOMContentLoaded', (event) => {

});

let deleteWorker = function() {
    worker.terminate();
    worker = null;
}

let runClicked = function(context) {
    if (worker !== null) {
        deleteWorker();
    }
    
    let inputArea = context.parentNode.parentNode.children[0];
    let dmsExample = inputArea.innerText.split('\n');
    dmsExample.shift();
    let dms = dmsExample.join('\n');
    let outputArea = context.parentNode.children[1];
    outputArea.innerText = "";
    let dmpl = Compiler(dms);
    worker = new Worker('./worker.js');
    worker.onmessage = function(msg) {
        let { data } = msg;
        switch(data.type) {
            case 'print':
                let dataJson = JSON.parse(data.text);
                console.log(dataJson);
                if (dataJson['@act'] !== undefined) {
                    outputArea.innerText += `${JSON.stringify(dataJson['@act'])}\n`;
                } else if (dataJson['@set'] !== undefined) {
                    outputArea.innerText += `${dataJson['@set']} = ${JSON.stringify(dataJson['val'])}\n`;
                }
                
                if (outputArea.innerText.split('\n').length > 6) {
                    outputArea.innerText += `...`;
                    deleteWorker();
                }
                break;
            default:
                throw new Error('Unknown message from worker: ' + JSON.stringify(data));
        }
    };
    worker.postMessage({
        type: 'start', 
        dependencies: {
            "__main__": dmpl
        },
        debug_mode: true 
    });
    return false;
}