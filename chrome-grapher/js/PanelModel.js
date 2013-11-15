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
    strip_records_older_than: function (seconds) {
        if (!this.timespan.is_valid())
            return;
        var clamp_time = this.timespan.stop - seconds * 1000;
        this.timespan.exclude_values_before(clamp_time);
        for (var label in this.graphs)
            if (this.graphs.hasOwnProperty(label))
                this.graphs[label].strip_records_before(clamp_time);
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
