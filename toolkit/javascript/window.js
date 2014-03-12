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

is_touch = function () {
    return 'ontouchstart' in window // works on most browsers 
      || 'onmsgesturechange' in window; // works on ie10
}
os = function () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("android") > -1)
        return "Android";
    if (/iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua))
        return "iOS";
    if ((ua.match(/iPhone/i)) || (ua.match(/iPod/i)))
        return "iOS";
    if (navigator.appVersion.indexOf("Win")!=-1)
        return "Windows";
    if (navigator.appVersion.indexOf("Mac")!=-1)
        return "MacOS";
    if (navigator.appVersion.indexOf("X11")!=-1)
        return "UNIX";
    if (navigator.appVersion.indexOf("Linux")!=-1)
        return "Linux";
},
keep_inside = function (element, resize) {
    // we're calculating everything relative to the offsetParent
    // of element
    var ex = element.offsetLeft;
    var ey = element.offsetTop;
    var ew = element.offsetWidth;
    var eh = element.offsetHeight;
    var p  = element.offsetParent;
    var pw = p ? p.offsetWidth : width();
    var ph = p ? p.offsetHeight : height();
    if(resize) {
        if (ew > pw) element.style.width = pw + "px";
        if (eh > ph) element.style.height = ph + "px";
    }
    element.style.left = Math.min(Math.max(ex, 0), pw - ew);
    element.style.top  = Math.min(Math.max(ey, 0), ph - eh);
}
width = function () {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}
height = function () {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}
