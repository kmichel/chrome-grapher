chrome.extension.connect({name: "content"});

// Inject bridge code in inspected window
function inject_bridge_code() {
    var script = document.createElement("script");
    script.src = chrome.extension.getURL("js/injected.js");
    script.onload = function () {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(script);
}
inject_bridge_code();

// Wait for message sent by inspected page
window.addEventListener("message", function (event) {
    if (event.data === "bind-port-to-extension")
        bind_port_to_extension(event.ports[0]);
});

// Connect MessageChannel from inspected window to the extension
function bind_port_to_extension(port) {
    // Forward injected script message to background
    port.addEventListener("message", function (event) {
        try {
            chrome.extension.sendMessage(event.data);
        } catch (e) {
            // This happens when the extension is reloaded, the connection breaks
            // TODO: improve this to have the panel completely reload
            port.postMessage({type: "panel-closed", target: "injected-page"});
        }
    });
    // Forward background message to injected script
    chrome.extension.onMessage.addListener(function (message) {
        if (message.target === "injected-page")
            port.postMessage(message);
    });
    port.start();
}
