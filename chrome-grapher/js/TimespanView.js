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
            context.font = "10px 'Lucida Grande', sans-serif";
            steps.forEach(function (step) {
                // TODO: reduce space between value and unit
                var text_metrics = context.measureText(step.label);
                context.fillText(step.label, step.x - text_metrics.width - 3, 16);
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
