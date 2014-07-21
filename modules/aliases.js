// Aliases for events.js

hAzzle.each(('blur focus focusin focusout load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select submit keydown keypress keyup error contextmenu').split(' '), function (evt) {
    hAzzle.Core[evt] = function (delegate, fn) {
        return arguments.length > 0 ?
            this.on(evt, delegate, fn) :
            this.trigger(evt);
    };
});

hAzzle.extend({

    hover: function (fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    },

    focus: function () {
        return this.each(function (el) {
            return el.focus();
        });

    },
    blur: function () {
        return this.each(function (el) {
            return el.blur();
        });
    }
});