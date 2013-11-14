var TimespanView = function (model, canvas) {
    this.model = model;
    this.canvas = canvas;
    this.has_pending_draw = false;
    this.min_step_width = 50;
};

TimespanView.prototype = {
    draw: function () {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        var context = this.canvas.getContext("2d");
        if (this.model.is_valid()) {
            var steps = generate_steps(this.model.stop - this.model.start, this.canvas.width, this.min_step_width);
            context.strokeStyle = "#e8e8e8";
            context.lineCap = "butt";
            context.beginPath();
            steps.forEach(function (step) {
                context.moveTo(step.x, 0);
                context.lineTo(step.x, this.canvas.height - 0);
            }, this);
            context.stroke();
            context.fillStyle = "#222";
            context.font = "10px " + window.getComputedStyle(this.canvas, null).getPropertyValue("font-family");
            var thin_space_width = context.measureText(' ').width * 0.5;
            steps.forEach(function (step) {
                // This is an ugly workaround because Chrome thin and hair spaces are too large in canvas
                var position = step.x - 3;
                var value = step.label;
                var unit = "ms";
                if (value >= 1000) {
                    value /= 1000;
                    unit = "s";
                }
                value = value.toPrecision(3);
                var unit_width = context.measureText(unit).width;
                context.fillText(unit, position - unit_width, 16);
                var value_width = context.measureText(value).width;
                context.fillText(value, position - unit_width - thin_space_width - value_width, 16);
            });
        }
        this.has_pending_draw = false;
    },
    request_draw: function () {
        if (!this.has_pending_draw) {
            requestAnimationFrame(this.draw.bind(this), window);
            this.has_pending_draw = true;
        }
    }
};
