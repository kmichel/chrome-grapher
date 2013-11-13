var extension_channel = chrome.extension.connect({name: "panel"});

extension_channel.postMessage({tab_id: chrome.devtools.inspectedWindow.tabId });

extension_channel.onMessage.addListener(function (message) {
    receive_from_page(message);
});

function send_to_page(message) {
    message.target = "injected-page";
    extension_channel.postMessage(message, "*");
}

var graphs = {};
var time_range = {
    start: Infinity,
    stop: -Infinity
};
var graph_is_dirty = false;

function receive_from_page(message) {
    if (message.type == "page-ready") {
        send_to_page(({type: "panel-opened"}));
    }
    if (message.type == "data-bundle") {
        var storage = message.data;
        for (var name in storage)
            if (storage.hasOwnProperty(name)) {
                values = storage[name];
                if (!graphs.hasOwnProperty(name)) {
                    var list = document.getElementById("graph-list");
                    var entry = create_graph_entry(name);
                    graphs[name] = entry;
                    list.appendChild(entry.block);
                }
                graphs[name].values.push.apply(graphs[name].values, values);
            }

        update_time_range(graphs, time_range);
        if (!graph_is_dirty) {
            requestAnimationFrame(update_view, window);
            graph_is_dirty = true;
        }
    }
}

function update_view() {
    update_time_range_view(time_range);
    for (var name in graphs)
        if (graphs.hasOwnProperty(name))
            update_graph(graphs[name], time_range);
    graph_is_dirty = false;
}

function create_graph_entry(name) {
    var block = document.createElement("div");
    block.className = "graph-block";
    var label = document.createElement("div");
    label.className = "graph-label";
    label.innerText = name;
    var last_value = document.createElement("div");
    last_value.className = "graph-last-value";
    var canvas = document.createElement("canvas");
    block.appendChild(label);
    block.appendChild(last_value);
    block.appendChild(canvas);
    return {
        name: name,
        values: [],
        last_value: last_value,
        block: block,
        canvas: canvas};
}

function update_time_range(graphs, time_range) {
    time_range.start = Infinity;
    time_range.stop = -Infinity;
    for (var name in graphs)
        if (graphs.hasOwnProperty(name)) {
            var graph = graphs[name];
            if (graph.values.length) {
                time_range.start = Math.min(time_range.start, graph.values[0][1]);
                time_range.stop = Math.max(time_range.stop, graph.values[graph.values.length - 1][1]);
            }
        }
}

function update_time_range_view(time_range) {
    if (time_range.start < time_range.stop) {
        document.getElementById("start-time").innerText = time_range.start.toFixed(3) + "ms";
        document.getElementById("stop-time").innerText = time_range.stop.toFixed(3) + "ms";
    } else {
        document.getElementById("start-time").innerText = "";
        document.getElementById("stop-time").innerText = "";
    }
}

function update_graph(graph, time_range) {
    graph.canvas.width = graph.block.clientWidth - 200;
    graph.canvas.height = 60;
    var context = graph.canvas.getContext("2d");
    var min_value = Infinity;
    var max_value = -Infinity;
    var min_time = time_range.start;
    var max_time = time_range.stop;
    for (var i = 0; i < graph.values.length; ++i) {
        var value = graph.values[i];
        min_value = Math.min(min_value, value[0]);
        max_value = Math.max(max_value, value[0]);
    }
    var delta_value = max_value - min_value;
    var delta_time = max_time - min_time;
    var width = graph.canvas.width;
    var height = graph.canvas.height;
    context.fillStyle = "#aad";
    context.strokeStyle = "#666";
    context.lineCap = "round";
    context.beginPath();
    var previous_x = 0;
    var previous_y = height;
    context.moveTo(-2, height);
    for (var i = 0; i < graph.values.length; ++i) {
        var value = graph.values[i];
        var value_height = (value[0] - min_value) / delta_value * (height - 4);
        var value_y = height - 2 - value_height;
        var value_x = (value[1] - min_time) / delta_time * (width);
        if (value_x - previous_x > 2)
            context.lineTo(value_x, previous_y);
        context.lineTo(value_x, value_y);
        previous_x = value_x;
        previous_y = value_y;
    }
    context.lineTo(width + 2, previous_y);
    context.lineTo(width + 2, height);
    context.fill();
    context.stroke();
    var last_value = graph.values[graph.values.length - 1][0];
    graph.last_value.innerText = last_value % 1 == 0 ? last_value : last_value.toFixed(5);
}

function clear_graphs() {
    document.getElementById("graph-list").innerHTML = "";
    graphs = {};
    time_range.start = Infinity;
    time_range.stop = -Infinity;
    update_time_range_view(time_range);
    graph_is_dirty = false;
}

send_to_page({type: "panel-opened"});

document.querySelector("button[name=clear]").addEventListener("click", function () {
    clear_graphs();
});

var localized_items =document.querySelectorAll("[class=localized]");
for (var i=0; i<localized_items.length; ++i)
    localized_items[i].innerText = chrome.i18n.getMessage(localized_items[i].innerText);

chrome.devtools.network.onNavigated.addListener(function () {
    clear_graphs();
});
