(function () {
    var records = {};
    var channel = new MessageChannel();
    var panel_is_open = false;
    var has_pending_data = false;
    // Notify the content script of the available channel port
    window.postMessage("bind-port-to-extension", [channel.port2], "*");

    function receive_from_extension(message) {
        if (message.type == "panel-opened") {
            if (!panel_is_open && has_pending_data)
                send_pending_data();
            panel_is_open = true;
        }
        if (message.type == "panel-closed") {
            panel_is_open = false;
        }
    }

    function send_pending_data() {
        send_to_extension({
            type: "add-records",
            records: records
        });
        for (var label in records)
            if (records.hasOwnProperty(label))
                records[label].length = 0;
        has_pending_data = false;
    }

    function send_to_extension(message) {
        channel.port1.postMessage(message);
    }

    channel.port1.addEventListener("message", function (event) {
        receive_from_extension(event.data);
    });
    channel.port1.start();

    console.graph = function (name, value) {
        if (panel_is_open) {
            var item = [value, performance.now()];
            if (records.hasOwnProperty(name))
                records[name].push(item);
            else
                records[name] = [item];
            if (!has_pending_data) {
                has_pending_data = true;
                requestAnimationFrame(function () {
                    if (panel_is_open)
                        send_pending_data();
                }, window);
            }
        }
    };

    send_to_extension({type: "page-ready"});
})();
