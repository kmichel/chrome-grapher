var TimespanModel = function () {
    this.start = Infinity;
    this.stop = -Infinity;
    this.views = [];
};

TimespanModel.prototype = {
    is_valid: function () {
        return this.stop > this.start;
    },
    include_value: function (value) {
        if (value < this.start)
            this.start = value;
        else if (value > this.stop)
            this.stop = value;
        else
            return;
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
    reset: function () {
        this.start = Infinity;
        this.stop = -Infinity;
        this.notify_views();
    },
    notify_views: function () {
        this.views.forEach(function (view) {
            view.request_draw();
        });
    }
};
