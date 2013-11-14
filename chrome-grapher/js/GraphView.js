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
        this.element.appendChild(this.canvas);
        this.last_value = document.createElement("div");
        this.last_value.className = "graph-last-value";
        this.element.appendChild(this.last_value);
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
                context.strokeStyle = "#aaa";
                context.lineCap = "round";
                this.draw_values(context, this.timespan_model.start, delta_time, width, height, true);
                this.draw_values(context, this.timespan_model.start, delta_time, width, height, false);
                var last_value = this.graph_model.values[this.graph_model.values.length - 1];
                this.last_value.innerText = last_value % 1 == 0 ? last_value : last_value.toFixed(5);
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
        var has_pending_point = false;
        var min_value = this.graph_model.min_value;
        var delta_value = this.graph_model.max_value - this.graph_model.min_value;
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
                previous_x = value_x;
                previous_y = value_y;
            }
        });
        if (has_pending_point) {
            context.lineTo(width, previous_y);
            terminate(start_x, width);
        }
    },
    request_draw: function () {
        if (!this.has_pending_draw) {
            requestAnimationFrame(this.draw.bind(this), this.canvas);
            this.has_pending_draw = true;
        }
    }
};
