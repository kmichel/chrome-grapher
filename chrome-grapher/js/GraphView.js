var GraphView = function (graph_model, timespan_model, element) {
    this.graph_model = graph_model;
    this.timespan_model = timespan_model;
    this.element = element;
    this.min_step_width = 50;
    this.create_skeleton();
    this.draw();
};

GraphView.prototype = {
    create_skeleton: function () {
        var label = document.createElement("div");
        label.className = "graph-label";
        label.innerText = this.graph_model.label;
        this.element.appendChild(label);
        this.canvas = document.createElement("canvas");
        this.canvas.addEventListener('mousemove', this.on_mouse_move.bind(this));
        this.canvas.addEventListener('mouseleave', this.on_mouse_leave.bind(this));
        this.element.appendChild(this.canvas);
        this.last_value = document.createElement("div");
        this.last_value.className = "graph-last-value";
        this.element.appendChild(this.last_value);
    },
    format_value: function (value) {
        return value % 1 == 0 ? value : value.toFixed(5);
    },
    draw: function () {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        var context = this.canvas.getContext("2d");
        if (this.timespan_model.is_valid()) {
            var delta_time = this.timespan_model.stop - this.timespan_model.start;
            var width = this.canvas.width;
            var height = this.canvas.height;
            var steps = generate_steps(delta_time, width, this.min_step_width);
            context.strokeStyle = "#e8e8e8";
            context.lineCap = "butt";
            context.beginPath();
            steps.forEach(function (step) {
                context.moveTo(step.x, 0);
                context.lineTo(step.x, height - 0);
            });
            context.stroke();
            if (this.graph_model.values.length) {
                context.fillStyle = "rgba(220, 225, 240, 0.8)";
                this.draw_values(context, this.timespan_model.start, delta_time, width, height, true);
                context.strokeStyle = "#888";
                context.lineCap = "round";
                this.draw_values(context, this.timespan_model.start, delta_time, width, height, false);
                this.last_value.innerText = this.format_value(this.graph_model.values[this.graph_model.values.length - 1]);
            }
        }
        this.has_pending_draw = false;
    },
    draw_values: function (context, min_time, delta_time, width, height, is_fill) {
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
        var previous_value = NaN;
        var has_pending_point = false;
        var min_value = this.graph_model.min_value;
        var delta_value = this.graph_model.max_value - this.graph_model.min_value;
        var highlight_x = this.timespan_model.highlight_fraction * width;
        var highlight_rect = undefined;
        this.graph_model.for_each_record(function (value, timestamp) {
            var value_height = delta_value == 0 ? height * 0.5 : (value - min_value) / delta_value * (height - 5);
            var value_y = height - 2.5 - value_height;
            var value_x = (timestamp - min_time) / delta_time * (width);
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
                if (!isNaN(highlight_x)) {
                    if (previous_x <= highlight_x && value_x >= highlight_x)
                        highlight_rect = [previous_x, value_x, previous_y, value_y, previous_value];
                }
                previous_value = value;
                previous_x = value_x;
                previous_y = value_y;
            }
        }, this);
        if (has_pending_point) {
            if (!isNaN(highlight_x)) {
                if (previous_x <= highlight_x)
                    highlight_rect = [previous_x, width, previous_y, previous_y, previous_value];
            }
            context.lineTo(width, previous_y);
            terminate(start_x, width);
        }
        if (highlight_rect !== undefined && is_fill) {
            context.fillStyle = "rgba(208, 214, 232, 0.8)";
            context.beginPath();
            context.moveTo(highlight_rect[0], height);
            context.lineTo(highlight_rect[0], highlight_rect[2]);
            context.lineTo(highlight_rect[1], highlight_rect[1] - highlight_rect[0] > 2 ? highlight_rect[2] : highlight_rect[3]);
            context.lineTo(highlight_rect[1], height);
            context.fill();

            var bar_position = Math.floor(highlight_x);

            context.strokeStyle = "#666";
            context.beginPath();
            context.moveTo(bar_position + 0.5, 0);
            context.lineTo(bar_position + 0.5, height);
            if (!isNaN(highlight_rect[2])) {
                context.moveTo(bar_position - 3, Math.floor(highlight_rect[2]) + 0.5);
                context.lineTo(bar_position + 4, Math.floor(highlight_rect[2]) + 0.5);
            }
            context.stroke();

            context.fillStyle = "#444";
            context.font = "bold 11px " + window.getComputedStyle(this.canvas, null).getPropertyValue("font-family");
            var formatted_value = this.format_value(highlight_rect[4]);
            var text_position_y = isNaN(highlight_rect[2]) ? height - 4 : Math.max(14, Math.round(highlight_rect[2]) - 4);
            if (bar_position < 80)
                context.fillText(formatted_value, bar_position + 4.5, text_position_y);
            else {
                var formated_value_width = context.measureText(formatted_value).width;
                context.fillText(formatted_value, bar_position - formated_value_width - 2.5, text_position_y);
            }
        }
    },
    on_mouse_move: function (event) {
        this.timespan_model.set_highlight_fraction((event.clientX - this.canvas.offsetLeft) / this.canvas.clientWidth);
    },
    on_mouse_leave: function () {
        this.timespan_model.clear_highlight();
    },
    request_draw: function () {
        if (!this.has_pending_draw) {
            requestAnimationFrame(this.draw.bind(this), this.canvas);
            this.has_pending_draw = true;
        }
    }
};
