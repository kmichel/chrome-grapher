var PanelModel = function () {
    this.graphs = {};
    this.timespan = new TimespanModel();
    this.views = [];
};

PanelModel.prototype = {
    add_values: function (label, values) {
        if (!values.length)
            return;
        this.timespan.include_value(values[0][1]);
        this.timespan.include_value(values[values.length - 1][1]);
        if (!this.graphs.hasOwnProperty(label))
            this.graphs[label] = new GraphModel(label);
        this.graphs[label].add_values(values);
        this.notify_views();
    },
    reset: function () {
        this.graphs = {};
        this.timespan.reset();
        this.notify_views();
    },
    notify_views: function () {
        this.views.forEach(function (view) {
            view.request_draw();
        });
    }
};
