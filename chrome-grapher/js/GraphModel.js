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
    strip_records_before: function (timestamp, keep_one_extra) {
        var index = this.get_last_index_before(timestamp);
        if (index != -1) {
            if (keep_one_extra && index > 0)
                --index;
            // It'd be nice to use a ring buffer here but it's less than trivial since
            // we clamp based on time but store an undetermined number of records.
            this.values.splice(0, index);
            this.timestamps.splice(0, index);
            this.min_value = Math.min.apply(Math, this.values);
            this.max_value = Math.max.apply(Math, this.values);
            this.notify_views();
        }
    },
    get_last_index_before: function (timestamp) {
        // We could do a binary search here
        var length = this.timestamps.length;
        for (var i = 0; i < length; ++i)
            if (this.timestamps[i] >= timestamp)
                return i;
        return -1;
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
