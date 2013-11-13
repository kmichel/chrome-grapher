var panel_ports = {};

// Forward content script message to panel
chrome.extension.onMessage.addListener(function (request, sender) {
    var port = panel_ports[sender.tab.id];
    if (port)
        port.postMessage(request);
});

// Wait for new inspected windows or messages from panel
chrome.extension.onConnect.addListener(function (port) {
    var tab_id;
    port.onMessage.addListener(function (message) {
        if (message.tab_id) {
            // A new inspected window has been opened
            tab_id = message.tab_id;
            panel_ports[tab_id] = port;
        } else if (message.target === "injected-page") {
            // Forward panel message to content script
            chrome.tabs.sendMessage(tab_id, message);
        }
    });
    port.onDisconnect.addListener(function () {
        if (tab_id) {
            chrome.tabs.sendMessage(tab_id, {type: "panel-closed", target: "injected-page"});
            delete panel_ports[tab_id];
        }
    });
});
