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
 
Anchor = new Class({
    translate_anchor: function (anchor, x, y, width, height) {
        switch (anchor) {
            case _TOOLKIT_TOP_LEFT:
                break;
            case _TOOLKIT_TOP:
                x += width / 2;
                break;
            case _TOOLKIT_TOP_RIGHT:
                x += width;
                break;
            case _TOOLKIT_LEFT:
                y += height / 2;
                break;
            case _TOOLKIT_CENTER:
                x += width / 2;
                y += height / 2;
                break;
            case _TOOLKIT_RIGHT:
                x += width;
                y += height / 2;
                break;
            case _TOOLKIT_BOTTOM_LEFT:
                y += height;
                break;
            case _TOOLKIT_BOTTOM:
                x += width / 2;
                y += height;
                break;
            case _TOOLKIT_BOTTOM_RIGHT:
                x += width;
                y += height;
                break;
        }
        return {x: Math.round(x), y: Math.round(y)};
    }
});