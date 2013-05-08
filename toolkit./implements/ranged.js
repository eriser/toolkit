/*******************************************************************************
 * toolkit. by Junger
 * 
 * This toolkit provides different widgets, implements and modules for building
 * audio based applications in webbrowsers.
 * 
 * Concept and realization by Markus Schmidt <schmidt@boomshop.net> for:
 * 
 * Jünger Audio GmbH
 * Justus-von-Liebig-Straße 7
 * 12489 Berlin · Germany
 * Tel: +49 30 67 77 21 0
 * http://junger-audio.com
 * info@junger-audio.com
 * 
 * toolkit. relies on mootools: http://mootools.net/
 * 
 * There is no license by now - all rights reserved. Hope we can fix this major
 * bug soon.
 ******************************************************************************/

Ranged = new Class({
    // Ranged provides stuff for calculating linear scales from different values.
    // It is useful to build coordinate systems, calculating pixel positions
    // for different scale types and the like. Ranged is used e.g. in Scale,
    // MeterBase and Graph to draw elements on a certain position according to
    // a value on an arbitrary scale. Range implements AudioMath, Options and
    // Events.
    Implements: AudioMath,
    __options: {
        scale:          _TOOLKIT_LINEAR, // What kind of value are we having?
                                         // _TOOLKIT_LINEAR
                                         // _TOOLKIT_DECIBEL / _TOOLKIT_LOG2
                                         // _TOOLKIT_FREQUENCY / _TOOLKIT_LOG10
                                         // function (value, options, coef) {}
                                         // 
                                         // If a function instead of a constant
                                         // is handed over, it receives the
                                         // actual options object as the second
                                         // argument and is supposed to return a
                                         // coefficient between 0 and 1. If the
                                         // third argument "coef" is true, it is
                                         // supposed to return a value depending
                                         // on a coefficient handed over as the 
                                         // first argument.
        reverse:        false,           // true if the range is reversed
        basis:          0,               // Dimensions of the range, set to
                                         // width/height in pixels, if you need
                                         // it for drawing purposes, to 100 if
                                         // you need percentual values or to 1
                                         // if you just need a linear
                                         // coefficient for a e.g. logarithmic
                                         // scale.
        min:            0,               // Minimum value of the range
        max:            0,               // Maximum value of the range
        step:           0,               // Step size, needed for e.g. user
                                         // interaction
        shift_up:       4,               // Multiplier for e.g. SHIFT pressed
                                         // while stepping
        shift_down:     0.25,            // Multiplier for e.g. SHIFT + CONTROL
                                         // pressed while stepping
        snap:           0,               // Snap the value to a virtual grid
                                         // with this distance
                                         // Using snap option with float values
                                         // causes the range to reduce its
                                         // minimum and maximum values depending
                                         // on the amount of decimal digits
                                         // because of the implementation of
                                         // math in JavaScript.
                                         // Using a step size of e.g. 1.125
                                         // reduces the maximum usable value
                                         // from 9,007,199,254,740,992 to
                                         // 9,007,199,254,740.992 (note the
                                         // decimal point)
        round:          false            // if snap is set decide how to jump
                                         // between snaps. Setting this to true
                                         // slips to the next snap if the value
                                         // is more than on its half way to it.
                                         // Otherwise the value has to reach the
                                         // next snap until it is hold there
                                         // again.
    },
    __minlog: 0,
    __maxlog: 0,
    __snapcoef: 1,
    
    val2real: function (n) {
        // calculates "real world" values (positions, coefficients, ...)
        // depending on options.basis
        return this.val2based(n, this.options.basis);
    },
    real2val: function (n) {
        // returns a point on the scale for the "real world" value (positions,
        // coefficients, ...) based on options.basis
        return this.based2val(n, this.options.basis);
    },
    val2px: function (n) {
        // just a wrapper for having understandable code and backward
        // compatibility
        return this.val2based(n, this.options.basis);
    },
    px2val: function (n) {
        // just a wrapper for having understandable code and backward
        // compatibility
        return this.based2val(n, this.options.basis);
    },
    val2coef: function (n) {
        // calculates a coefficient for the value
        return this.val2based(n, 1);
    },
    coef2val: function (n) {
        // calculates a value from a coefficient
        return this.based2val(n, 1);
    },
    val2perc: function (n) {
        // calculates percents on the scale from a value
        return this.val2based(n, 100);
    },
    perc2val: function (n) {
        // calculates a value from percents of the scale
        return this.based2val(n, 100);
    },
    val2based: function (value, basis) {
        // takes a value and returns the corresponding point on the scale
        // according to basis
        if (typeof value == "undefined") value = this.options.value;
        basis = basis || 1;
        value = this.snap_value(value);
        var coef = 0;
        if (typeof this.options.scale == "function")
            coef = this.options.scale(value, this.options, false) * basis;
        switch (this.options.scale) {
            default:
            case _TOOLKIT_LINEAR:
                coef = ((((this.options.min - value) * -1)
                    / (this.options.max - this.options.min)) || 0) * basis;
                break;
            case _TOOLKIT_DB:
                coef = this.db2scale(
                       value, this.__minlog, this.__maxlog, basis);
                break;
            case _TOOLKIT_FREQ:
                coef = this.freq2scale(
                       value, this.__minlog, this.__maxlog, basis);
                break;
        }
        if (this.options.reverse) coef = -coef + basis;
        return coef;
    },
    based2val: function (coef, basis) {
        // takes a point on the scale according to basis and returns the
        // corresponding value
        basis = basis || 1;
        var value = 0;
        if (this.options.reverse) coef = -coef + basis;
        if (typeof this.options.scale == "function")
            value = this.options.scale(coef, this.options, true);
        switch (this.options.scale) {
            default:
            case _TOOLKIT_LINEAR:
                value = (coef / basis)
                    * (this.options.max - this.options.min) + this.options.min
                break;
            case _TOOLKIT_DB:
                value = this.scale2db(
                        coef, this.__minlog, this.__maxlog, basis);
                break;
            case _TOOLKIT_FREQ:
                value = this.scale2freq(
                        coef, this.__minlog, this.__maxlog, basis);
                break;
        }
        return this.snap_value(value);
    },
    snap_value: function (value) {
        // if snapping is enabled, snaps the value to the grid
        if (!this.options.snap) return value;
        var scoef = this.__snapcoef;
        var snap  = this.options.snap;
        var m = ((value * scoef) % (snap * scoef)) / scoef;
        return value + (this.options.round && (m > snap / 2.0) ? snap - m : -m);
    }
});