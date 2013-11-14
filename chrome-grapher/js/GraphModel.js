var GraphModel = function (label) {
    this.label = label;
    this.values = [];
    this.min_value = Infinity;
    this.max_value = -Infinity;
    this.views = [];
};

GraphModel.prototype = {
    add_values: function (values) {
        if (!values.length)
            return;
        values.forEach(function (value) {
            // TODO: understand why NaN disappear, probably because of Pseudo-JSON transfer through MessageChannel
            if (value[0] == null)
                value[0] = NaN;
            else if (value[0] < this.min_value)
                this.min_value = value[0];
            else if (value[0] > this.max_value)
                this.max_value = value[0];
        }, this);
        Array.prototype.push.apply(this.values, values);
        this.notify_views();
    },
    notify_views: function () {
        this.views.forEach(function (view) {
            view.request_draw();
        });
    }
};
