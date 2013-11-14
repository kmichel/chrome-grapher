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
