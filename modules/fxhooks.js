//fxhooks.js
// scrollLeft / scollTop
hAzzle.fxHooks.scrollLeft = hAzzle.fxHooks.scrolTop = {
    set: function(fx) {
        if (fx.elem.nodeType && fx.elem.parentNode) {
            fx.elem[fx.prop] = fx.now;
        }
    }
};

// Opacity

hAzzle.fxHooks.opacity = {
    set: function(fx) {
        fx.elem.style.opacity = fx.now;
    }
};