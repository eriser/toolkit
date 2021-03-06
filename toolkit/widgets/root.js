/*
 * This file is part of toolkit.
 *
 * toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * toolkit is distributed in the hope that it will be useful,
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
(function(w, TK){
function visibility_change() {
    if (document.hidden) {
        this.disable_draw();
    } else {
        this.enable_draw();
    }
}
function resized() {
    if (!this.resize_event) {
        this.resize_event = true;
        this.trigger_resize();
    }
}
/**
 * @extends TK.Container
 * 
 * @class TK.Root
 */
TK.Root = TK.class({
    Extends: TK.Container,
    _class: "Root",
    _options: Object.create(TK.Container.prototype._options),
    static_events: {
        initialized: function () {
            w.addEventListener("resize", this._resize_cb);
            document.addEventListener("visibilitychange", this._visibility_cb, false);
            this.enable_draw();
        },
        destroy: function() {
            w.removeEventListener("resize", this._resize_cb);
            document.removeEventListener("visibilitychange", this._visibility_cb)
            this._resize_cb = this._visibility_cb = null;
        },
        redraw: function() {
            if (this.resize_event)
                this.resize_event = false;
        },
    },
    initialize: function (options) {
        TK.Container.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} TK.Root#element - The main DIV container.
         *   Has class <code>toolkit-root</code>.
         */
        TK.add_class(this.element, "toolkit-root");
        this._resize_cb = resized.bind(this);
        this._visibility_cb = visibility_change.bind(this);
        this.resize_event = false;
    },
});
})(this, this.TK);
