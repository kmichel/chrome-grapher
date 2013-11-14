var GraphModel = function (label) {
    this.label = label;
    this.values = [];
    this.timestamps = [];
    this.min_value = Infinity;
    this.max_value = -Infinity;
    this.views = [];
};

GraphModel.prototype = {
    add_records: function (records) {
        if (!records.length)
            return;
        records.forEach(function (record) {
            // TODO: understand why NaN disappear, probably because of Pseudo-JSON transfer through MessageChannel
            var value = record[0];
            if (value == null)
                value = NaN;
            else if (value < this.min_value)
                this.min_value = value;
            else if (value > this.max_value)
                this.max_value = value;
            this.values.push(value);
            this.timestamps.push(record[1]);
        }, this);
        this.notify_views();
    },
    for_each_record: function (callback, scope) {
        var length = this.values.length;
        for (var i = 0; i < length; ++i)
            callback.call(scope, this.values[i], this.timestamps[i]);
    },
    notify_views: function () {
        this.views.forEach(function (view) {
            view.request_draw();
        });
    }
};
