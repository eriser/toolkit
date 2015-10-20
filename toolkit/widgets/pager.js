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
function do_scroll(n) {
    var O = this.options;
    var page = this.pages[n];

    var dir  = this.options.direction == _TOOLKIT_VERTICAL;
    var size = dir ? this.__page_height : this.__page_width;
    this._container.style[dir ? 'top' : 'left'] = (-size * n) + "px";
    this._container.style[dir ? 'left' : 'top'] = null;
}
w.Pager = $class({
    /* Pager, also known as Notebook in other UI toolkits, provides
       multiple containers for displaying contents which are switchable
       via a ButtonArray. */
    _class: "Pager",
    Extends: Container,
    options: {
        position:  _TOOLKIT_TOP,      // the default position of the ButtonArray
        direction: _TOOLKIT_VERTICAL, // the direction of the pages
        pages:     [],                // an array of mappings (objects) containing
                                      // the members "label" and "content". label
                                      // is a string for the buttons label or an
                                      // object containing options for a button
                                      // and content is a string containing HTML
                                      // or a ready-to-use DOM node, e.g.
                                      // [{label: "Empty Page 1", content: document.createElement("span")},
                                      //  {label: {label:"Foobar", class:"foobar"}, content: "<h1>Foobar</h1><p>Lorem ipsum dolor sit amet</p>"}]
        show:      -1,                // the page to show
        overlap:   false              // if true pages aren't resized so
                                      // the buttonarray overlaps the contents
    },
    
    initialize: function (options) {
        this.pages = [];
        Container.prototype.initialize.call(this, options);
        this.element.className += " toolkit-pager";
        this.buttonarray = new ButtonArray({
            container: this.element,
            onchanged: function(button, n) {
                this.set("show", n); 
            }.bind(this),
        });
        this.register_children(this.buttonarray);
        this._clip      = TK.element("div", "toolkit-clip");
        this._container = TK.element("div", "toolkit-container");
        this._clip.appendChild(this._container);
        this._pagestyle = TK.element("style");
        this._pagestyle.setAttribute("type", "text/css");
        this.element.appendChild(this._pagestyle);
        this.add_pages(this.options.pages);
        this.element.appendChild(this._clip);
        this.set("position", this.options.position);
    },
    
    redraw: function () {
        Container.prototype.redraw.call(this);
        var O = this.options;
        var I = this.invalid;
        var E = this.element;

        if (I.position) {
            TK.remove_class(E, "toolkit-top");
            TK.remove_class(E, "toolkit-right");
            TK.remove_class(E, "toolkit-bottom");
            TK.remove_class(E, "toolkit-left");
            switch (O.position) {
                case _TOOLKIT_TOP:
                    TK.add_class(E, "toolkit-top");
                    break;
                case _TOOLKIT_BOTTOM:
                    TK.add_class(E, "toolkit-bottom");
                    break;
                case _TOOLKIT_LEFT:
                    TK.add_class(E, "toolkit-left");
                    break;
                case _TOOLKIT_RIGHT:
                    TK.add_class(E, "toolkit-right");
                    break;
            }
        }

        if (I.direction) {
            TK.remove_class(E, "toolkit-vertical");
            TK.remove_class(E, "toolkit-horizontal");
            TK.add_class(E, O.direction == _TOOLKIT_VERT ? "toolkit-vertical" : "toolkit-horizontal");
        }

        if (I.validate("position", "overlap")) {
            /* FORCE_RELAYOUT */
            if (O.overlap) {
                this._clip.style.width = "";
                this._clip.style.height = "";
            } else {
                switch (O.position) {
                    case _TOOLKIT_TOP:
                    case _TOOLKIT_BOTTOM:
                        TK.outer_height(this._clip, true,
                            TK.inner_height(this.element)
                          - TK.outer_height(this.buttonarray.element, true));
                        break;
                    case _TOOLKIT_LEFT:
                    case _TOOLKIT_RIGHT:
                        TK.outer_width(this._clip, true,
                            TK.inner_width(this.element)
                          - TK.outer_width(this.buttonarray.element, true));
                        break;
                }
            }
            var n = TK.inner_width(this._clip);
            this.__page_width = n;
            this.__page_height = TK.inner_height(this._clip);

            /* force the below drawing */
            I.direction = true;
            I.show = true;
        }

        if (I.validate("direction")) {
            var style;
            switch (O.direction) {
                case _TOOLKIT_VERT:
                    style = "#" + O.id + " > .toolkit-clip > .toolkit-container > .toolkit-page {\n";
                    style += "    height: " + this.__page_height + "px;\n}";
                    break;
                case _TOOLKIT_HORIZ:
                    style = "#" + O.id + " > .toolkit-clip > .toolkit-container > .toolkit-page {\n";
                    style += "    width: " + this.__page_width + "px;\n}";
                    break;
            }
            TK.set_text(this._pagestyle, style);
            I.show = true;
        }

        if (I.show) {
            I.show = false;

            do_scroll.call(this, O.show);
        }
    },
    
    add_pages: function (options) {
        for (var i = 0; i < options.length; i++)
            this.add_page(options[i].label, options[i].content);
    },
    
    add_page: function (button, content, pos, options) {
        var p;
        if (typeof button === "string")
            button = {label: button};
        this.buttonarray.add_button(button, pos);
        if (!options) {
            options = {};
        }
        options["class"] = "toolkit-page";

        if (typeof content === "string") {
            options.content = content;
            p = new Container(options);
        } else {
            // assume here content is a subclass of Container
            p = new content(options);
        }

        this.register_children(p);

        var len = this.options.pages.length;

        if (pos == len || typeof pos == "undefined") {
            this.pages.push(p);
            this._container.appendChild(p.element);
        } else {
            this.pages.splice(pos, 0, p);
            this._container.insertBefore(p.element, this._container.childNodes[pos]);
        }
        this.fire_event("added", p);
        return p;
        //var sb = b.element.getBoundingClientRect()[vert ? "height" : "width"];
    },

    fire_event : function(type) {
        if (type == "show" || type == "hide") {
            var page = this.current();
            // hide and show are only for the active page and the button array
            // and this widget itself
            this.buttonarray.fire_event(type);
            if (page) page.fire_event(type);
            BASE.prototype.fire_event.apply(this, arguments);
        } else Container.prototype.fire_event.apply(this, arguments);
    },

    remove_page: function (page) {
        if (typeof page == "object")
            page = this.pages.indexOf(page);
        if (page < 0 || page >= this.pages.length)
            return;
        this.fire_event("removed", this.pages[page]);
        this.buttonarray.remove_button(page);
        if (this.current() && page < this.options.show) {
            this.options.show--;
            this.invalid.show = true;
            this.trigger_draw();
        }
        this.pages[page].destroy();
        this.pages.splice(page, 1);
        this.remove_children(this.pages[page]);
    },
    
    resize: function () {
        this.redraw();
        this._scroll_to(this.options.show, true); 
    },

    current: function() {
        var n = this.options.show;
        if (n >= 0 && n < this.pages.length) {
            return this.pages[n];
        }
        return null;
    },
    
    set: function (key, value, hold) {
        var page;
        if (key === "show") {
            if (value < 0) value = 0;
            else if (value >= this.pages.length) value = this.pages.length - 1;

            if (value === this.options.show) return;

            page = this.current();

            if (page) {
                page.set("active", false);
                page.fire_event("hide");
                page.remove_class("toolkit-active");
            }

            this.buttonarray.set("show", value);
        }
        Container.prototype.set.call(this, key, value, hold);
        switch(key) {
            case "show":
                page = this.current();

                if (page) {
                    page.set("active", true);
                    page.add_class("toolkit-active");
                    page.fire_event("show");
                    this.fire_event("changed", page, value);
                }

                break;
            case "pages":
                if (hold)
                    break;
                for (var i = 0; i < this.pages.length; i++)
                    this.pages[i].destroy();
                this.pages = [];
                this.add_pages(value);
                break;
            case "position":
                var badir;
                if (value === _TOOLKIT_TOP || value === _TOOLKIT_BOTTOM) {
                    badir = _TOOLKIT_HORIZ;
                } else {
                    badir = _TOOLKIT_VERT;
                }
                this.buttonarray.set("direction", badir);
                break;
        }
    },
    get: function (key) {
        if (key == "pages") return this.pages;
        return Container.prototype.get.call(this, key);
    }
});
})(this);
