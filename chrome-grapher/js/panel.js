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
    block.appendChild(canvas);
    block.appendChild(last_value);
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
    var canvas = document.getElementById("timespan");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (time_range.start < time_range.stop) {
        var context = canvas.getContext("2d");
        var steps = generate_steps(time_range.stop - time_range.start, canvas.width, 50);
        context.strokeStyle = "#e8e8e8";
        context.lineCap = "butt";
        context.beginPath();
        steps.forEach(function (step) {
            context.moveTo(step.x, 0);
            context.lineTo(step.x, canvas.height - 0);
        });
        context.stroke();
        context.fillStyle = "#222";
        context.font = "10px 'Lucida Grande', sans-serif";
        steps.forEach(function (step) {
            var text_metrics = context.measureText(step.label);
            context.fillText(step.label, step.x - text_metrics.width - 3, 16);
        });
    }
}

function update_graph(graph, time_range) {
    graph.canvas.width = graph.canvas.clientWidth;
    graph.canvas.height = graph.canvas.clientHeight;
    var context = graph.canvas.getContext("2d");
    var min_value = Infinity;
    var max_value = -Infinity;
    var min_time = time_range.start;
    var max_time = time_range.stop;
    graph.values.forEach(function (value) {
        if (value[0] === null)
            value[0] = NaN;
        else if (value[0] < min_value)
            min_value = value[0];
        else if (value[0] > max_value)
            max_value = value[0];
    });
    var delta_value = max_value - min_value;
    var delta_time = max_time - min_time;
    var width = graph.canvas.width;
    var height = graph.canvas.height;
    var steps = generate_steps(max_time - min_time, width, 50);
    context.strokeStyle = "#e8e8e8";
    context.lineCap = "butt";
    context.beginPath();
    steps.forEach(function (step) {
        context.moveTo(step.x, 0);
        context.lineTo(step.x, height - 0);
    });
    context.stroke();
    if (graph.values.length) {
        context.fillStyle = "rgba(220, 225, 240, 0.8)";
        context.strokeStyle = "#aaa";
        context.lineCap = "round";
        draw_values(context, graph.values, min_value, delta_value, min_time, delta_time, width, height, true);
        draw_values(context, graph.values, min_value, delta_value, min_time, delta_time, width, height, false);
        var last_value = graph.values[graph.values.length - 1][0];
        graph.last_value.innerText = last_value % 1 == 0 ? last_value : last_value.toFixed(5);
    }
}

function draw_values(context, values, min_value, delta_value, min_time, delta_time, width, height, is_fill) {
    function terminate(start, stop) {
        if (is_fill) {
            context.lineTo(stop, height);
            context.lineTo(start, height);
            context.fill();
        } else
            context.stroke();
    }

    context.beginPath();
    var start_x = 0;
    var previous_x = 0;
    var previous_y = NaN;
    var has_pending_point = false;
    values.forEach(function (value) {
        var value_height = delta_value == 0 ? height * 0.5 : (value[0] - min_value) / delta_value * (height - 5);
        var value_y = height - 2.5 - value_height;
        var value_x = (value[1] - min_time) / delta_time * (width);
        if (!has_pending_point)
            start_x = value_x;
        if (value_y != previous_y) {
            if (value_x - previous_x > 2 && has_pending_point)
                context.lineTo(value_x, previous_y);
            if (isNaN(value_y)) {
                if (has_pending_point) {
                    terminate(start_x, value_x);
                    context.beginPath();
                    has_pending_point = false;
                }
            } else {
                context.lineTo(value_x, value_y);
                has_pending_point = true;
            }
            previous_x = value_x;
            previous_y = value_y;
        }
    });
    if (has_pending_point) {
        context.lineTo(width, previous_y);
        terminate(start_x, width);
    }
}

function generate_steps(range, pixels, min_step_size) {
    var max_step_count = Math.floor(pixels / min_step_size);
    var min_step_amount = range / max_step_count;
    var step_amount = Math.pow(10, Math.ceil(Math.log(min_step_amount) / Math.LN10));
    var step_size = step_amount / range * pixels;
    if (step_size * .2 >= min_step_size) {
        step_size *= .2;
        step_amount *= .2;
    } else if (step_size * .5 >= min_step_size) {
        step_size *= .5;
        step_amount *= .5;
    }
    var steps = [];
    for (var px = step_size, val = step_amount; px < pixels; px += step_size, val += step_amount)
        steps.push({
            x: px,
            label: val >= 1000 ? (val / 1000).toPrecision(3) + ' s' : val.toPrecision(3) + ' ms'});
    return steps;
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

Array.prototype.forEach.call(document.querySelectorAll(".localized"), function (element) {
    element.innerText = chrome.i18n.getMessage(element.innerText);
});

chrome.devtools.network.onNavigated.addListener(function () {
    clear_graphs();
});
