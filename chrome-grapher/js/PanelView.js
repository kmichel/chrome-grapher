var PanelView = function (model, element) {
    this.model = model;
    this.element = element;
    this.create_skeleton();
    this.timespan_view = new TimespanView(this.model.timespan, this.timespan_canvas);
    this.model.timespan.views.push(this.timespan_view);
    this.graph_views = {};
    this.draw();
};

PanelView.prototype = {
    create_skeleton: function () {
        this.timespan_canvas = this.element.querySelector(".timespan");
        this.graph_list_element = this.element.querySelector(".graph-list");
        this.clear_button = this.element.querySelector("button[name=clear]");
        this.clear_button.addEventListener("click", function () {
            this.model.reset();
        }.bind(this));
    },
    draw: function () {
        var has_any_graph = false;
        for (var label in this.model.graphs)
            if (this.model.graphs.hasOwnProperty(label)) {
                has_any_graph = true;
                break;
            }
        this.clear_button.disabled = !has_any_graph;
        this.has_pending_draw = false;
    },
    add_new_graphs: function () {
        for (var label in this.model.graphs)
            if (this.model.graphs.hasOwnProperty(label))
                if (!this.graph_views.hasOwnProperty(label)) {
                    var element = document.createElement("div");
                    element.className = "graph-block";
                    this.graph_list_element.appendChild(element);
                    this.graph_views[label] = new GraphView(this.model.graphs[label], this.model.timespan, element);
                    this.model.graphs[label].views.push(this.graph_views[label]);
                    this.model.timespan.views.push(this.graph_views[label]);
                }
    },
    remove_old_graphs: function () {
        for (var label in this.graph_views)
            if (this.graph_views.hasOwnProperty(label))
                if (!this.model.graphs.hasOwnProperty(label)) {
                    var element = this.graph_views[label].element;
                    element.parentNode.removeChild(element);
                    this.model.timespan.views.splice(this.model.timespan.views.indexOf(this.model.graphs[label]), 1);
                    delete this.graph_views[label];
                }
    },
    request_draw: function () {
        // XXX: this sucks a bit because we must immediately synchronize graph model
        // and view list but we *could* delay DOM manipulation required to add/remove views
        this.add_new_graphs();
        this.remove_old_graphs();
        if (!this.has_pending_draw) {
            this.timespan_view.request_draw();
            for (var label in this.graph_views)
                if (this.graph_views.hasOwnProperty(label))
                    this.graph_views[label].request_draw();

            requestAnimationFrame(this.draw.bind(this), this.element);
            this.has_pending_draw = true;
        }
    }
};
