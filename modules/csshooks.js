var pxchk = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
    directions = ['Top', 'Right', 'Bottom', 'Left'];

// CssHooks for margin and padding 

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

if (!cssCore.has['api-pixelPosition']) {
    hAzzle.each(['top', 'left'], function(prop) {
        hAzzle.cssHooks[prop] = {
            get: function(elem, computed) {
                if (computed) {
                    computed = curCSS(elem, prop);
                    return pxchk.test(computed) ?
                        hAzzle(elem).position()[prop] + 'px' : computed;
                }
            }
        };
    });
}