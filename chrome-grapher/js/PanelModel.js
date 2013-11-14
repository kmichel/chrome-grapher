var PanelModel = function () {
    this.graphs = {};
    this.timespan = new TimespanModel();
    this.views = [];
};

PanelModel.prototype = {
    add_records: function (label, records) {
        if (!records.length)
            return;
        this.timespan.include_value(records[0][1]);
        this.timespan.include_value(records[records.length - 1][1]);
        if (!this.graphs.hasOwnProperty(label))
            this.graphs[label] = new GraphModel(label);
        this.graphs[label].add_records(records);
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
