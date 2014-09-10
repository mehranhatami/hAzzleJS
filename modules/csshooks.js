var pxchk = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
    tProps = 'Property Duration TimingFunction'.split(' '),
    BRdirs = 'TopLeft TopRight BottomRight BottomLeft'.split(' '),
    directions = ['Top', 'Right', 'Bottom', 'Left'],
    xy = ['X', 'Y'];

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

if (!hAzzle.cssCore.has['api-pixelPosition']) {
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

// Transitions 

if (hAzzle.cssCore.transition) {
    hAzzle.cssHooks.transition = {
        get: function(elem) {
            return hAzzle.map(tProps, function(prop) {
                return hAzzle.css(elem, hAzzle.cssCore.transition + prop);
            }).join(' ');
        },
        set: function(elem, value) {
            elem.style[hAzzle.cssCore.transition] = value;
        }
    };

    hAzzle.each(tProps, function(prop) {
        hAzzle.cssHooks['transition' + prop] = {
            get: function(elem) {
                return hAzzle.css(elem, hAzzle.cssCore.transition + prop);
            },
            set: function(elem, value) {
                elem.style[hAzzle.cssCore.transition + prop] = value;
            }
        };
    });
}

// BorderImage	

if (hAzzle.cssCore.borderImage) {
    hAzzle.cssHooks.borderImage = {
        get: function(elem) {
            return hAzzle.css(elem, hAzzle.cssCore.borderImage);
        },
        set: function(elem, value) {
            elem.style[hAzzle.cssCore.borderImage] = value;
        }
    };
}


// BorderRadius

function borderCornerRadius(direction, prefix) {
    prefix = prefix === undefined || prefix === '' ? 'border' : prefix + 'Border';
    if (hAzzle.cssCore.borderRadius) {
        // e.g. MozBorderRadiusTopleft
        return prefix + 'Radius' + direction.charAt(0).toUpperCase() + direction.substr(1).toLowerCase();
    } else {
        // e.g. WebKitBorderTopLeftRadius, borderTopLeftRadius, etc
        return prefix + direction + 'Radius';
    }
}

if (hAzzle.cssCore.borderRadius) {
    var vendor_prefix = hAzzle.cssCore.borderRadius.replace('BorderRadius', '');
    hAzzle.cssHooks.borderRadius = {
        get: function(elem) {
            // return each of the directions, topleft, topright, bottomright, bottomleft
            return hAzle.map(BRdirs, function(dir) {
                return hAzzle.css(elem, borderCornerRadius(dir, vendor_prefix));
            }).join(' ');
        },
        set: function(elem, value) {
            // takes in a single value or shorthand (just letting the browser handle this) 
            // e.g. 5px to set all, or 5px 0 0 5px to set left corners
            elem.style[borderCornerRadius('', vendor_prefix)] = value;
        }
    };

    hAzzle.each(BRdirs, function(dir) {
        hAzzle.cssHooks['borderRadius' + dir] = {
            get: function(elem) {
                return hAzzle.css(elem, borderCornerRadius(dir, vendor_prefix));
            },
            set: function(elem, value) {
                elem.style[borderCornerRadius(dir, vendor_prefix)] = value;
            }
        };
    });
}

// Transform

hAzzle.cssHooks.transform = {
    get: function(elem) {
        return hAzzle.curCSS(elem, hAzzle.cssCore.transform);
    },
    set: function(elem, value) {
        elem.style[hAzzle.cssCore.transform] = value;
    }

};


// Column

hAzzle.each('Span Count Gap Width RuleColor RuleStyle RuleWidth'.split(' '), function(prop) {
    hAzzle.cssHooks['column' + prop] = {
        get: function(elem) {
            return hAzzle.css(elem, hAzzle.cssCore['column' + prop]);
        },
        set: function(elem, value) {
            elem.style[hAzzle.cssCore['column' + prop]] = value;
        }
    };
});


// boxReflect
// Firefox dosen't support this property

if (hAzzle.cssCore.boxReflect) {

    hAzzle.cssHooks.boxReflect = {
        get: function(elem) {
            return hAzzle.css(elem, hAzzle.support.boxReflect);
        },
        set: function(elem, value) {
            elem.style[hAzzle.cssCore.boxReflect] = value;
        }
    };
}

// Helper function to parse out the X and Y values from backgroundPosition

function parseBgPos(bgPos) {
    var parts = bgPos.split(/\s/),
        values = {
            'X': parts[0],
            'Y': parts[1]
        };
    return values;
}

if (hAzzle.cssCore.backgroundPosition) {
    hAzzle.each(xy, function(l) {
        hAzzle.cssHooks['backgroundPosition' + l] = {
            get: function(elem) {
                var values = parseBgPos(hAzzle.css(elem, 'backgroundPosition'));
                return values[l];
            },
            set: function(elem, value) {
                var values = parseBgPos(hAzzle.css(elem, 'backgroundPosition')),
                    isX = l === 'X';
                elem.style.backgroundPosition = (isX ? value : values.X) + ' ' +
                    (isX ? values.Y : value);
            }
        };
        hAzzle.fxAfter['backgroundPosition' + l] = {
            set: function(fx) {
                hAzzle.cssHooks['backgroundPosition' + l].set(fx.elem, fx.pos + fx.unit);
            }
        };
    });
}