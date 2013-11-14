var extension_channel = chrome.extension.connect({name: "panel"});

extension_channel.postMessage({tab_id: chrome.devtools.inspectedWindow.tabId });

extension_channel.onMessage.addListener(function (message) {
    receive_from_page(message);
});

function send_to_page(message) {
    message.target = "injected-page";
    extension_channel.postMessage(message, "*");
}

var model = new PanelModel();
var view = new PanelView(model, document.body);
model.views.push(view);

function receive_from_page(message) {
    if (message.type == "page-ready") {
        send_to_page(({type: "panel-opened"}));
    }
    if (message.type == "add-records") {
        var records = message.records;
        for (var label in records)
            if (records.hasOwnProperty(label))
                model.add_records(label, records[label]);
    }
}

Array.prototype.forEach.call(document.querySelectorAll(".localized"), function (element) {
    element.innerText = chrome.i18n.getMessage(element.innerText);
});

chrome.devtools.network.onNavigated.addListener(function () {
    model.reset();
});

window.addEventListener("resize", function () {
    view.request_draw();
});

send_to_page({type: "panel-opened"});
