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
(function(w, TK) {
TK.Range = TK.class({
    /**
    * TK.Range is used for calculating linear scales from
    * different values. They are useful to build coordinate systems,
    * calculate pixel positions for different scale types and the like.
    * TK.Range is used e.g. in {@link TK.Scale}, {@link TK.MeterBase} and {@link TK.Graph} to draw
    * elements on a certain position according to a value on an
    * arbitrary scale.
    * 
    * @class TK.Range
    * 
    * @extends TK.Base
    * 
    * @mixes TK.Ranged
    * 
    * @param {Object} options
    * 
    * @property {string} [options.scale="linear"] - What kind of value are we working with?
    *   <ul><li>"linear"</li>
    *   <li>"decibel" / "log2"</li>
    *   <li>"frequency" </li>
    *   <li>function (value, options, coef) {}</li></ul>
    *   If a function instead of a constant
    *   is handed over, it receives the
    *   actual options object as the second
    *   argument and is supposed to return a
    *   coefficient between 0 and 1. If the
    *   third argument "coef" is true, it is
    *   supposed to return a value depending
    *   on a coefficient handed over as the 
    *   first argument.
    * @property {boolean} [options.reverse=false] - true if the range is reversed.
    * @property {number} [options.basis=0] - Dimensions of the range, set to
    *   width/height in pixels, if you need
    *   it for drawing purposes, to 100 if
    *   you need percentual values or to 1
    *   if you just need a linear
    *   coefficient for a e.g. logarithmic
    *   scale.
    * @property {number} [options.min=0] - The minimum value possible.
    * @property {number} [options.max=0] - The maximum value possible.
    * @property {number} [options.step=1] - Step size, needed for e.g. user
    *   interaction
    * @property {number} [options.shift_up=4] - Multiplier for e.g. SHIFT pressed
    *   while stepping
    * @property {number} [options.shift_down=0.25] - Multiplier for e.g. SHIFT + CONTROL
    *   pressed while stepping
    * @property {mixed} [options.snap=0] - Snap the value to a virtual grid
    *   with this distance
    *   Using snap option with float values
    *   causes the range to reduce its
    *   minimum and maximum values depending
    *   on the amount of decimal digits
    *   because of the implementation of
    *   math in JavaScript.
    *   Using a step size of e.g. 1.125
    *   reduces the maximum usable value
    *   from 9,007,199,254,740,992 to
    *   9,007,199,254,740.992 (note the
    *   decimal point)
    * @property {boolean} [options.round=false] - if snap is set decide how to jump
    *   between snaps. Setting this to true
    *   slips to the next snap if the value
    *   is more than on its half way to it.
    *   Otherwise the value has to reach the
    *   next snap until it is hold there
    *   again.
     */
    Extends : TK.Base,
    _class: "Range",
    Implements: [TK.Ranged],
    _options: {
        scale: "string",
        reverse: "boolean",
        basis: "number",
        min: "number",
        max: "number",
        step: "number",
        shift_up: "number",
        shift_down: "number",
        snap: "mixed",
        round: "boolean",
    },
    options: {
        scale:      "linear",
        reverse:    false,
        basis:      0,
        min:        0,
        max:        0,
        step:       1,
        shift_up:   4, 
        shift_down: 0.25, 
        snap:       0, 
        round:      false 
    },
});
})(this, this.TK);
