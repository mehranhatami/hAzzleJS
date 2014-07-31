// Transition

hAzzle.cssHooks.transformOrigin = {
    get: function(elem) {
        return elem.style[cssSupport.transformOrigin];
    },
    set: function(elem, value) {
        elem.style[cssSupport.transformOrigin] = value;
    }
};

hAzzle.cssHooks.transition = {
    get: function(elem) {
        return elem.style[cssSupport.transition];
    },
    set: function(elem, value) {
        elem.style[cssSupport.transition] = value;
    }
};
hAzzle.cssHooks.filter = {
    get: function(elem) {
        return elem.style[support.filter];
    },
    set: function(elem, value) {
        elem.style[cssSupport.filter] = value;
    }
};


// Margin and padding cssHooks

hAzzle.each(['margin', 'padding'], function(hook) {

    hAzzle.cssHooks[hook] = {
        get: function(elem) {
            return hAzzle.map(directions, function(dir) {
                return hAzzle.css(elem, hook + dir);
            }).join(' ');
        },
        set: function(elem, value) {
            var parts = value.split(/\s/),
                values = {
                    'Top': parts[0],
                    'Right': parts[1] || parts[0],
                    'Bottom': parts[2] || parts[0],
                    'Left': parts[3] || parts[1] || parts[0]
                };
            hAzzle.each(directions, function(dir) {
                elem.style[hook + dir] = values[dir];
            });
        }



    }
});

// BackgroundPositionXY cssHooks

if (hAzzle.BackgroundPositionXY) {

    hAzzle.cssHooks.backgroundPosition = {
        get: function(elem, computed, extra) {
            return hAzzle.map(['X', 'Y'], function(l, i) {
                return hAzzle.css(elem, 'backgroundPosition' + l);
            }).join(' ');
        },
        set: function(elem, value) {
            hAzzle.each(['X', 'Y'], function(l) {
                var values = parseBgPos(value);
                elem.style['backgroundPosition' + l] = values[l];
            });
        }
    }
}


var win = this,
    pxchk = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i;


if (!hAzzle.pixelPosition) {

    hAzzle.each(["top", "left", "bottom", "right"], function(prop) {
        hAzzle.cssHooks[prop] = {
            get: function(elem, computed) {
                var elStyles = hAzzle.computeStyle(elem);
                if (computed) {
                    computed = curCSS(elem, prop);
                    // if curCSS returns percentage, fallback to offset
                    if (pxchk.test(computed)) {
                        // Since we can't handle right and bottom with offset, let's work around it
                        var elemPosition = hAzzle(elem).position();
                        if (prop === "bottom") {
                            return elemPosition.top + parseFloat(elStyles.height) + "px";
                        } else if (prop === "right") {
                            return elemPosition.left + parseFloat(elStyles.width) + "px";
                        }
                        return elemPosition[prop] + "px";
                    }
                    return computed;
                }
            }
        }
    });
}

/* ============================ UTILITY METHODS =========================== */

function parseBgPos(bgPos) {
    var parts = bgPos.split(/\s/),
        values = {
            'X': parts[0],
            'Y': parts[1]
        };
    return values;
}