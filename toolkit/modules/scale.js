 /* toolkit. provides different widgets, implements and modules for 
 * building audio based applications in webbrowsers.
 * 
 * Invented 2013 by Markus Schmidt <schmidt@boomshop.net>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
 * Boston, MA  02110-1301  USA
 */
 
Scale = new Class({
    // Scale can be used to draw dots and labels as markers next to a meter, a
    // fader or a frequency response graph. Depending on some parameters it
    // tries to decide on its own where to draw labels and dots depending on the
    //  available space and the scale. Scales can be drawn vertically and
    // horizontally. Scale extends Widget and implements Ranges.
    _class: "Scale",
    
    Extends: Widget,
    Implements: [Ranged],
    options: {
        layout:           _TOOLKIT_RIGHT, // how to draw the scale:
                                          // _TOOLKIT_LEFT:   vertical, labels
                                          //                  on the left
                                          // _TOOLKIT_RIGHT:  vertical, labels
                                          //                  on the right,
                                          // _TOOLKIT_TOP:    horizontal, labels
                                          //                  on top
                                          // _TOOLKIT_BOTTOM: horizontal, labels
                                          //                  on bottom
        division:         1,              // minimum step size
        levels:           [1],            // array of steps where to draw labels
                                          // and marker
        base:             false,          // base where dots and labels are
                                          // drawn from
        labels:           function (val) { return sprintf("%0.2f",  val); },
                                          // callback function for formatting
                                          // the labels
        gap_dots:         4,              // minimum gap between dots (pixel)
        gap_labels:       40,             // minimum gap between labels (pixel)
        show_labels:      true,           // if labels should be drawn
        show_min:         true,           // always draw a label at min
        show_max:         true,           // always draw a label at max
        show_base:        true            // always draw a label at base
    },
    __size: 0,
    
    initialize: function (options, hold) {
        this.parent(Object.merge(this.__options, options));
        this.element = this.widgetize(
                       new Element("div.toolkit-scale"), true, true, true);
        
        switch (this.options.layout) {
            case _TOOLKIT_LEFT:
                this.element.addClass("toolkit-vertical toolkit-left");
                break;
            case _TOOLKIT_RIGHT:
                this.element.addClass("toolkit-vertical toolkit-right");
                break;
            case _TOOLKIT_TOP:
                this.element.addClass("toolkit-horizontal toolkit-top");
                break;
            case _TOOLKIT_BOTTOM:
                this.element.addClass("toolkit-horizontal toolkit-bottom");
                break;
        }
        this.element.style["position"] = "relative";
        
        if (this.options.container) this.set("container", this.options.container);
        if (this.options["class"]) this.set("class", this.options["class"]);
        
        //this.parent(options);
        
        if (!hold)
            this.redraw();
        this.initialized();
    },
    
    redraw: function () {
        this.__size = 0;
        if (this.options.base === false)
            this.options.base = this.options.max
        this.element.empty();
        
        // draw base
        this.draw_dot(this.options.base, "toolkit-base");
        if (this.options.show_base) {
            this.draw_label(this.options.base, "toolkit-base");
        }
        // draw top
        if (this._val2px(this.options.base - this.options.min)
            >= this.options.gap_labels ) {
            this.draw_dot(this.options.min, "toolkit-min");
            if (this.options.show_min)
                this.draw_label(this.options.min, "toolkit-min");
        }
        
        // draw bottom
        if (this._val2px(this.options.max - this.options.base)
            >= this.options.gap_labels) {
            this.draw_dot(this.options.max, "toolkit-max");
            if (this.options.show_max)
                this.draw_label(this.options.max, "toolkit-max");
        }
        
        var level;
        
        // draw beneath base
        var iter = this.options.base;
        this.__last = iter;
        this.___last = this._val2px(iter);
        while (iter > this.options.min) {
            //console.log("beneath", this.options.reverse, iter)
            iter -= this.options.division;
            if (level = this._check_label(iter, this.options.division)) {
                //console.log("check_dots", this.__last, iter, this.options.division, level);
                this._check_dots(this.__last,
                                iter,
                               -this.options.division,
                                level,
                                function (a, b) { return a > b });
                this.__last = iter;
                this.___last = this._val2px(this.__last);
            }
        }
        // draw dots between last label and min
        this._check_dots(this.__last,
                        iter,
                       -this.options.division,
                        this.options.levels.length - 1,
                        function (a, b) { return a > b });
        
        // draw above base
        var iter = this.options.base;
        this.__last = iter;
        this.___last = this._val2px(iter);
        while (iter < this.options.max) {
            //console.log("above", this.options.reverse, iter)
            iter += this.options.division;
            if (level = this._check_label(iter, this.options.division)) {
                //console.log("check_dots", this.__last, iter, this.options.division, level);
                this._check_dots(this.__last,
                                iter,
                                this.options.division,
                                level,
                                function (a, b) { return a < b });
                this.__last = iter;
                this.___last = this._val2px(this.__last);
            }
        }
        // draw dots between last label and max
        this._check_dots(this.__last,
                        iter,
                        this.options.division,
                        this.options.levels.length - 1,
                        function (a, b) { return a < b });
        this.parent();
        return this;
    },
    destroy: function () {
        this.element.empty();
        this.element.destroy();
        this.parent();
        return this;
    },
    
    draw_dot: function (val, cls) {
        // draws a dot at a certain value and adds a class if needed
        
        // create dot element
        var d = new Element("div.toolkit-dot", { style: "position: absolute" });
        if (cls) d.addClass(cls);
        d.inject(this.element);
        
        // position dot element
        var styles = { }
        var pos = Math.round(this.val2px(val));
        pos = Math.min(Math.max(0, pos), this.options.basis - 1);
        styles[this._vert() ? "bottom" : "left"] = pos;
        d.setStyles(styles);
        return this;
    },
    draw_label: function (val, cls) {
        // draws a label at a certain value and adds a class if needed
        if (!this.options.show_labels) return;
                  
        // create label element
        var label = new Element("span.toolkit-label", {
            html: this.options.labels(val),
            style: "position: absolute; display: block; float: left" });
        if (cls) label.addClass(cls);
        label.inject(this.element);
        
        // position label element
        var styles = { }
        var pos = Math.round(this.val2px(val));
        var size = label[this._vert() ? "outerHeight" : "outerWidth"]();
        pos = Math.min(Math.max(0, pos - size / 2), this.options.basis - size);
        styles[this._vert() ? "bottom" : "left"] = pos;
        label.setStyles(styles);
        
        // resize the main element if labels are wider
        // because absolute positioning destroys dimensions
        var s = label[this._vert() ? "outerWidth" : "outerHeight"]();
        if (s > this.__size) {
            this.__size = s;
            this.element[this._vert() ? "outerWidth" : "outerHeight"](s);
        }
        return this;
    },
    
    // HELPERS & STUFF
    _check_label: function (iter, step) {
        // test if a label can be draw at a position and trigger drawing if so
        for (var i = this.options.levels.length - 1; i >= 0; i--) {
            var level = this.options.levels[i];
            var diff = Math.abs(this.options.base - iter);
            var itpos = this._val2px(iter); // px of the iter
            var diffpos = Math.abs(this.___last - itpos) // px between __last and iter
            //console.log("check_label", iter, step, level, diff, itpos, diffpos, this.__last, this.___last, !(diff % level), level >= Math.abs(this.__last - iter), i == this.options.levels.length - 1, diffpos >= this.options.gap_labels);
            if (!(diff % level) // do we hit a value on the actually tested level?
            && (level >= Math.abs(this.__last - iter) // we are at least $level away from last label
                || i == this.options.levels.length - 1) // or the actaully tested level is max level
            && diffpos >= this.options.gap_labels // and the drawing position is more distant from the last one than gap_label
            && itpos >= this.options.gap_labels
            ) {
                if (iter > this.options.min && iter < this.options.max) { // don't draw if we hit max or min
                    this.draw_label(iter);
                    this.draw_dot(iter, "toolkit-marker");
                }
                return i; // return the level where level was hit
            }
        }
        return false; // return false if we didn't draw anything
    },
    _check_dots: function (start, stop, step, level, comp) {
        // test if dots can be drawn between two positions and trigger drawing
        var iter = start;
        while (comp(iter, stop - step)) {
            iter += step;
            for (var i = level - 1; i >= 0; i--) {
                var l = this.options.levels[i];
                var diff = Math.abs(start - iter);
                if (!(diff % l)
                && this._val2px(Math.abs(start - iter)
                    + this.options.min) >= this.options.gap_dots
                && this._val2px(iter) >= this.options.gap_dots) {
                    this.draw_dot(iter);
                    start = iter;
                }
            }
        }
    },
    _val2px: function (value) {
        // returns a positions according to a value without taking
        // options.reverse into account
        return this.options.reverse ?
            this.options.basis - this.val2px(value) : this.val2px(value);
    },
    _vert: function () {
        // returns true if the meter is drawn vertically
        return this.options.layout == _TOOLKIT_LEFT
            || this.options.layout == _TOOLKIT_RIGHT;
    },
    
    // GETTER & SETTER
    set: function (key, value, hold) {
        this.options[key] = value;
        switch (key) {
            case "division":
            case "levels":
            case "labels":
            case "gap_dots":
            case "gap_labels":
            case "show_labels":
                this.fireEvent("scalechanged", this)
                if (!hold) this.redraw();
                break;
            case "basis":
                this.element.style[this._vert() ? "height" : "width"] = value + "px";
                break;
            case "base":
                if (value === false) {
                    this.options.base = this.options.min;
                    this.__based = false;
                } else {
                    this.__based = true;
                }
                this.fireEvent("basechanged", [value, this]);
                if (!hold) this.redraw();
                key = false;
                break;
            case "show_min":
            case "show_max":
            case "show_base":
                if (!hold) this.redraw();
        }
        this.parent(key, value, hold);
        return this;
    }
});