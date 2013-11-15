var TimespanModel = function () {
    this.start = Infinity;
    this.stop = -Infinity;
    this.highlight_fraction = NaN;
    this.views = [];
};

TimespanModel.prototype = {
    is_valid: function () {
        return this.stop > this.start;
    },
    include_value: function (value) {
        var has_changed = false;
        if (value < this.start) {
            this.start = value;
            has_changed = true;
        }
        if (value > this.stop) {
            this.stop = value;
            has_changed = true;
        }
        if (has_changed)
            this.notify_views();
    },
    exclude_values_before: function (timestamp) {
        if (!this.is_valid())
            return;
        if (this.start < timestamp) {
            this.start = timestamp;
            if (this.stop < timestamp)
                this.stop = timestamp;
            this.notify_views();
        }
    },
    set_highlight_fraction: function (fraction) {
        this.highlight_fraction = fraction;
        this.notify_views();
    },
    clear_highlight: function () {
        this.highlight_fraction = NaN;
        this.notify_views();
    },
    reset: function () {
        this.start = Infinity;
        this.stop = -Infinity;
        this.highlight_fraction = NaN;
        this.notify_views();
    },
    notify_views: function () {
        this.views.forEach(function (view) {
            view.request_draw();
        });
    }
};
