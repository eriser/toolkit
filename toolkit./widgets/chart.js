var Chart = new Class({
    Implements: [Events, Options, Coordinates],
    options: {
        container: false, // a container the SVG should be injected to
        class:     "",    // a class to add in build process
        id:        "",    // an id to add in build process
        grid_x:    [],    // array containing {pos:x[, color: "colorstring"[, class: "classname"[, label:"labeltext"]]]}
        grid_y:    [],    // array containing {pos:y[, color: "colorstring"[, class: "classname"[, label:"labeltext"]]]}
    },
    graphs: [],
    _add: ".5",
    initialize: function (options) {
        this.setOptions(options);
        
        // firefox? don't add pixels!
        if (Browser.firefox)
            this._add = "";
        
        this.element = makeSVG("svg", {
            width:  this.options.width,
            height: this.options.height,
        });
        this.element.addClass("toolkit-chart");
        if(this.options.container)
            this.set("container", this.options.container);
        
        this._graphs = makeSVG("g", {class: "toolkit-graphs"});
        this._graphs.inject(this.element);
        
        this.__grid = new Grid({
            grid_x: this.options.grid_x,
            grid_y: this.options.grid_y,
            mode_x: this.options.mode_x,
            mode_y: this.options.mode_y,
            width:  this.options.width,
            height: this.options.height,
            container: this.element
        })
        
        if(this.options.class)
            this.element.addClass(this.options.class);
        
        if(!this.options.id) this.options.id = String.uniqueID();
        this.element.set("id", this.options.id);
    },
    redraw: function (graphs, grid) {
        if(!this.options.width)
            this.options.width = this.element.innerWidth();
        if(!this.options.height)
            this.options.height = this.element.innerHeight();
        var w = this.options.width + "px";
        var h = this.options.height + "px";
        this.element.set({
            width: w,
            height: h,
        });
        this.element.css({
            width: w,
            height: h,
        });
        if(grid) {
            this.__grid.set("width",  this.options.width, true);
            this.__grid.set("height", this.options.height, true);
            this.__grid.set("mode_x", this.options.mode_x, true);
            this.__grid.set("mode_y", this.options.mode_y, true);
            this.__grid.redraw();
        }
        if(graphs) {
            for(var i = 0; i < this.graphs.length; i++) {
                this.graphs[i].set("width",  this.options.width, true);
                this.graphs[i].set("height", this.options.height, true);
                this.graphs[i].set("mode_x", this.options.mode_x, true);
                this.graphs[i].set("mode_y", this.options.mode_y, true);
                this.graphs[i].redraw();
            }
        }
    },
    destroy: function () {
        for(var i = 0; i < this.graphs.length; i++) {
            this.graphs[i].destroy();
        }
        this._graphs.destroy();
        this.element.destroy();
    },
    add_graph: function (options, g) {
        options["container"] = this._graphs;
        if(typeof options["width"] == "undefined")
            options["width"]  = this.options.width;
        if(typeof options["height"] == "undefined")
            options["height"] = this.options.height;
        if(typeof options["mode_x"] == "undefined")
            options["mode_x"]  = this.options.mode_x;
        if(typeof options["mode_y"] == "undefined")
            options["mode_y"] = this.options.mode_y;
        
        var g = new Graph(options);
        this.graphs.push(g);
        this.fireEvent("pathadded");
        return g;
    },
    remove_graph: function (g) {
        for(var i = 0; i < this.graphs.length; i++) {
            if(this.graphs[i] == g) {
                this.graphs[i].destroy();
                this.graphs.splice(i, 1);
                this.fireEvent("pathremoved");
                break;
            }
        }
    },
    
    // GETTER & SETER
    set: function (key, value, hold) {
        this.options[key] = value;
        switch(key) {
            case "container":
                if(!hold) this.element.inject(value);
                break;
            case "class":
                if(!hold) this.element.addClass(value);
                break;
            case "width":
            case "height":
            case "mode_x":
            case "mode_y":
                if(!hold) this.redraw(true, true);
                this.fireEvent("resized");
                break;
            case "grid_x":
            case "grid_y":
                if(!hold) this.redraw(true, true);
                break;
        }
    },
    get: function (key) {
        if(typeof this.options[key] != "undefined")
            return this.options[key];
    },
});