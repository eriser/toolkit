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
/**
 * Ranges provides multiple {@link TK.Range} for a widget. They
 * can be used for building coordinate systems.
 *
 * @mixin TK.Ranges
 */
function range_changed(value, name) {
    var range = this[name];
    for (var i in value) {
        range.set(i, value[i]);
    }
}
TK.Ranges = TK.class({
    _class: "Ranges",
    /**
     * Add a new range. If name is set and this.options[name]
     * exists, is an object and from is an object, too, both are merged
     * before a range is created.
     *
     * @method TK.Ranges#add_range
     * 
     * @param {Function|Object} from - A function returning a {@link TK.Range}
     *   instance or an object containing options for a new {@link TK.Range}.
     * @param {string} name - Designator of the new #TK.Range.
     *   If a name is set a new set function is added to the item to
     *   set the options of the range. Use the set function like this:
     *   this.set("name", {key: value});
     * 
     * @emits TK.Ranges#rangeadded
     * 
     * @returns {TK.Range} The new range.
     */
    add_range: function (from, name) {
        var r;
        if (typeof from === "function") {
            r = from();
        } else if (TK.Ranged.prototype.isPrototypeOf(from)) {
            r = TK.Range(from.options);
        } else if (TK.Range.prototype.isPrototypeOf(from)) {
            r = from;
        } else {
            if (name
            && this.options[name]
            && typeof this.options[name] === "object")
                from = Object.assign({}, this.options[name], from)
            r = new TK.Range(from);
        }
        if (name) {
            this[name] = r;
            this.add_event("set_"+name, range_changed);
        }
        /**
         * Gets fired when a new range is added
         *
         * @event TK.Ranges#rangeadded
         * 
         * @param {TK.Range} range - The {@link TK.Range} that was added.
         */
        this.fire_event("rangeadded", r);
        return r;
    }
})
})(this, this.TK);
