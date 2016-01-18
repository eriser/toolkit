 /* toolkit provides different widgets, implements and modules for 
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
"use strict";
(function(w){
function dragstart(e, drag) {
    var O = this.options;
    if (!O.active) return;
    var E = O.node;
    this._xstart = e.pageX;
    this._ystart = e.pageY;
    this._xsize  = E.offsetWidth;
    this._ysize  = E.offsetHeight;
    this._xpos   = E.offsetLeft;
    this._ypos   = E.offsetTop;
    this.fire_event("resizestart", e);
}
function dragend(e, drag) {
    if (!this.options.active) return;
    this.fire_event("resizestop", e);
}
function dragging(e, drag) {
    var O = this.options;
    if (!O.active) return;
    var w = this._xsize + e.pageX - this._xstart;
    var h = this._ysize + e.pageY - this._ystart;
    if (O.min.x >= -1) w = Math.max(O.min.x, w);
    if (O.max.x >= -1) w = Math.min(O.max.x, w);
    if (O.min.y >= -1) h = Math.max(O.min.y, h);
    if (O.max.y >= -1) h = Math.min(O.max.y, h);
    O.node.style.width = w + "px";
    O.node.style.height = h + "px";
    
    this.fire_event("resizing", e, w, h);
}
function set_handle() {
    var h = this.options.handle;
    if (this.drag)
        this.drag.destroy();
    var range = new TK.Range({});
    this.drag = new TK.DragValue({ node: h,
        range: function () { return range; },
        onStartdrag  : dragstart.bind(this),
        onStopdrag   : dragend.bind(this),
        onDragging   : dragging.bind(this)
    });
}
w.TK.Resize = w.Resize = $class({
    // TK.Resize enables resizing of elements on the screen.
    _class: "Resize",
    Extends: TK.Widget,
    _options: Object.assign(Object.create(TK.Widget.prototype._options), {
        handle : "object",
        direction : "int",
        active : "boolean",
        min : "object",
        max : "object",
        node : "object",
    }),
    options: {
        node      : null,           // the element to resize
        handle    : null,           // a DOM node used as handle. if none set
                                    // element is used
        direction : _TOOLKIT_SE,    // _TOOLKIT_N, _TOOLKIT_S, _TOOLKIT_E, _TOOLKIT_W,
                                    // _TOOLKIT_NE, _TOOLKIT_SE, _TOOLKIT_SW, _TOOLKIT_NW,
        active    : true,           // set to false if resize is disabled
        min       : {x: -1, y: -1}, // object containing x and y determining minimum size
                                    // a value of -1 means no min
        max       : {x: -1, y: -1}, // object containing x and y determining maximum size
                                    // a value of -1 means no max
    },
    initialize: function (options) {
        TK.Widget.prototype.initialize.call(this, options);
        this.set("handle", this.options.handle);
    },
    // GETTERS & SETTERS
    set: function (key, value) {
        TK.Widget.prototype.set.call(this, key, value);
        switch (key) {
            case "handle":
                if (!value)
                    this.options.handle = this.options.node;
            case "handle":
            case "direction":
                set_handle.call(this);
                break;
        }
    }
});
})(this);
