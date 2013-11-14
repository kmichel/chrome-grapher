(function () {
    var storage = {};
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
            type: "data-bundle",
            data: storage
        });
        for (var key in storage)
            if (storage.hasOwnProperty(key))
                storage[key].length = 0;
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
        var item = [value, performance.now()];
        if (storage.hasOwnProperty(name))
            storage[name].push(item);
        else
            storage[name] = [item];
        if (panel_is_open && !has_pending_data) {
            requestAnimationFrame(function () {
                if (panel_is_open)
                    send_pending_data();
            }, window);
        }
        has_pending_data = true;
    };

    send_to_extension({type: "page-ready"});
})();
