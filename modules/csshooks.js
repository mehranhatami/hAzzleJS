// cssHooks.js
var directions = ['Top', 'Right', 'Bottom', 'Left'];

hAzzle.assert(function(div) {

    var style = div.style;

    // BackgroundPositionXY 

    hAzzle.applyCSSSupport('borderImage', div.style.backgroundPositionX !== null);

    // BorderImage support
    hAzzle.applyCSSSupport('borderImage', style.borderImage !== undefined ||
        style.MozBorderImage !== undefined ||
        style.WebkitBorderImage !== undefined ||
        style.msBorderImage !== undefined);
    // BoxShadow

    hAzzle.applyCSSSupport('boxShadow', style.BoxShadow !== undefined ||
        style.MsBoxShadow !== undefined ||
        style.WebkitBoxShadow !== undefined ||
        style.OBoxShadow !== undefined);

    // textShadow support

    hAzzle.applyCSSSupport('textShadow', (style.textShadow === ''));
});

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
    };
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
    };
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