// Shorthand functions for events
hAzzle.Core.hover = function (fnOver, fnOut) {
    return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
};

hAzzle.each(['focus', 'blur'], function (evt) {
    hAzzle.Core[evt] = function () {
        return this.each(function (el) {
            return el[evt]();
        });
    }

});


hAzzle.each(('blur focus focusin focusout load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select submit keydown keypress keyup error contextmenu').split(' '), function (evt) {
    hAzzle.Core[evt] = function (delegate, fn) {
        return arguments.length > 0 ?
            this.on(evt, delegate, fn) :
            this.trigger(evt);
    };
});